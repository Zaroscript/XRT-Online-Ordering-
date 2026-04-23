import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import { useOrdersQuery } from '@/data/order';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import { useExportOrderQuery } from '@/data/export';
import { useRouter } from 'next/router';
import { Tab } from '@headlessui/react';
import OrderBucketList from '@/components/order/order-bucket-list';
import classNames from 'classnames';
import { DownloadIcon } from '@/components/icons/download-icon';
import Button from '@/components/ui/button';
import PageHeading from '@/components/common/page-heading';
import Modal from '@/components/ui/modal/modal';
import OrderDetailsView from '@/components/order/order-details-view';
import { Order } from '@/types';
import { useScheduledOrderNotifier } from '@/hooks/useScheduledOrderNotifier';

/** Server status filter per tab (custom server API: pending, accepted, inkitchen, ready, out of delivery, completed, canceled) */
const TAB_SERVER_STATUS: Record<number, string> = {
  0: '__new__', // New: all pending orders (including scheduled pending)
  1: '__inprogress__', // In Progress: accepted/inkitchen/ready/out of delivery
  2: '__scheduled__', // Scheduled: has schedule_time + accepted or later (not pending)
  3: 'completed', // Completed
  4: 'canceled', // Canceled
};

export default function Orders() {
  const router = useRouter();
  const { locale } = router;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const status = TAB_SERVER_STATUS[selectedIndex];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useScheduledOrderNotifier();

  const tabs = [
    { title: t('common:text-new-orders') },
    { title: t('common:text-in-progress') },
    { title: t('common:text-scheduled') },
    { title: t('common:text-completed') },
    { title: t('common:text-canceled') },
  ];

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  function handleTabChange(index: number) {
    setSelectedIndex(index);
    setPage(1);
  }

  const { orders, loading, paginatorInfo, error } = useOrdersQuery({
    language: locale,
    limit: selectedIndex === 1 ? 8 : 20,
    page,
    orderBy,
    sortedBy,
    tracking_number: searchTerm,
    status,
  });
  const { refetch } = useExportOrderQuery({}, { enabled: false });

  if (error) return <ErrorMessage message={error.message} />;

  async function handleExportOrder() {
    const { data } = await refetch();

    if (data) {
      const a = document.createElement('a');
      a.href = data;
      a.setAttribute('download', 'export-order');
      a.click();
    }
  }

  function handleViewDetails(order: Order) {
    setSelectedOrder(order);
  }

  function closeModal() {
    setSelectedOrder(null);
  }

  return (
    <>
      <Card className="mb-6 md:mb-8 p-4 sm:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex-shrink-0 md:w-1/4">
          <PageHeading
            title={t('form:input-label-orders')}
            className="text-xl sm:text-lg"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:w-1/2">
          <Search
            onSearch={handleSearch}
            className="w-full min-w-0"
            placeholderText={t('form:input-placeholder-search-tracking-number')}
          />
          <Button
            onClick={handleExportOrder}
            className="h-11 sm:h-12 w-full sm:w-auto sm:flex-shrink-0"
          >
            <DownloadIcon className="h-4 w-4 me-2 flex-shrink-0" />
            <span className="hidden md:block">
              {t('common:text-export-orders')}
            </span>
            <span className="md:hidden">{t('common:text-export')}</span>
          </Button>
        </div>
      </Card>

      <div className="mb-8">
        <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <Tab.List
              className={classNames(
                'inline-flex w-full min-w-0 flex-wrap gap-1 rounded-xl bg-white p-1 sm:gap-0.5',
                'shadow-sm',
              )}
            >
              {tabs.map((tab, idx) => (
                <Tab
                  key={tab.title + idx}
                  className={({ selected }) =>
                    classNames(
                      'min-w-0 flex-1 rounded-lg py-3 px-3 text-center text-sm font-medium transition-all duration-200',
                      'focus:outline-none',
                      'sm:px-4',
                      selected
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-heading',
                    )
                  }
                >
                  {tab.title}
                </Tab>
              ))}
            </Tab.List>
            <div
              className="flex shrink-0 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5 shadow-sm"
              role="group"
              aria-label={t('common:text-grid-view')}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title={t('common:text-grid-view')}
                className={classNames(
                  'rounded-md p-2.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-accent shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:bg-white hover:text-heading',
                )}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title={t('common:text-list-view')}
                className={classNames(
                  'rounded-md p-2.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-accent shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:bg-white hover:text-heading',
                )}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <Tab.Panels>
            <Tab.Panel>
              <OrderBucketList
                orders={orders ?? []}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                viewMode={viewMode}
                onViewDetails={handleViewDetails}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel>
              <OrderBucketList
                orders={orders ?? []}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                viewMode={viewMode}
                onViewDetails={handleViewDetails}
                pageSize={8}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel>
              <OrderBucketList
                orders={orders ?? []}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                viewMode={viewMode}
                onViewDetails={handleViewDetails}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel>
              <OrderBucketList
                orders={orders ?? []}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                viewMode={viewMode}
                onViewDetails={handleViewDetails}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel>
              <OrderBucketList
                orders={orders ?? []}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                viewMode={viewMode}
                onViewDetails={handleViewDetails}
                loading={loading}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {selectedOrder && (
        <Modal open={true} onClose={closeModal}>
          <OrderDetailsView
            orderId={selectedOrder.id}
            initialOrder={selectedOrder}
            onClose={closeModal}
          />
        </Modal>
      )}
    </>
  );
}

Orders.authenticate = {
  permissions: adminOnly,
};
Orders.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
