import { Server as SocketIOServer } from 'socket.io';

interface NotifyJobInput {
  id: string;
  renderedTemplates: Array<{
    renderedContent: string;
  }>;
  printerInterface: string;
}

export class PrintJobNotifier {
  constructor(private readonly io: SocketIOServer) {}

  notify(restaurantId: string, job: NotifyJobInput): void {
    if (!restaurantId) return;

    const content = this.combineTemplates(job.renderedTemplates);

    this.io.to(`restaurant:${restaurantId}`).emit('print:job', {
      jobId: job.id,
      content,
      printerInterface: job.printerInterface,
    });
  }

  private combineTemplates(
    renderedTemplates: Array<{
      renderedContent: string;
    }>
  ): string {
    if (!Array.isArray(renderedTemplates) || renderedTemplates.length === 0) {
      return '';
    }

    if (renderedTemplates.length === 1) {
      return renderedTemplates[0].renderedContent;
    }

    const buffers = renderedTemplates.map((template) =>
      Buffer.from(template.renderedContent, 'base64')
    );

    return Buffer.concat(buffers).toString('base64');
  }
}
