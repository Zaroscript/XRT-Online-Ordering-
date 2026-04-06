import { Table } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { Fragment, useEffect } from 'react';
import dayjs from 'dayjs';
import { Menu, Transition } from '@headlessui/react';
import { TrashIcon } from '@/components/icons/trash';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { offset, flip, autoUpdate, useFloating, shift } from '@floating-ui/react';
import { useResendSmsCampaignMutation, useDeleteSmsCampaignMutation } from '@/data/sms';
import Link from '@/components/ui/link';
import { EditIcon } from '@/components/icons/edit';
import { Eye } from '@/components/icons/eye-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';

interface SmsCampaign {
  id: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  recipient_count: number;
  sent_at?: string | null;
  created_at: string;
  filters?: any[];
}

type IProps = {
  campaigns: SmsCampaign[] | undefined;
  paginatorInfo: any | null;
  onPagination?: (key: number) => void;
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  sending: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const ActionMenu = ({ campaign }: { campaign: SmsCampaign }) => {
  const { t } = useTranslation();
  const { mutate: resend, isPending: resending } = useResendSmsCampaignMutation();
  const { mutate: deleteCampaign, isPending: deleting } = useDeleteSmsCampaignMutation();
  const { openModal } = useModalAction();

  const { x, y, strategy, update, refs } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift()],
  });

  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) return;
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [refs.reference, refs.floating, update]);

  return (
    <Menu as="div" className="inline-block text-left text-sm">
      <div>
        <Menu.Button
          ref={refs.setReference}
          className="flex items-center p-2 text-gray-400 hover:text-accent focus:outline-none"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </Menu.Button>
      </div>
      <div
        ref={refs.setFloating}
        style={{ position: strategy, top: y ?? '', left: x ?? '', zIndex: 50 }}
      >
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/sms/${campaign.id}/edit`}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center px-4 py-2 hover:text-accent disabled:opacity-50`}
                  >
                    <EditIcon className="me-2 h-4 w-4" />
                    {t('common:text-edit')}
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => openModal('CAMPAIGN_DETAILS_VIEW', campaign)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center px-4 py-2 hover:text-accent`}
                  >
                    <Eye className="me-2 h-4 w-4" />
                    {t('common:text-view-details', 'View Details')}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => resend(campaign.id)}
                    disabled={resending}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center px-4 py-2 hover:text-accent disabled:opacity-50`}
                  >
                    <CheckMarkCircle className="me-2 h-4 w-4" />
                    {resending ? t('common:text-loading') : t('common:resend')}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    disabled={deleting}
                    className={`${
                      active ? 'bg-gray-100 text-red-600' : 'text-red-500'
                    } group flex w-full items-center px-4 py-2 hover:bg-red-50 disabled:opacity-50`}
                  >
                    <TrashIcon className="me-2 h-4 w-4" />
                    {deleting ? t('common:text-loading') : t('common:remove')}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  );
};

const SmsList = ({ campaigns, paginatorInfo, onPagination }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const columns: any = [
    {
      title: t('form:input-label-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 100,
      render: (id: string) => (
        <span className="text-xs text-gray-400 font-mono truncate block max-w-[80px]">{(id ?? '').slice(-8)}</span>
      ),
    },
    {
      title: t('form:input-label-sms-subject'),
      dataIndex: 'subject',
      key: 'subject',
      align: alignLeft,
      width: 260,
      render: (subject: string) => (
        <span className="block truncate max-w-xs font-medium text-body-dark">{subject ?? '—'}</span>
      ),
    },
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 110,
      render: (status: string) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
          {status ?? '—'}
        </span>
      ),
    },
    {
      title: t('common:audience-count'),
      dataIndex: 'recipient_count',
      key: 'recipient_count',
      align: 'center',
      width: 110,
      render: (count: number) => (
        <span className="font-semibold text-body-dark">{(count ?? 0).toLocaleString()}</span>
      ),
    },
    {
      title: t('table:table-item-created-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 150,
      render: (date: string) => (
        <span className="whitespace-nowrap text-sm">{date ? dayjs(date).format('DD MMM YYYY') : '—'}</span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 80,
      render: (_: string, record: SmsCampaign) => <ActionMenu campaign={record} />,
    },
  ];

  return (
    <div className="mb-6 overflow-hidden rounded shadow">
      <Table
        columns={columns}
        emptyText={t('table:empty-table-data')}
        data={campaigns}
        rowKey="id"
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default SmsList;
