import { useState } from 'react';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';
import LinkButton from '@/components/ui/link-button';
import PrinterTerminalLogModal from '@/components/printer/printer-terminal-log-modal';
import { TerminalIcon } from '@/components/icons/terminal-icon';
import {
  usePrintersQuery,
  useTestPrintMutation,
  useCheckPrinterConnectionMutation,
} from '@/data/printer';
import { useTemplatesQuery } from '@/data/template';
import { toast } from 'react-toastify';
import Badge from '@/components/ui/badge/badge';
import { Printer } from '@/data/client/printer';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { PrinterIcon } from '@/components/icons/printer-icon';

export default function PrintersPage() {
  const { t } = useTranslation(['common', 'form', 'table']);
  const { data: printers = [], isLoading, error } = usePrintersQuery();
  const { data: templates = [] } = useTemplatesQuery();
  const { mutate: testPrint, isPending: testPrinting } = useTestPrintMutation();
  const { mutate: checkConnection, isPending: checkingConnection } =
    useCheckPrinterConnectionMutation();

  const [logPrinter, setLogPrinter] = useState<Printer | null>(null);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const getTemplateNames = (ids: string[]) => {
    if (!ids || ids.length === 0) return '—';
    return ids
      .map((id) => {
        const tpl = templates.find((t) => t.id === id);
        return tpl?.name ?? id;
      })
      .join(', ');
  };

  const handleTestPrint = (p: Printer) => {
    testPrint(p.id, {
      onSuccess: () => toast.success('Test print sent'),
      onError: (e: any) => toast.error(e?.message ?? 'Test print failed'),
    });
  };

  const handleCheckConnection = (p: Printer) => {
    checkConnection(p.id, {
      onSuccess: (data) => {
        if (data.connected) {
          toast.success('Printer reachable from server (connected)');
        } else {
          toast.warning(
            data.error ??
              'Printer not reachable from server — check IP/COM and run API on a machine that can reach the printer',
          );
        }
      },
      onError: (e: any) => toast.error(e?.message ?? 'Connection check failed'),
    });
  };

  const columns = [
    {
      title: t('table:table-item-name'),
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: t('table:table-item-connection'),
      dataIndex: 'connection_type',
      key: 'connection_type',
      align: 'center',
      render: (type: string) => (
        <Badge
          text={type}
          className="bg-gray-100 text-gray-800 border border-gray-200 capitalize"
        />
      ),
    },
    {
      title: t('table:table-item-interface'),
      dataIndex: 'interface',
      key: 'interface',
      align: 'left',
      render: (val: string) => (
        <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {val}
        </span>
      ),
    },
    {
      title: t('table:table-item-kitchen-sections'),
      dataIndex: 'kitchen_sections',
      key: 'kitchen_sections',
      align: 'left',
      render: (sections: string[]) => (
        <div className="flex flex-wrap gap-1">
          {sections?.length
            ? sections.map((s) => (
                <Badge
                  key={s}
                  text={s}
                  className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px]"
                />
              ))
            : '—'}
        </div>
      ),
    },
    {
      title: t('table:table-item-templates'),
      dataIndex: 'assigned_template_ids',
      key: 'assigned_template_ids',
      align: 'left',
      render: (ids: string[]) => getTemplateNames(ids),
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'last_status',
      key: 'last_status',
      align: 'center',
      render: (status: string) => {
        const colors: any = {
          connected: 'bg-green-500',
          disconnected: 'bg-yellow-500',
          error: 'bg-red-500',
        };
        return (
          <Badge
            className={colors[status] ?? 'bg-gray-400'}
            text={status ?? 'unknown'}
          />
        );
      },
    },
    {
      title: t('table:table-item-active'),
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active: boolean) => (
        <Badge
          className={active ? 'bg-green-500' : 'bg-red-500'}
          text={active ? 'Yes' : 'No'}
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      render: (id: string, record: Printer) => (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setLogPrinter(record)}
            className="text-gray-600 hover:text-emerald-600 transition-colors p-1"
            title="Printer activity log (terminal)"
          >
            <TerminalIcon width={18} />
          </button>
          <button
            type="button"
            onClick={() => handleCheckConnection(record)}
            disabled={checkingConnection || testPrinting}
            className="text-sm font-medium text-gray-600 hover:text-accent transition-colors px-2 py-1 rounded border border-gray-200"
            title="Check if the API server can reach this printer (not your browser)"
          >
            Check link
          </button>
          <button
            type="button"
            onClick={() => handleTestPrint(record)}
            disabled={testPrinting}
            className="text-accent hover:text-accent-hover transition-colors p-1"
            title="Test Print"
          >
            <PrinterIcon width={18} />
          </button>
          <ActionButtons
            id={id}
            editUrl={Routes.printers.edit(id)}
            deleteModalView="DELETE_PRINTER"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="mb-8">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title="Printers" />
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <LinkButton href={Routes.printers.create} className="h-12">
              + Add printer
            </LinkButton>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={printers}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      <PrinterTerminalLogModal
        printer={logPrinter}
        open={!!logPrinter}
        onClose={() => setLogPrinter(null)}
      />
    </>
  );
}

PrintersPage.authenticate = {};
PrintersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
