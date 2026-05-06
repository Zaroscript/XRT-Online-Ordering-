'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { BrowserPrintAgent } from '@/services/browserPrintAgent';

type AgentStatus = 'disconnected' | 'connecting' | 'ready' | 'error';

type Props = {
  restaurantId: string;
};

function getApiAndSocketUrls(): { restApiBase: string; socketOrigin: string } {
  const restApiBase =
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1';
  try {
    const socketOrigin = new URL(restApiBase).origin;
    return { restApiBase, socketOrigin };
  } catch {
    return {
      restApiBase: 'http://localhost:3001/api/v1',
      socketOrigin: 'http://localhost:3001',
    };
  }
}

function getStatusText(status: AgentStatus, t: (key: string, defaultValue?: string) => string): string {
  if (status === 'ready') return t('print-agent.status.ready', 'Ready to print');
  if (status === 'connecting')
    return t('print-agent.status.connecting', 'Connecting printer...');
  if (status === 'error') return t('print-agent.status.error', 'Error');
  return t('print-agent.status.disconnected', 'Disconnected');
}

function getStatusDotClass(status: AgentStatus): string {
  if (status === 'ready') return 'bg-green-500';
  if (status === 'connecting') return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function PrintAgentStatus({ restaurantId }: Props) {
  const { t } = useTranslation('common');
  const agentRef = useRef<BrowserPrintAgent | null>(null);
  const [status, setStatus] = useState<AgentStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string>('');
  /** Socket/serial connect errors vs last print job failure (keep Ready dot if printer still open). */
  const [printJobError, setPrintJobError] = useState<string>('');
  const [isWebSerialAvailable, setIsWebSerialAvailable] = useState(false);

  useEffect(() => {
    if (!restaurantId) {
      setStatus('error');
      setErrorMessage(
        t(
          'print-agent.errors.restaurant-id-missing',
          'Restaurant ID is missing, cannot start print agent.',
        ),
      );
      return;
    }

    const available =
      typeof navigator !== 'undefined' &&
      'serial' in navigator &&
      typeof (navigator as Navigator & { serial?: unknown }).serial !== 'undefined';
    setIsWebSerialAvailable(available);

    try {
      const { restApiBase, socketOrigin } = getApiAndSocketUrls();
      agentRef.current = new BrowserPrintAgent(restaurantId, socketOrigin, restApiBase, {
        onPrintJobError: (message) => {
          setPrintJobError(message);
        },
        onPrintJobOk: () => {
          setPrintJobError('');
        },
      });
      setStatus('disconnected');
      setErrorMessage('');
      setPrintJobError('');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t(
              'print-agent.errors.initialize-failed',
              'Failed to initialize print agent.',
            );
      setStatus('error');
      setErrorMessage(
        `${t('print-agent.errors.start-failed-prefix', 'Failed to start print agent:')} ${message}`,
      );
    }

    return () => {
      const agent = agentRef.current;
      agentRef.current = null;
      if (agent) {
        void agent.disconnect().catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('[PrintAgentStatus] disconnect failed', error);
        });
      }
    };
  }, [restaurantId, t]);

  const statusText = useMemo(() => getStatusText(status, t), [status, t]);
  const dotClassName = useMemo(() => getStatusDotClass(status), [status]);

  const onConnectPrinter = async () => {
    if (!agentRef.current) {
      setStatus('error');
      setErrorMessage(
        t(
          'print-agent.errors.not-ready',
          'Print agent is not ready. Please reload the page and try again.',
        ),
      );
      return;
    }

    setStatus('connecting');
    setErrorMessage('');
    setPrintJobError('');
    try {
      await agentRef.current.connectPrinter();
      setStatus('ready');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t('print-agent.errors.connect-failed', 'Failed to connect to printer.');
      setStatus('error');
      setErrorMessage(
        `${t('print-agent.errors.connect-prefix', 'Failed to connect printer:')} ${message}`,
      );
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
        <span className="text-sm font-medium text-heading">{statusText}</span>
      </div>

      {!isWebSerialAvailable ? (
        <p className="text-sm text-red-600">
          {t(
            'print-agent.web-serial-not-supported',
            'Your browser does not support Web Serial API. Please use Chrome or Edge over HTTPS.',
          )}
        </p>
      ) : (
        <button
          type="button"
          onClick={onConnectPrinter}
          disabled={status === 'connecting'}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('print-agent.connect-button', 'Connect Printer')}
        </button>
      )}

      {status === 'error' && errorMessage ? (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {printJobError ? (
        <p className="mt-3 text-sm text-red-600">
          {t(
            'print-agent.errors.last-job-prefix',
            'Last print job:',
          )}{' '}
          {printJobError}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-body">
        {t(
          'print-agent.debug-console-hint',
          'Tip: Press F12 → Console and filter by “BrowserPrintAgent” to see socket connect, incoming jobs, and ACK URLs.',
        )}
      </p>
    </div>
  );
}
