import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import { usePrinterLogsByPrinterQuery } from '@/data/printer-log';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import type { PrinterLogRow } from '@/data/client/printer-log';
import { CloseIcon } from '@/components/icons/close-icon';
import type { Printer } from '@/data/client/printer';
import cn from 'classnames';

type Props = {
  printer: Printer | null;
  open: boolean;
  onClose: () => void;
};

function levelClass(level: string): string {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'warn':
      return 'text-amber-300';
    case 'success':
      return 'text-accent';
    default:
      return 'text-cyan-300';
  }
}

function formatLine(log: PrinterLogRow): string {
  const ts = log.created_at
    ? new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)
    : '????-??-?? ??:??:??';
  const order =
    log.order_number != null && log.order_number !== ''
      ? ` order=${log.order_number}`
      : '';
  const job =
    log.print_job_id != null && log.print_job_id !== ''
      ? ` job=${log.print_job_id.slice(-8)}`
      : '';
  const err = log.error ? ` :: ${log.error}` : '';
  return `[${ts}] [${log.level.toUpperCase()}] ${log.event_type} | ${log.message}${order}${job}${err}`;
}

export default function PrinterTerminalLogModal({ printer, open, onClose }: Props) {
  const scrollRef = useRef<HTMLPreElement>(null);
  const queryClient = useQueryClient();
  const printerId = printer?.id ?? null;

  const { data, isLoading, isFetching, error, refetch } = usePrinterLogsByPrinterQuery(
    printerId,
    { enabled: open && !!printerId, limit: 150 },
  );

  const lines = useMemo(() => {
    const items = data?.items ?? [];
    // Newest at bottom (terminal-style tail)
    return [...items].reverse();
  }, [data?.items]);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight;
  }, [open, lines.length, isFetching]);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: [API_ENDPOINTS.PRINTER_LOGS_BY_PRINTER, printerId],
    });
    void refetch();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl overflow-hidden rounded-lg border border-accent/20 bg-[#0a0a0a] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-accent/10 bg-[#0d1117] px-4 py-2">
                  <div className="min-w-0">
                    <Dialog.Title className="truncate font-mono text-sm font-semibold text-accent">
                      xrt-print@{printer?.name ?? 'printer'}:~$ activity.log
                    </Dialog.Title>
                    <p className="truncate font-mono text-[10px] text-gray-500">
                      Behind-the-scenes printing events (API server){' '}
                      {data?.total != null ? `· ${data.total} total` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isFetching}
                      className="rounded border border-accent/30 px-2 py-1 font-mono text-[11px] text-accent hover:bg-accent/5 disabled:opacity-50"
                    >
                      {isFetching ? 'refresh…' : 'refresh'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                      aria-label="Close"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <pre
                  ref={scrollRef}
                  className="max-h-[min(420px,60vh)] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-gray-300"
                  style={{ tabSize: 2 }}
                >
                  <span className="text-gray-600">
                    # Printer activity log — connection checks, test prints, order routing
                    {'\n'}
                    # Newest lines appear at the bottom.{'\n\n'}
                  </span>

                  {isLoading && (
                    <span className="animate-pulse text-amber-400/80">loading stream…</span>
                  )}

                  {error && (
                    <span className="text-red-400">
                      [ERROR] {(error as Error).message}
                    </span>
                  )}

                  {!isLoading && !error && lines.length === 0 && (
                    <span className="text-gray-500">
                      (no events yet — run Check link, Test print, or place an order)
                    </span>
                  )}

                  {lines.map((log) => (
                    <span key={log.id} className="block whitespace-pre-wrap break-all">
                      <span className={cn('select-text', levelClass(log.level))}>
                        {formatLine(log)}
                      </span>
                    </span>
                  ))}

                  {!isLoading && lines.length > 0 && (
                    <span className="mt-2 block text-gray-600">
                      {'\n'}
                      <span className="text-accent">$</span>{' '}
                      <span className="animate-pulse">_</span>
                    </span>
                  )}
                </pre>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
