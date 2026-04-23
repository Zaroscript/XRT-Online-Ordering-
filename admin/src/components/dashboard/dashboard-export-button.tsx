import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import cn from 'classnames';
import { DownloadIcon } from '@/components/icons/download-icon';
import { exportToExcelMultiSheet } from '@/utils/export-data';
import type { DashboardAnalyticsData, DashboardSummaryStats } from '@/data/dashboard';
import type { Product } from '@/types';

interface DashboardExportButtonProps {
  analyticsData?: Partial<DashboardAnalyticsData>;
  activeStats?: DashboardSummaryStats;
  popularProducts?: Product[];
  lessSoldProducts?: Product[];
}

// ─── PDF multi-section export ──────────────────────────────────────────────────
async function exportAllToPDF(
  analyticsData: Partial<DashboardAnalyticsData> | undefined,
  activeStats: DashboardSummaryStats | undefined,
  popularProducts: Product[],
  lessSoldProducts: Product[],
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const ACCENT = [0, 159, 127] as [number, number, number];
  const GRAY   = [249, 250, 251] as [number, number, number];
  const date   = dayjs().format('DD MMM YYYY');

  // ── Cover header ──
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Dashboard Analytics Report', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${date}`, 14, 20);
  doc.setTextColor(40, 40, 40);

  let yOffset = 36;

  const sectionTitle = (title: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ACCENT);
    doc.text(title, 14, yOffset);
    yOffset += 4;
    doc.setTextColor(40, 40, 40);
  };

  const addTable = (head: string[][], body: (string | number)[][]) => {
    autoTable(doc, {
      head,
      body,
      startY: yOffset,
      theme: 'grid',
      headStyles: { fillColor: ACCENT, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: GRAY },
      margin: { left: 14, right: 14 },
    });
    // Read finalY only after autoTable() returns — lastAutoTable is guaranteed set here
    yOffset = (doc as any).lastAutoTable.finalY + 12;
  };

  const fmt = (v: number | undefined) => `$${(v ?? 0).toFixed(2)}`;

  // ── 1. KPI Summary ──
  sectionTitle('1. KPI Summary');
  addTable(
    [['Metric', 'Value']],
    [
      ['Total Revenue',      fmt(activeStats?.totalRevenue)],
      ['Total Tips',         fmt(activeStats?.totalTips)],
      ['Total Orders',       String(activeStats?.totalOrders ?? 0)],
      ['Completed Orders',   String(activeStats?.completedOrders ?? 0)],
      ['Cancelled Orders',   String(activeStats?.canceledOrders ?? 0)],
      ['Pickup Orders',      String(activeStats?.pickupOrders ?? 0)],
      ['Delivery Orders',    String(activeStats?.deliveryOrders ?? 0)],
      ['Avg. Order Value',   fmt(activeStats?.aov)],
      ['Total Discounts',    fmt(activeStats?.totalDiscounts)],
      ['Coupon Orders',      String(activeStats?.couponUsage ?? 0)],
    ],
  );

  // ── 2. Sales History (Monthly) ──
  const monthly = analyticsData?.salesHistory?.monthly ?? [];
  if (monthly.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('2. Sales History — Monthly');
    addTable(
      [['Date', 'Items Revenue', 'Tax', 'Tips', 'Total']],
      monthly.map((h) => [
        h.label,
        fmt(h.items),
        fmt(h.tax),
        fmt(h.tips),
        fmt((h.items ?? 0) + (h.tax ?? 0) + (h.tips ?? 0)),
      ]),
    );
  }

  // ── 3. Sales Trend (Monthly) ──
  if (monthly.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('3. Sales Trend — Monthly Total');
    addTable(
      [['Date', 'Total Sales']],
      monthly.map((h) => [
        h.label,
        fmt((h.items ?? 0) + (h.tax ?? 0) + (h.tips ?? 0)),
      ]),
    );
  }

  // ── 4. Tax Collected (Monthly) ──
  if (monthly.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('4. Tax Collected — Monthly');
    addTable(
      [['Date', 'Tax Amount']],
      monthly.map((h) => [h.label, fmt(h.tax)]),
    );
  }

  // ── 5. Tips (Monthly) ──
  if (monthly.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('5. Daily Tips — Monthly');
    addTable(
      [['Date', 'Tips Collected']],
      monthly.map((h) => [h.label, fmt(h.tips)]),
    );
  }

  // ── 6. Popular Products ──
  if (popularProducts.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('6. Most Sold Products');
    addTable(
      [['#', 'Product', 'Price', 'Orders']],
      popularProducts.map((p, i) => [
        String(i + 1),
        p.name,
        fmt(p.sale_price ?? p.price),
        String(p.orders_count ?? 0),
      ]),
    );
  }

  // ── 7. Less Sold Products ──
  if (lessSoldProducts.length) {
    if (yOffset > 220) { doc.addPage(); yOffset = 20; }
    sectionTitle('7. Less Sold Products');
    addTable(
      [['#', 'Product', 'Price', 'Orders']],
      lessSoldProducts.map((p, i) => [
        String(i + 1),
        p.name,
        fmt(p.sale_price ?? p.price),
        String(p.orders_count ?? 0),
      ]),
    );
  }

  // ── 8. Coupon Analysis ──
  if (yOffset > 220) { doc.addPage(); yOffset = 20; }
  sectionTitle('8. Coupon Analysis');
  const usageRate = (activeStats?.completedOrders ?? 0) > 0
    ? Math.round(((activeStats?.couponUsage ?? 0) / (activeStats?.completedOrders ?? 1)) * 100)
    : 0;
  addTable(
    [['Metric', 'Value']],
    [
      ['Coupon Orders',          String(activeStats?.couponUsage ?? 0)],
      ['Total Discounts Given',  fmt(activeStats?.totalDiscounts)],
      ['Penetration Rate',       `${usageRate}%`],
    ],
  );

  // ── Footer on every page ──
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
    doc.text('XRT Dashboard Export', 14, 290);
  }

  doc.save(`Dashboard_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
}

// ─── Excel multi-sheet export ──────────────────────────────────────────────────
async function exportAllToExcel(
  analyticsData: Partial<DashboardAnalyticsData> | undefined,
  activeStats: DashboardSummaryStats | undefined,
  popularProducts: Product[],
  lessSoldProducts: Product[],
) {
  const monthly = analyticsData?.salesHistory?.monthly ?? [];
  const fmt = (v: number | undefined) => Number((v ?? 0).toFixed(2)); // currency → stays number → gets $ format
  const cnt = (v: number | undefined) => String(v ?? 0);              // count/% → string → no $ format

  const usageRate = (activeStats?.completedOrders ?? 0) > 0
    ? Math.round(((activeStats?.couponUsage ?? 0) / (activeStats?.completedOrders ?? 1)) * 100)
    : 0;

  await exportToExcelMultiSheet({
    fileName: 'Dashboard_Report',
    sheets: [
      {
        sheetName: '① KPI Summary',
        title: 'KPI Summary',
        columns: [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 },
        ],
        data: [
          { metric: 'Total Revenue',      value: fmt(activeStats?.totalRevenue) },
          { metric: 'Total Tips',         value: fmt(activeStats?.totalTips) },
          { metric: 'Total Orders',       value: cnt(activeStats?.totalOrders) },
          { metric: 'Completed Orders',   value: cnt(activeStats?.completedOrders) },
          { metric: 'Cancelled Orders',   value: cnt(activeStats?.canceledOrders) },
          { metric: 'Pickup Orders',      value: cnt(activeStats?.pickupOrders) },
          { metric: 'Delivery Orders',    value: cnt(activeStats?.deliveryOrders) },
          { metric: 'Avg. Order Value',   value: fmt(activeStats?.aov) },
          { metric: 'Total Discounts',    value: fmt(activeStats?.totalDiscounts) },
          { metric: 'Coupon Orders',      value: cnt(activeStats?.couponUsage) },
        ],
      },
      {
        sheetName: '② Sales History',
        title: 'Sales History — Monthly',
        columns: [
          { header: 'Date',          key: 'date',  width: 18 },
          { header: 'Items Revenue', key: 'items', width: 20 },
          { header: 'Tax',           key: 'tax',   width: 16 },
          { header: 'Tips',          key: 'tips',  width: 16 },
          { header: 'Total',         key: 'total', width: 20 },
        ],
        data: monthly.map((h) => ({
          date:  h.label,
          items: fmt(h.items),
          tax:   fmt(h.tax),
          tips:  fmt(h.tips),
          total: fmt((h.items ?? 0) + (h.tax ?? 0) + (h.tips ?? 0)),
        })),
      },
      {
        sheetName: '③ Sales Trend',
        title: 'Sales Trend — Monthly Total',
        columns: [
          { header: 'Date',        key: 'date',  width: 18 },
          { header: 'Total Sales', key: 'total', width: 20 },
        ],
        data: monthly.map((h) => ({
          date:  h.label,
          total: fmt((h.items ?? 0) + (h.tax ?? 0) + (h.tips ?? 0)),
        })),
      },
      {
        sheetName: '④ Tax Collected',
        title: 'Tax Collected — Monthly',
        columns: [
          { header: 'Date',       key: 'date', width: 18 },
          { header: 'Tax Amount', key: 'tax',  width: 20 },
        ],
        data: monthly.map((h) => ({ date: h.label, tax: fmt(h.tax) })),
      },
      {
        sheetName: '⑤ Tips',
        title: 'Tips Collected — Monthly',
        columns: [
          { header: 'Date',           key: 'date', width: 18 },
          { header: 'Tips Collected', key: 'tips', width: 20 },
        ],
        data: monthly.map((h) => ({ date: h.label, tips: fmt(h.tips) })),
      },
      {
        sheetName: '⑥ Popular Products',
        title: 'Most Sold Products',
        columns: [
          { header: '#',       key: 'rank',   width: 8  },
          { header: 'Product', key: 'name',   width: 30 },
          { header: 'Price',   key: 'price',  width: 16 },
          { header: 'Orders',  key: 'orders', width: 14 },
        ],
        data: popularProducts.map((p, i) => ({
          rank:   cnt(i + 1),
          name:   p.name,
          price:  fmt(p.sale_price ?? p.price),
          orders: cnt(p.orders_count),
        })),
      },
      {
        sheetName: '⑦ Less Sold',
        title: 'Less Sold Products',
        columns: [
          { header: '#',       key: 'rank',   width: 8  },
          { header: 'Product', key: 'name',   width: 30 },
          { header: 'Price',   key: 'price',  width: 16 },
          { header: 'Orders',  key: 'orders', width: 14 },
        ],
        data: lessSoldProducts.map((p, i) => ({
          rank:   cnt(i + 1),
          name:   p.name,
          price:  fmt(p.sale_price ?? p.price),
          orders: cnt(p.orders_count),
        })),
      },
      {
        sheetName: '⑧ Coupon Analysis',
        title: 'Coupon Analysis',
        columns: [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value',  key: 'value',  width: 20 },
        ],
        data: [
          { metric: 'Coupon Orders',         value: cnt(activeStats?.couponUsage) },
          { metric: 'Total Discounts Given', value: fmt(activeStats?.totalDiscounts) },
          { metric: 'Penetration Rate (%)',  value: `${usageRate}%` },
        ],
      },
    ],
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardExportButton({
  analyticsData,
  activeStats,
  popularProducts = [],
  lessSoldProducts = [],
}: DashboardExportButtonProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  const handleExcel = async () => {
    setLoading('excel');
    try {
      await exportAllToExcel(analyticsData, activeStats, popularProducts, lessSoldProducts);
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = async () => {
    setLoading('pdf');
    try {
      await exportAllToPDF(analyticsData, activeStats, popularProducts, lessSoldProducts);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left z-30">
      <Menu.Button
        disabled={!!loading}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200',
          'bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          loading ? 'cursor-wait opacity-70' : '',
        )}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <DownloadIcon className="h-4 w-4" />
        )}
        {loading === 'excel'
          ? 'Exporting Excel…'
          : loading === 'pdf'
          ? 'Exporting PDF…'
          : t('text-export-all') || 'Export All'}
        {!loading && (
          <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Export Dashboard</p>
            <p className="text-xs text-gray-500 mt-0.5">All 8 sections · Full data</p>
          </div>

          <div className="p-2">
            {/* Excel option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleExcel}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                    active ? 'bg-green-50 text-green-700' : 'text-gray-700',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">Export to Excel</p>
                    <p className="text-xs text-gray-400">8 tabs · .xlsx workbook</p>
                  </div>
                </button>
              )}
            </Menu.Item>

            {/* PDF option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handlePDF}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                    active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">Export to PDF</p>
                    <p className="text-xs text-gray-400">Formatted report · .pdf</p>
                  </div>
                </button>
              )}
            </Menu.Item>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
            <p className="text-[11px] text-gray-400">
              📅 Data snapshot: {dayjs().format('DD MMM YYYY, HH:mm')}
            </p>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
