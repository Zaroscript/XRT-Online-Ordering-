import RecentOrders from '@/components/order/recent-orders';
import PopularProductList from '@/components/product/popular-product-list';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import SalesChart from '@/components/dashboard/sales-chart';
import TaxChart from '@/components/dashboard/tax-chart';
import TipsChart from '@/components/dashboard/tips-chart';
import TrendChart from '@/components/dashboard/trend-chart';
import OrderAnalysis from '@/components/dashboard/order-analysis';
import CouponAnalysis from '@/components/dashboard/coupon-analysis';
import StickerCard from '@/components/widgets/sticker-card';
import DashboardExportButton from '@/components/dashboard/dashboard-export-button';
import EmailCampaignAnalytics from '@/components/dashboard/email-campaign-analytics';

import {
  DashboardAnalyticsData,
  getDashboardSummaryStats,
  useAnalyticsQuery,
  usePopularProductsQuery,
  useTopRatedProductsQuery,
} from '@/data/dashboard';
import { useOrdersQuery } from '@/data/order';

import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { useState } from 'react';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import { BasketIcon } from '@/components/icons/summary/basket';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import Search from '@/components/common/search';
import { getAuthCredentials } from '@/utils/auth-utils';
import { useDashboardLoading } from '@/hooks/use-app-loading';
import { CancelledProcessedIcon } from '@/components/icons/summary/cancelled-order';
import DashboardTimeframeFilter from '@/components/dashboard/timeframe-filter';
import PageHeading from '@/components/common/page-heading';

const LessSoldProducts = dynamic(
  () => import('@/components/dashboard/widgets/box/widget-top-rate-product'),
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data, isPending: loading } = useAnalyticsQuery();
  const analyticsData = data?.data as Partial<DashboardAnalyticsData> | undefined;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTimeFrame, setActiveTimeFrame] = useState(1);

  const {
    error: orderError,
    orders: orderData,
    isFetching: orderFetching,
    paginatorInfo: orderPaginatorInfo,
  } = useOrdersQuery({
    language: locale,
    limit: 5,
    page,
    tracking_number: searchTerm,
    today_only: true,
  });

  const {
    data: popularProductData,
    isLoading: popularProductLoading,
    error: popularProductError,
  } = usePopularProductsQuery({ limit: 10, language: locale });

  const {
    data: topRatedProducts,
    isLoading: topRatedProductsLoading,
    error: topRatedProductsError,
  } = useTopRatedProductsQuery({ limit: 10, language: locale });

  const { token } = getAuthCredentials();
  useDashboardLoading({
    loadingStates: token ? [loading, popularProductLoading, topRatedProductsLoading] : [],
    loadingMessage: 'Loading dashboard data...',
  });

  const activeStats = getDashboardSummaryStats(analyticsData, activeTimeFrame);

  const { price: total_revenue } = usePrice(activeStats && { amount: activeStats.totalRevenue });
  const { price: total_tips }   = usePrice(activeStats && { amount: activeStats.totalTips });

  const brandColors = {
    revenue:   'rgb(var(--color-primary))',
    tips:      'rgb(var(--color-pending))',
    orders:    'rgb(var(--color-muted-black))',
    completed: 'rgb(var(--color-complete))',
    canceled:  'rgb(var(--color-canceled))',
  };

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  if (loading || popularProductLoading || topRatedProductsLoading) {
    return <Loader text={t('common:text-loading')} />;
  }
  if (orderError || popularProductError || topRatedProductsError) {
    return (
      <ErrorMessage
        message={
          orderError?.message ||
          popularProductError?.message ||
          topRatedProductsError?.message
        }
      />
    );
  }

  return (
    <div className="grid gap-7 md:gap-8 lg:grid-cols-2 2xl:grid-cols-12">

      {/* ① KPI Summary Cards — the single most important first glance */}
      <div className="col-span-full rounded-lg bg-light p-5 md:p-8">
        <div className="mb-5 items-center justify-between sm:flex md:mb-7">
          <PageHeading title={t('text-summary-order-status')} />
          <div className="flex items-center gap-3">
            <DashboardTimeframeFilter
              activeTimeFrame={activeTimeFrame}
              onChange={setActiveTimeFrame}
            />
            <DashboardExportButton
              analyticsData={analyticsData}
              activeStats={activeStats}
              popularProducts={popularProductData ?? []}
              lessSoldProducts={topRatedProducts ?? []}
            />
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StickerCard titleTransKey="sticker-card-title-rev"              icon={<EaringIcon className="h-8 w-8" />}            color={brandColors.revenue}   price={total_revenue} />
          <StickerCard titleTransKey="sticker-card-title-tips"             icon={<ShoppingIcon className="h-8 w-8" />}           color={brandColors.tips}      price={total_tips} />
          <StickerCard titleTransKey="sticker-card-title-total-orders"     icon={<BasketIcon className="h-8 w-8" />}             color={brandColors.orders}    price={activeStats?.totalOrders} />
          <StickerCard titleTransKey="sticker-card-title-completed-orders" icon={<ChecklistIcon className="h-8 w-8" />}          color={brandColors.completed} price={activeStats?.completedOrders} />
          <StickerCard titleTransKey="sticker-card-title-canceled-orders"  icon={<CancelledProcessedIcon className="h-8 w-8" />} color={brandColors.canceled}  price={activeStats?.canceledOrders} />
        </div>
      </div>

      {/* ② Live Today's Orders — operational visibility */}
      <RecentOrders
        className="col-span-full"
        orders={orderData}
        paginatorInfo={orderPaginatorInfo}
        title={t('table:recent-order-table-title')}
        onPagination={handlePagination}
        isFetching={orderFetching}
        searchElement={
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
            className="hidden max-w-sm sm:inline-block [&button]:top-0.5"
            inputClassName="!h-10"
          />
        }
      />

      {/* ③ Sales History — revenue breakdown (items / tax / tips) */}
      <div className="col-span-full">
        <SalesChart analyticsData={analyticsData} />
      </div>

      {/* ④ Sales Trend — directional momentum with delta tooltips */}
      <div className="col-span-full">
        <TrendChart analyticsData={analyticsData} />
      </div>

      {/* ⑤ Order Fulfillment — pickup vs delivery split, AOV */}
      <div className="col-span-full">
        <OrderAnalysis analyticsData={analyticsData} />
      </div>

      {/* ⑥ Product Performance — side-by-side popular vs slow movers */}
      <PopularProductList
        products={popularProductData ?? []}
        title={t('table:popular-products-table-title')}
        className="lg:col-span-1 2xl:col-span-6"
      />
      <LessSoldProducts
        products={topRatedProducts ?? []}
        title={'text-less-sold-products'}
        className="lg:col-span-1 2xl:col-span-6"
      />

      {/* ⑦ Tax Collected — financial compliance */}
      <div className="col-span-full">
        <TaxChart analyticsData={analyticsData} />
      </div>

      {/* ⑧ Daily Tips — service quality / staff performance signal */}
      <div className="col-span-full">
        <TipsChart analyticsData={analyticsData} />
      </div>

      {/* ⑨ Coupon Analysis — promotional spend effectiveness */}
      <div className="col-span-full">
        <CouponAnalysis analyticsData={analyticsData} />
      </div>

      {/* ⑩ Email Campaign Analytics — marketing engagement */}
      <div className="col-span-full">
        <EmailCampaignAnalytics />
      </div>

    </div>
  );
}
