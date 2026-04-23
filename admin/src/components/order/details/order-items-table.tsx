import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import { useIsRTL } from '@/utils/locals';
import { siteSettings } from '@/settings/site.settings';
import { NoDataFound } from '@/components/icons/no-data-found';
import Image from 'next/image';
import usePrice from '@/utils/use-price';

interface OrderItemsTableProps {
  products: any[];
}

const ItemDetails = ({ item }: { item: any }) => {
  const { t } = useTranslation('common');
  const quantity = Number(item?.pivot?.order_quantity ?? item?.quantity ?? 0);
  const unitPriceValue = Number(
    item?.pivot?.unit_price ?? item?.unit_price ?? item?.price ?? 0,
  );
  const variation = item?.pivot?.variation;
  const modifiers = item?.pivot?.modifiers ?? [];
  const specialNotes = item?.special_notes;
  const { price: unitPrice } = usePrice({
    amount: unitPriceValue,
  });

  return (
    <div className="py-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-heading">{item?.name}</span>
        {variation ? (
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {variation}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-body">
        <span className="rounded-full border border-border-200 bg-gray-50 px-2 py-1 font-medium text-heading">
          Qty {quantity || 0}
        </span>
        <span>{unitPrice} each</span>
      </div>

      {modifiers.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {modifiers.map((modifier: any, index: number) => (
            <span
              key={`${modifier?.id ?? modifier?.modifier_name_snap ?? 'modifier'}-${index}`}
              className="rounded-full border border-border-200 bg-white px-2.5 py-1 text-[11px] text-body"
            >
              {modifier?.modifier_name_snap}
              {modifier?.quantity_label_snapshot
                ? ` | ${modifier.quantity_label_snapshot}`
                : ''}
              {modifier?.selected_side ? ` | ${modifier.selected_side}` : ''}
            </span>
          ))}
        </div>
      ) : null}

      {specialNotes ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span className="font-semibold">{t('text-note')}:</span>{' '}
          {specialNotes}
        </div>
      ) : null}
    </div>
  );
};

const PriceCell = ({ item }: { item: any }) => {
  const { price } = usePrice({
    amount: Number(
      item?.pivot?.subtotal ?? item?.line_subtotal ?? item?.subtotal ?? 0,
    ),
  });
  return <span className="font-semibold text-heading">{price}</span>;
};

export default function OrderItemsTable({ products }: OrderItemsTableProps) {
  const { t } = useTranslation(['common', 'table']);
  const { alignLeft, alignRight } = useIsRTL();

  const columns = [
    {
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: (image: any) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-border-200 bg-gray-50">
          <Image
            src={image?.thumbnail ?? siteSettings.product.placeholder}
            alt="product"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      render: (_: string, item: any) => <ItemDetails item={item} />,
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'price',
      key: 'price',
      align: alignRight,
      width: 140,
      render: (_: any, item: any) => <PriceCell item={item} />,
    },
  ];

  return (
    <div className="rounded-2xl border border-border-200 bg-white shadow-sm">
      <Table
        //@ts-ignore
        columns={columns}
        emptyText={() => (
          <div className="flex flex-col items-center py-7">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
        data={products}
        rowKey="id"
        scroll={{ x: 420 }}
      />
    </div>
  );
}
