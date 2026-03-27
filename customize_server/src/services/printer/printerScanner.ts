import { exec } from 'child_process';
import fs from 'fs';
import net from 'net';
import os from 'os';
import path from 'path';

/**
 * Checks if an IP address is reachable on a given port.
 */
function checkPort(host: string, port: number, timeoutMs: number = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.on('connect', () => {
      status = true;
      socket.destroy();
    });

    socket.on('timeout', () => {
      status = false;
      socket.destroy();
    });

    socket.on('error', () => {
      status = false;
    });

    socket.on('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
    socket.setTimeout(timeoutMs);
  });
}

/**
 * Returns a list of local IPv4 network interfaces.
 */
function getLocalSubnets(): { address: string; netmask: string }[] {
  const interfaces = os.networkInterfaces();
  const subnets: { address: string; netmask: string }[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        subnets.push({ address: iface.address, netmask: iface.netmask });
      }
    }
  }

  return subnets;
}

/**
 * Converts IP to numeric representation.
 */
function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Converts numeric representation to IP.
 */
function numToIp(num: number): string {
  return [num >>> 24, (num >> 16) & 255, (num >> 8) & 255, num & 255].join('.');
}

/**
 * Scans local network subnets for devices listening on a specific port (default 9100 for printers).
 */
export async function scanForPrinters(
  port: number = 9100,
  timeoutMs: number = 2000
): Promise<string[]> {
  const subnets = getLocalSubnets();
  const ipsToScan: string[] = [];

  for (const { address, netmask } of subnets) {
    const ipNum = ipToNum(address);
    const maskNum = ipToNum(netmask);
    const network = ipNum & maskNum;
    const broadcast = network | ~maskNum;

    // Standard /24 scan, to prevent huge scans on larger subnets we limit to /24 equivalent size
    // If it's larger than /24, we just scan the /24 range the IP is in.
    const maxHosts = 254;
    let startIp = network + 1;
    let endIp = broadcast - 1;

    if (endIp - startIp > maxHosts) {
      startIp = ipNum & 0xffffff00; // Force /24 based on the address
      startIp += 1;
      endIp = startIp + 253;
    }

    const startIpNum = startIp >>> 0;
    const endIpNum = endIp >>> 0;

    for (let i = startIpNum; i <= endIpNum; i++) {
      // Skip our own address
      if (i !== ipNum >>> 0) {
        ipsToScan.push(numToIp(i));
      }
    }
  }

  // To avoid exhausting system file descriptors or bandwidth, batch the scans
  const batchSize = 100;
  const foundPrinters: string[] = [];

  for (let i = 0; i < ipsToScan.length; i += batchSize) {
    const batch = ipsToScan.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (ip) => {
        const isPrinter = await checkPort(ip, port, timeoutMs);
        return isPrinter ? ip : null;
      })
    );
    foundPrinters.push(...(results.filter(Boolean) as string[]));
  }

  return foundPrinters;
}

/**
 * Maps to scanForPrinters, alias for LAN connections.
 */
export const scanLAN = scanForPrinters;

/**
 * Runs a short PowerShell script and returns non-empty lines.
 */
function execPowerShellLines(command: string): Promise<string[]> {
  return new Promise((resolve) => {
    exec(
      `powershell -NoProfile -Command "${command.replace(/"/g, '\\"')}"`,
      { maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          console.error('PowerShell scan error:', error);
          return resolve([]);
        }
        resolve(
          stdout
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        );
      }
    );
  });
}

/**
 * Scans for connected Bluetooth devices + COM/serial ports on the API host (Windows).
 */
export async function scanBluetooth(): Promise<string[]> {
  if (os.platform() !== 'win32') {
    console.warn('Bluetooth/COM scanning on this build is optimized for Windows API hosts.');
    return [];
  }

  const btPs =
    "Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'OK' } | Select-Object -ExpandProperty Name";
  const serialPs =
    "Get-CimInstance Win32_SerialPort -ErrorAction SilentlyContinue | ForEach-Object { '{0} ({1})' -f $_.DeviceID, $_.Description }";

  const [btLines, serialLines] = await Promise.all([
    execPowerShellLines(btPs),
    execPowerShellLines(serialPs),
  ]);

  const merged = [...btLines, ...serialLines];
  return [...new Set(merged)];
}

/** One serial/USB-style interface the API host can use for thermal printers */
export interface DiscoveredSerialPort {
  interface: string;
  label: string;
}

function extractComPort(line: string): string | null {
  const m = line.match(/COM\d+/i);
  return m ? m[0].toUpperCase() : null;
}

/**
 * List serial/COM/USB-virtual-COM ports on the machine running the API (not the admin browser).
 * Windows: WMI + PnP Ports; Linux: /dev/ttyUSB* / ttyACM*; macOS: tty.usb* / cu.usb*
 */
export async function discoverSerialPorts(): Promise<DiscoveredSerialPort[]> {
  const platform = os.platform();
  const byIface = new Map<string, string>();

  const add = (iface: string, label: string) => {
    const key = iface.trim();
    if (!key) return;
    if (!byIface.has(key)) byIface.set(key, label);
  };

  if (platform === 'win32') {
    const serialPs =
      'Get-CimInstance Win32_SerialPort -ErrorAction SilentlyContinue | ForEach-Object { $_.DeviceID + [char]9 + $_.Description }';
    const portsPs =
      'Get-PnpDevice -Class Ports -Status OK -ErrorAction SilentlyContinue | ForEach-Object { Write-Output $_.FriendlyName }';

    const [serialLines, friendlyLines] = await Promise.all([
      execPowerShellLines(serialPs),
      execPowerShellLines(portsPs),
    ]);

    for (const line of serialLines) {
      const tab = line.indexOf('\t');
      const id = (tab >= 0 ? line.slice(0, tab) : line).trim();
      const desc = tab >= 0 ? line.slice(tab + 1).trim() : '';
      if (/^COM\d+$/i.test(id)) {
        const iface = id.toUpperCase();
        add(iface, desc ? `${iface} — ${desc}` : iface);
      }
    }

    for (const line of friendlyLines) {
      const com = extractComPort(line);
      if (com && !byIface.has(com)) {
        add(com, line.trim());
      }
    }
  } else if (platform === 'linux') {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync('/dev');
    } catch {
      entries = [];
    }
    for (const n of entries) {
      if (
        n.startsWith('ttyUSB') ||
        n.startsWith('ttyACM') ||
        n.startsWith('ttyAMA') ||
        n === 'rfcomm0'
      ) {
        const iface = path.join('/dev', n);
        add(iface, iface);
      }
    }
  } else if (platform === 'darwin') {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync('/dev');
    } catch {
      entries = [];
    }
    for (const n of entries) {
      if (/^tty\.(usbmodem|usbserial)/.test(n)) {
        const iface = path.join('/dev', n);
        add(iface, iface);
      }
    }
  }

  return Array.from(byIface.entries())
    .map(([iface, label]) => ({ interface: iface, label }))
    .sort((a, b) => a.interface.localeCompare(b.interface));
}
