/**
 * Browser Web Serial API (Chrome/Edge): list ports the user has already granted,
 * or prompt to pair a new USB/serial device. Printing still uses the server/agent;
 * this helps admins document COM paths on the machine running the browser.
 */

export type LocalSerialPortOption = {
  /** Suggested interface fragment (may still need Device Manager on Windows) */
  value: string;
  label: string;
};

export function supportsWebSerial(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator && !!(navigator as any).serial;
}

function formatSerialLabel(port: { getInfo?: () => { usbVendorId?: number; usbProductId?: number } }, index: number): string {
  try {
    const info = port.getInfo?.() ?? {};
    if (info.usbVendorId != null) {
      const vid = Number(info.usbVendorId).toString(16).padStart(4, '0');
      const pid =
        info.usbProductId != null
          ? Number(info.usbProductId).toString(16).padStart(4, '0')
          : '????';
      return `USB serial #${index + 1} (VID ${vid} · PID ${pid})`;
    }
  } catch {
    /* ignore */
  }
  return `Serial port #${index + 1}`;
}

/**
 * Refreshes the list of serial ports this origin is allowed to use (no system COM name in browser).
 */
export async function listGrantedSerialPorts(): Promise<LocalSerialPortOption[]> {
  if (!supportsWebSerial()) return [];
  const serial = (navigator as any).serial as {
    getPorts: () => Promise<Array<{ getInfo?: () => { usbVendorId?: number; usbProductId?: number } }>>;
  };
  const ports = await serial.getPorts();
  return ports.map((port, i) => ({
    value: `web-serial-${i}`,
    label: formatSerialLabel(port, i),
  }));
}

/**
 * Opens the browser device picker; user must choose a USB/serial device.
 */
export async function requestSerialPortAccess(): Promise<void> {
  if (!supportsWebSerial()) {
    throw new Error('Web Serial is not supported in this browser. Use Chrome or Edge.');
  }
  const serial = (navigator as any).serial as {
    requestPort: (opts?: { filters: unknown[] }) => Promise<unknown>;
  };
  await serial.requestPort({ filters: [] });
}
