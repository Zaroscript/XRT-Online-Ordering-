import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { DashboardAnalyticsData } from '@/data/dashboard';
import { getDashboardSummaryStats } from '@/data/dashboard';
import usePrice from '@/utils/use-price';

import { DeliveryIcon } from '@/components/icons/delivery-icon';
import { BasketIcon } from '@/components/icons/summary/basket';
import { Revenue } from '@/components/icons/revenue';

interface OrderAnalysisProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
}

const TIME_FRAMES = [
  { labelKey: 'text-today' as const,   day: 1   },
  { labelKey: 'text-weekly' as const,  day: 7   },
  { labelKey: 'text-monthly' as const, day: 30  },
  { labelKey: 'text-yearly' as const,  day: 365 },
];

export default function OrderAnalysis({ analyticsData }: OrderAnalysisProps) {
  const { t } = useTranslation('common');
  const [activeTimeFrame, setActiveTimeFrame] = useState<number>(1); // Default to Today

  const stats = getDashboardSummaryStats(analyticsData, activeTimeFrame);

  const { price: formattedAOV } = usePrice({
    amount: stats.aov ?? 0,
  });

  return (
    <div className="h-full w-full overflow-hidden rounded-lg bg-light p-6 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="before:content-[''] relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            {t('text-order-analysis') || 'Order Insights'}
          </h3>
          <p className="mt-1 text-sm text-body">
            {t('text-order-analysis-guide') || 'Pickup, Delivery, and Average Value'}
          </p>
        </div>

        {/* Timeframe filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-full bg-gray-100/80 p-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {TIME_FRAMES.map((tf) => (
              <div key={tf.day} className="relative">
                <Button
                  className={cn(
                    '!focus:ring-0 relative z-10 !h-7 rounded-full !px-2.5 text-sm font-medium text-gray-500',
                    tf.day === activeTimeFrame ? 'text-accent' : '',
                  )}
                  type="button"
                  onClick={() => setActiveTimeFrame(tf.day)}
                  variant="custom"
                >
                  {t(tf.labelKey) || tf.labelKey.replace('text-', '')}
                </Button>
                {tf.day === activeTimeFrame && (
                  <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        
        {/* Pickup Count */}
        <div className="flex items-center gap-4 rounded border border-border-200 bg-gray-50/50 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-orange-100/80 text-orange-500">
            <BasketIcon className="h-6 w-6" />
          </div>
          <div className="flex w-full flex-col">
            <span className="mb-1 text-sm font-medium text-body">
              {t('text-pickup-orders') || 'Pickup Orders'}
            </span>
            <span className="text-2xl font-semibold text-heading">
              {stats.pickupOrders ?? 0}
            </span>
          </div>
        </div>

        {/* Delivery Count */}
        <div className="flex items-center gap-4 rounded border border-border-200 bg-gray-50/50 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-blue-100/80 text-blue-500">
            <DeliveryIcon className="h-7 w-7" />
          </div>
          <div className="flex w-full flex-col">
            <span className="mb-1 text-sm font-medium text-body">
              {t('text-delivery-orders') || 'Delivery Orders'}
            </span>
            <span className="text-2xl font-semibold text-heading">
              {stats.deliveryOrders ?? 0}
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="flex items-center gap-4 rounded border border-border-200 bg-gray-50/50 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-emerald-100/80 text-emerald-500">
            <Revenue className="h-7 w-7" />
          </div>
          <div className="flex w-full flex-col">
            <span className="mb-1 text-sm font-medium text-body">
              {t('text-average-order-value') || 'Average Order Value'}
            </span>
            <span className="text-2xl font-semibold text-heading">
              {formattedAOV}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
