import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState, useEffect, useRef } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import {
  adminOnly,
  getAuthCredentials,
  hasPermission,
} from '@/utils/auth-utils';
import { useItemSizesQuery } from '@/data/item-size';
import { useBusinessesQuery } from '@/data/business';
import { useRouter } from 'next/router';
import PageHeading from '@/components/common/page-heading';
import { Table } from '@/components/ui/table';
import { ItemSize } from '@/types';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import Badge from '@/components/ui/badge/badge';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import {
  useDeleteItemSizeMutation,
  useUpdateItemSizesSortOrderMutation,
} from '@/data/item-size';
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

export default function ItemSizes() {
  const router = useRouter();
  const { locale, query } = router;
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation(['common', 'form', 'table']);

  const { businesses, loading: businessesLoading } = useBusinessesQuery();
  const businessId = (query.business_id as string) || businesses?.[0]?.id;
  const { sizes, isLoading, error } = useItemSizesQuery(businessId);
  const { openModal } = useModalAction();
  const { mutate: deleteSize } = useDeleteItemSizeMutation();
  const { mutate: updateSortOrder } = useUpdateItemSizesSortOrderMutation();

  // Local state for optimistic updates
  const [itemsList, setItemsList] = useState<ItemSize[]>([]);
  const sizesRef = useRef<ItemSize[] | undefined>(sizes);
  sizesRef.current = sizes;

  // Only sync from API when list content or search actually changes (avoids loop from unstable `sizes` reference)
  const sizesSignature =
    sizes?.map((s) => `${s.id}:${s.display_order ?? 0}`).join(',') ?? '';

  useEffect(() => {
    const currentSizes = sizesRef.current;
    if (!currentSizes?.length && !searchTerm) {
      setItemsList([]);
      return;
    }
    if (!currentSizes) return;
    if (searchTerm) {
      const filtered = currentSizes.filter(
        (size: ItemSize) =>
          size.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          size.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setItemsList(filtered);
    } else {
      setItemsList([...currentSizes]);
    }
  }, [sizesSignature, searchTerm]);

  // DnD Sensors
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
    if (active.id !== over?.id) {
      setItemsList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Conclusion: Disable DnD when searching.
        if (searchTerm) return items;

        const payload = newItems.map((item, index) => ({
          id: item.id,
          order: index, // itemsList is the full list when no search
        }));

        updateSortOrder(payload);

        return newItems;
      });
    }
  };

  if (isLoading || businessesLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  const columns = [
    {
      title: t('table:table-item-name'),
      dataIndex: 'name',
      key: 'name',
      align: 'left' as const,
      render: (name: string, record: ItemSize) => (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-body/60">Code: {record.code}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center' as const,
      render: (is_active: boolean) => (
        <Badge
          text={is_active ? t('common:text-active') : t('common:text-inactive')}
          color={is_active ? 'bg-green-500' : 'bg-red-500'}
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right' as const,
      render: (id: string) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={Routes.itemSize.editByIdWithoutLang(id)}
            className="text-accent transition duration-200 hover:text-accent-hover focus:outline-none"
            title={t('common:text-edit')}
          >
            <EditIcon width={20} />
          </Link>
          <button
            onClick={() => openModal('DELETE_ITEM_SIZE', id)}
            className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
            title={t('common:text-delete')}
          >
            <TrashIcon width={20} />
          </button>
        </div>
      ),
    },
  ];

  const draggableProps = !searchTerm
    ? {
        components: {
          body: {
            row: SortableRow,
          },
        },
      }
    : {};

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('sidebar-nav-item-items-sizes')} />
          </div>

          <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-3/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />

            {getAuthCredentials().role === 'super_admin' ||
            hasPermission(
              ['item-sizes:create'],
              getAuthCredentials().permissions,
            ) ? (
              <LinkButton
                href={
                  businessId
                    ? `${Routes.itemSize.create}?business_id=${businessId}`
                    : Routes.itemSize.create
                }
                className="h-12 w-full md:w-auto md:ms-6"
              >
                <span className="block md:hidden xl:block">
                  + {t('form:button-label-add-item-size')}
                </span>
                <span className="hidden md:block xl:hidden">+</span>
              </LinkButton>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-hidden">
          {itemsList.length > 0 && !searchTerm ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemsList.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  /* @ts-ignore */
                  columns={columns}
                  {...draggableProps}
                  emptyText={() => (
                    <div className="flex flex-col items-center py-7">
                      <div className="mb-1 pt-6 text-base font-semibold text-heading">
                        {t('table:empty-table-data')}
                      </div>
                      <p className="text-sm text-body/60">
                        {t('table:empty-table-data-text')}
                      </p>
                    </div>
                  )}
                  data={itemsList}
                  rowKey="id"
                  scroll={{ x: 800 }}
                />
              </SortableContext>
            </DndContext>
          ) : (
            <Table
              /* @ts-ignore */
              columns={columns}
              emptyText={() => (
                <div className="flex flex-col items-center py-7">
                  <div className="mb-1 pt-6 text-base font-semibold text-heading">
                    {t('table:empty-table-data')}
                  </div>
                  <p className="text-sm text-body/60">
                    {t('table:empty-table-data-text')}
                  </p>
                </div>
              )}
              data={itemsList}
              rowKey="id"
              scroll={{ x: 800 }}
            />
          )}
        </div>
      </Card>
    </>
  );
}

ItemSizes.authentication = true;
ItemSizes.authorization = adminOnly;
ItemSizes.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
