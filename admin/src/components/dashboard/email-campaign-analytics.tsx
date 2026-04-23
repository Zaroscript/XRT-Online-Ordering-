import { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import { useEmailCampaignAnalyticsQuery } from '@/data/emails';
import Link from 'next/link';
import { Routes } from '@/config/routes';

const Chart = dynamic(() => import('@/components/ui/chart'), { ssr: false });

// ─── Metric Card ────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;   // Tailwind bg class
  icon: React.ReactNode;
}

const MetricCard = ({ label, value, sub, color, icon }: MetricCardProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-heading">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ─── Icons ───────────────────────────────────────────────────────────────────

const SendIcon  = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const OpenIcon  = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const ClickIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
const BounceIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UnsubIcon  = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;

// ─── Tab types ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'volume',    label: 'Send Volume'  },
  { id: 'engagement', label: 'Engagement'  },
  { id: 'campaigns', label: 'Top Campaigns'},
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmailCampaignAnalytics() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabId>('volume');
  const { data, isLoading, isError } = useEmailCampaignAnalyticsQuery();

  const analytics = (data as any)?.data ?? data ?? null;
  const totals     = analytics?.totals     ?? {};
  const months     = analytics?.monthlyFilled ?? [];
  const campaigns  = analytics?.topCampaigns  ?? [];

  // ── Volume chart (bars: recipients + opens + clicks per month) ───────────
  const volumeOptions = useMemo(() => ({
    chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: "'Inter', sans-serif" },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: months.map((m: any) => m.label),
      labels: { style: { colors: '#6B7280', fontSize: '11px' } },
    },
    yaxis: { labels: { style: { colors: '#6B7280', fontSize: '11px' } } },
    fill: { opacity: 1 },
    colors: ['#6366f1', '#22c55e', '#3b82f6'],
    legend: { show: true, position: 'top' as const, horizontalAlign: 'left' as const },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    tooltip: { shared: true, intersect: false },
  }), [months]);

  const volumeSeries = useMemo(() => [
    { name: 'Recipients', data: months.map((m: any) => m.total_recipients) },
    { name: 'Opens',      data: months.map((m: any) => m.total_opens)      },
    { name: 'Clicks',     data: months.map((m: any) => m.total_clicks)     },
  ], [months]);

  // ── Engagement donut ────────────────────────────────────────────────────
  const donutSeries  = [totals.unique_opens ?? 0, totals.unique_clicks ?? 0, totals.total_bounces ?? 0, totals.total_unsubs ?? 0];
  const donutOptions = useMemo(() => ({
    chart: { type: 'donut' as const, fontFamily: "'Inter', sans-serif" },
    labels: ['Unique Opens', 'Unique Clicks', 'Bounces', 'Unsubscribes'],
    colors: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'],
    legend: { position: 'bottom' as const },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }), []);

  // ── Top campaigns table ──────────────────────────────────────────────────
  const pct = (n: number, d: number) =>
    d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '—';

  const noData = !isLoading && !isError && !analytics;

  return (
    <div className="w-full overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-7">
      {/* Header — always visible regardless of data state */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="before:content-[''] relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
            Email Campaign Analytics
          </h3>
          <p className="mt-1 text-sm text-body">Campaign performance &amp; engagement overview</p>
        </div>
        <Link
          href={Routes.emails.list}
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
        >
          Manage Campaigns
        </Link>
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      )}

      {/* API error state */}
      {isError && (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/50 text-red-400">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">Could not load campaign analytics</p>
          <p className="text-xs text-red-300">Check the backend email analytics endpoint</p>
        </div>
      )}

      {/* Empty state — clearly visible */}
      {noData && (
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
            <SendIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">No campaign data yet</p>
            <p className="mt-0.5 text-xs text-gray-400">Send your first campaign to see analytics here.</p>
          </div>
          <Link
            href={Routes.emails.list}
            className="mt-1 inline-flex h-8 items-center rounded-md bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            Create Campaign →
          </Link>
        </div>
      )}

      {/* Full analytics — only when data is present */}
      {!isLoading && !isError && analytics && (
        <>
          {/* KPI Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <MetricCard label="Campaigns Sent"   value={totals.campaign_count ?? 0}                             color="bg-indigo-500" icon={<SendIcon />}   />
            <MetricCard label="Total Delivered"  value={(totals.total_recipients ?? 0).toLocaleString()}        color="bg-blue-500"   icon={<SendIcon />}   />
            <MetricCard label="Open Rate"        value={`${totals.open_rate ?? 0}%`}  sub={`${(totals.unique_opens ?? 0).toLocaleString()} unique`}  color="bg-green-500"  icon={<OpenIcon />}   />
            <MetricCard label="Click Rate"       value={`${totals.click_rate ?? 0}%`} sub={`${(totals.unique_clicks ?? 0).toLocaleString()} unique`} color="bg-sky-500"    icon={<ClickIcon />}  />
            <MetricCard label="Bounce Rate"      value={`${totals.bounce_rate ?? 0}%`} sub={`${(totals.total_bounces ?? 0).toLocaleString()} bounces`} color="bg-red-500" icon={<BounceIcon />} />
          </div>

          {/* Tab bar */}
          <div className="mb-5 inline-flex rounded-full bg-gray-100/80 p-1.5">
            {TABS.map((tab) => (
              <div key={tab.id} className="relative">
                <Button
                  className={cn('!focus:ring-0 relative z-10 !h-7 rounded-full !px-3 text-sm font-medium text-gray-500', tab.id === activeTab ? 'text-accent' : '')}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  variant="custom"
                >
                  {tab.label}
                </Button>
                {tab.id === activeTab && (
                  <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
                )}
              </div>
            ))}
          </div>

          {/* Tab Panels */}
          {activeTab === 'volume' && (
            <div className="w-full">
              <Chart options={volumeOptions} series={volumeSeries} height={320} type="bar" />
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="mx-auto max-w-sm">
              {donutSeries.every((v) => v === 0) ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                  No engagement data yet — SendGrid webhooks will populate this once emails are opened/clicked.
                </div>
              ) : (
                <Chart options={donutOptions as any} series={donutSeries} height={340} type="donut" />
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="overflow-x-auto">
              {campaigns.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No sent campaigns yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-400">
                      <th className="pb-3 pr-4">Campaign</th>
                      <th className="pb-3 pr-4 text-right">Sent</th>
                      <th className="pb-3 pr-4 text-right">Open %</th>
                      <th className="pb-3 pr-4 text-right">Click %</th>
                      <th className="pb-3 pr-4 text-right">Bounces</th>
                      <th className="pb-3 text-right">Unsubs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c: any) => (
                      <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                        <td className="py-3 pr-4">
                          <p className="max-w-xs truncate font-medium text-body-dark">{c.heading}</p>
                          <p className="truncate text-xs text-gray-400">{c.subject}</p>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold">{(c.recipient_count ?? 0).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right text-green-600">{pct(c.unique_opens ?? 0, c.recipient_count)}</td>
                        <td className="py-3 pr-4 text-right text-blue-600">{pct(c.unique_clicks ?? 0, c.recipient_count)}</td>
                        <td className="py-3 pr-4 text-right text-red-500">{c.bounce_count ?? 0}</td>
                        <td className="py-3 text-right text-amber-500">{c.unsubscribe_count ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
