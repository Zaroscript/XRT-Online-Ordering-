import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import Button from '@/components/ui/button';
import { MappedPaginatorInfo, Promotion } from '@/types';
import { Routes } from '@/config/routes';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  useUpdatePromotionMutation,
  useUpdatePromotionsSortOrderMutation,
} from '@/data/promotion';
import { toast } from 'react-toastify';
import { getPromotionTemplateDefinition } from '@/config/promotionTemplates';
import { normalizeColor, getSoftColor } from '@/utils/color-utils';
import { Switch } from '@headlessui/react';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from '@/components/ui/sortable-row';

type Props = {
  promotions: Promotion[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
};

export default function PromotionList({
  promotions,
  paginatorInfo,
  onPagination,
}: Props) {
  const { mutate: updatePromotion, isPending } = useUpdatePromotionMutation();
  const { mutate: updateSortOrder, isPending: isUpdatingSortOrder } =
    useUpdatePromotionsSortOrderMutation();
  const { openModal } = useModalAction();
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);

  useEffect(() => {
    setPromotionsList(promotions ?? []);
  }, [promotions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setPromotionsList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);
        const pageSize = paginatorInfo?.perPage || 20;
        const currentPage = paginatorInfo?.currentPage || 1;
        const startOrder = (currentPage - 1) * pageSize;

        const payload = newItems.map((item, index) => ({
          id: item.id,
          order: startOrder + index,
        }));
        updateSortOrder(payload);

        return newItems.map((item, index) => ({
          ...item,
          sort_order: startOrder + index,
        }));
      });
    }
  };

  const toggleWebsite = (record: Promotion, next: boolean) => {
    updatePromotion(
      { id: record.id, is_active_on_website: next } as any,
      {
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Could not update promotion');
        },
      },
    );
  };

  const columns = [
    {
      title: 'Promotion',
      dataIndex: 'headline',
      key: 'headline',
      align: 'left' as const,
      width: 300,
      render: (headline: string, record: Promotion) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-16 overflow-hidden rounded bg-gray-100 shrink-0 border border-border-100">
            {record.image_url ? (
              <img
                src={record.image_url}
                alt={headline}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-heading line-clamp-1">{headline}</span>
            <span className="text-[10px] text-muted line-clamp-1">{record.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Template',
      dataIndex: 'template',
      key: 'template',
      align: 'left' as const,
      render: (t: string) => {
        const meta = getPromotionTemplateDefinition(t as any);
        const color = normalizeColor(meta?.color);
        const softBg = getSoftColor(color, 0.1);
        
        return (
          <div 
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: softBg, color: color }}
          >
            {t.replace(/_/g, ' ')}
          </div>
        );
      },
    },
    {
      title: 'Website',
      key: 'website',
      align: 'center' as const,
      render: (_: unknown, record: Promotion) => (
        <div className="flex flex-col items-center gap-1.5">
          <Switch
            checked={record.is_active_on_website}
            onChange={(checked: boolean) => toggleWebsite(record, checked)}
            disabled={isPending}
            className={`${
              record.is_active_on_website ? 'bg-accent' : 'bg-gray-200'
            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span
              className={`${
                record.is_active_on_website ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className={cn(
            "text-[10px] font-bold uppercase",
            record.is_active_on_website ? "text-accent" : "text-muted"
          )}>
            {record.is_active_on_website ? 'Live' : 'Draft'}
          </span>
        </div>
      ),
    },
    {
      title: 'Validity',
      key: 'dates',
      align: 'left' as const,
      render: (_: unknown, record: Promotion) => {
        const now = dayjs();
        const start = dayjs(record.active_from);
        const end = dayjs(record.expire_at);
        
        let status = { label: 'Active', color: 'bg-accent/10 text-accent' };
        if (now.isBefore(start)) {
          status = { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
        } else if (now.isAfter(end)) {
          status = { label: 'Expired', color: 'bg-red-100 text-red-700' };
        }

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase", status.color)}>
                {status.label}
              </span>
            </div>
            <span className="text-[11px] font-medium text-body whitespace-nowrap">
              {start.format('MMM D')} — {end.format('MMM D, YYYY')}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Usage',
      key: 'usage',
      align: 'center' as const,
      render: (_: unknown, record: Promotion) => {
        const uses = record.orders?.length || 0;
        const limit = record.max_conversions;
        
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-heading">{uses}</span>
            <span className="text-[10px] text-muted">
              {limit ? `of ${limit} max` : 'Unlimited'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: Promotion) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={Routes.promotion.editWithoutLang(record.id)}>
            <Button
              variant="outline"
              size="small"
              className="border-border-200 text-heading hover:text-white"
            >
              Edit
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={() => openModal('DELETE_PROMOTION', record.id)}
            className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-border-200 bg-light shadow-sm mb-8">
        <div className={isUpdatingSortOrder ? 'opacity-50 pointer-events-none' : ''}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={promotionsList.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                //@ts-ignore
                columns={columns}
                emptyText="No promotions found"
                components={{
                  body: {
                    row: SortableRow,
                  },
                }}
                //@ts-ignore
                data={promotionsList}
                rowKey="id"
                scroll={{ x: 900 }}
              />
            </SortableContext>
          </DndContext>
        </div>
      </div>
      
      {!!paginatorInfo?.total && (
        <div className="flex justify-end mb-8">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
