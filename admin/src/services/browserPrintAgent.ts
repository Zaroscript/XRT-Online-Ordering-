import { io, Socket } from 'socket.io-client';

interface PrintJobPayload {
  jobId: string;
  content: string; // Base64-encoded ESC/POS bytes
  printerInterface: string;
}

interface BrowserSerialWriter {
  write(data: Uint8Array): Promise<void>;
  releaseLock(): void;
}

interface BrowserSerialWritable {
  getWriter(): BrowserSerialWriter;
}

interface BrowserSerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: unknown | null;
  writable: BrowserSerialWritable | null;
}

interface BrowserSerial {
  requestPort(): Promise<BrowserSerialPort>;
}

class BrowserPrintAgentError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'BrowserPrintAgentError';
  }
}

class PrinterNotConnectedError extends BrowserPrintAgentError {
  constructor() {
    super('Printer is not connected. Call connectPrinter() first.');
    this.name = 'PrinterNotConnectedError';
  }
}

function normalizeServerUrl(serverUrl: string): string {
  return serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
}

function buildAckUrl(serverUrl: string, jobId: string): string {
  const base = normalizeServerUrl(serverUrl);
  return new URL(`/api/print-jobs/${encodeURIComponent(jobId)}/ack`, base).toString();
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (error: unknown) {
    throw new BrowserPrintAgentError('Invalid Base64 print payload.', error);
  }
}

export class BrowserPrintAgent {
  private readonly restaurantRoom: string;
  private readonly socket: Socket;
  private serialPort: BrowserSerialPort | null = null;
  private isDisconnected = false;

  constructor(
    private readonly restaurantId: string,
    private readonly serverUrl: string
  ) {
    this.restaurantRoom = `restaurant:${restaurantId}`;
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      autoConnect: true,
    });
    this.initialize();
  }

  private initialize(): void {
    this.socket.on('connect', () => {
      this.socket.emit('join', this.restaurantRoom);
    });

    this.socket.on('print:job', async (job: PrintJobPayload) => {
      try {
        await this.handlePrintJob(job);
      } catch (error: unknown) {
        const typedError =
          error instanceof Error
            ? error
            : new BrowserPrintAgentError('Unhandled print job error.', error);
        // eslint-disable-next-line no-console
        console.error('[BrowserPrintAgent] print:job failed', typedError);
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('[BrowserPrintAgent] socket connect_error', error);
    });
  }

  async connectPrinter(): Promise<void> {
    try {
      const serialApi = (navigator as Navigator & { serial?: BrowserSerial }).serial;
      if (!serialApi) {
        throw new BrowserPrintAgentError('Web Serial API is not available in this browser.');
      }

      if (this.serialPort) {
        return;
      }

      const port = await serialApi.requestPort();
      await port.open({ baudRate: 9600 });
      this.serialPort = port;
    } catch (error: unknown) {
      if (error instanceof BrowserPrintAgentError) {
        throw error;
      }
      throw new BrowserPrintAgentError('Failed to connect to printer.', error);
    }
  }

  async disconnect(): Promise<void> {
    this.isDisconnected = true;
    try {
      this.socket.removeAllListeners('print:job');
      this.socket.removeAllListeners('connect');
      this.socket.removeAllListeners('connect_error');
      this.socket.disconnect();
    } catch (error: unknown) {
      throw new BrowserPrintAgentError('Failed to disconnect socket cleanly.', error);
    } finally {
      if (this.serialPort) {
        try {
          await this.serialPort.close();
        } catch (error: unknown) {
          throw new BrowserPrintAgentError('Failed to close serial port cleanly.', error);
        } finally {
          this.serialPort = null;
        }
      }
    }
  }

  private async handlePrintJob(job: PrintJobPayload): Promise<void> {
    if (!job || !job.jobId || !job.content) {
      throw new BrowserPrintAgentError('Received malformed print job payload.');
    }
    if (!this.serialPort || !this.serialPort.writable) {
      throw new PrinterNotConnectedError();
    }
    if (this.isDisconnected) {
      throw new BrowserPrintAgentError('Agent is disconnected.');
    }

    try {
      const bytes = decodeBase64ToBytes(job.content);
      const writer = this.serialPort.writable.getWriter();
      try {
        await writer.write(bytes);
      } finally {
        writer.releaseLock();
      }
      await this.acknowledgeJob(job.jobId);
    } catch (error: unknown) {
      if (error instanceof BrowserPrintAgentError) {
        throw error;
      }
      throw new BrowserPrintAgentError(
        `Failed to process print job ${job.jobId} for interface ${job.printerInterface}.`,
        error
      );
    }
  }

  private async acknowledgeJob(jobId: string): Promise<void> {
    const ackUrl = buildAckUrl(this.serverUrl, jobId);
    try {
      const response = await fetch(ackUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new BrowserPrintAgentError(
          `ACK failed with status ${response.status} for job ${jobId}.`
        );
      }

      const payload: unknown = await response.json();
      const ok =
        typeof payload === 'object' &&
        payload !== null &&
        'ok' in payload &&
        (payload as { ok?: boolean }).ok === true;

      if (!ok) {
        throw new BrowserPrintAgentError(`ACK response missing ok=true for job ${jobId}.`);
      }
    } catch (error: unknown) {
      if (error instanceof BrowserPrintAgentError) {
        throw error;
      }
      throw new BrowserPrintAgentError(`Failed to ACK print job ${jobId}.`, error);
    }
  }
}
