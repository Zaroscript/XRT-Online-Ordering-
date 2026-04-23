import { useState } from 'react';
import StickerCard from '@/components/widgets/sticker-card';
import {
  DashboardAnalyticsData,
  getDashboardSummaryStats,
  useAnalyticsQuery,
} from '@/data/dashboard';
import { adminOnly, adminAndOwnerOnly, hasAccess } from '@/utils/auth-utils';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import { BasketIcon } from '@/components/icons/summary/basket';
import PageHeading from '@/components/common/page-heading';
import { getAuthCredentials } from '@/utils/auth-utils';
import { useDashboardLoading } from '@/hooks/use-app-loading';
import { CancelledProcessedIcon } from '@/components/icons/summary/cancelled-order';
import DashboardTimeframeFilter from '@/components/dashboard/timeframe-filter';
import SalesChart from '@/components/dashboard/sales-chart';
import TaxChart from '@/components/dashboard/tax-chart';
import EmailCampaignAnalytics from '@/components/dashboard/email-campaign-analytics';
import TipsChart from '@/components/dashboard/tips-chart';
import TrendChart from '@/components/dashboard/trend-chart';
import OrderAnalysis from '@/components/dashboard/order-analysis';
import CouponAnalysis from '@/components/dashboard/coupon-analysis';

const ShopList = dynamic(() => import('@/components/dashboard/shops/shops'));

const OwnerShopLayout = () => {
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const { data, isPending: loading } = useAnalyticsQuery();
  const [activeTimeFrame, setActiveTimeFrame] = useState(1);
  const analyticsData = data?.data as Partial<DashboardAnalyticsData> | undefined;
  const activeStats = getDashboardSummaryStats(analyticsData, activeTimeFrame);

  // Always call the hook, but pass empty array if not authenticated
  const { token } = getAuthCredentials();
  useDashboardLoading({
    loadingStates: token ? [loading] : [],
    loadingMessage: 'Loading dashboard data...',
  });

  const { price: total_revenue } = usePrice(
    activeStats && {
      amount: activeStats.totalRevenue,
    },
  );
  const { price: total_tips } = usePrice(
    activeStats && {
      amount: activeStats.totalTips,
    },
  );

  // Use brand colors from CSS variables to ensure consistency and prevent manual editing
  const brandColors = {
    revenue: 'rgb(var(--color-primary))',
    tips: 'rgb(var(--color-pending))',
    orders: 'rgb(var(--color-muted-black))',
    completed: 'rgb(var(--color-complete))',
    canceled: 'rgb(var(--color-canceled))',
  };

  return (
    <>
      {/* Summary Section */}
      <div className="mb-8 rounded-lg bg-light p-5 md:p-8">
        <div className="mb-5 items-center justify-between sm:flex md:mb-7">
          <PageHeading title={t('text-summary-order-status')} />
          <DashboardTimeframeFilter
            activeTimeFrame={activeTimeFrame}
            onChange={setActiveTimeFrame}
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StickerCard
            titleTransKey="sticker-card-title-rev"
            icon={<EaringIcon className="h-8 w-8" />}
            color={brandColors.revenue}
            price={total_revenue}
          />
          <StickerCard
            titleTransKey="sticker-card-title-tips"
            icon={<ShoppingIcon className="h-8 w-8" />}
            color={brandColors.tips}
            price={total_tips}
          />
          <StickerCard
            titleTransKey="sticker-card-title-total-orders"
            icon={<BasketIcon className="h-8 w-8" />}
            color={brandColors.orders}
            price={activeStats?.totalOrders}
          />
          <StickerCard
            titleTransKey="sticker-card-title-completed-orders"
            icon={<ChecklistIcon className="h-8 w-8" />}
            color={brandColors.completed}
            price={activeStats?.completedOrders}
          />
          <StickerCard
            titleTransKey="sticker-card-title-canceled-orders"
            icon={<CancelledProcessedIcon className="h-8 w-8" />}
            color={brandColors.canceled}
            price={activeStats?.canceledOrders}
          />
        </div>
      </div>

      {/* Sales History Section */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <SalesChart analyticsData={analyticsData} />
        </div>
      )}

      {/* Tax Collected Section */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <TaxChart analyticsData={analyticsData} />
        </div>
      )}

      {/* Email Campaign Analytics */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <EmailCampaignAnalytics />
        </div>
      )}

      {/* Daily Tips Section */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <TipsChart analyticsData={analyticsData} />
        </div>
      )}

      {/* Order Analysis Section */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <OrderAnalysis analyticsData={analyticsData} />
        </div>
      )}

      {/* Coupon Analysis Section */}
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <CouponAnalysis analyticsData={analyticsData} />
        </div>
      )}

      {/* Trend Analysis & Export Section - Temporarily Hidden
      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8">
          <TrendChart analyticsData={analyticsData} />
        </div>
      )}
      */}
    </>
  );
};

const OwnerDashboard = () => {
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);

  return permission ? <ShopList /> : <OwnerShopLayout />;
};

export default OwnerDashboard;

