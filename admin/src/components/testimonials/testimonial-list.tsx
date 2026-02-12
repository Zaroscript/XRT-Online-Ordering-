import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { useState } from 'react';
import { SortOrder } from '@/types';
import { MappedPaginatorInfo } from '@/types';
import Pagination from '@/components/ui/pagination';
import { Routes } from '@/config/routes';
import Badge from '@/components/ui/badge/badge';

type IProps = {
  testimonials: any[];
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (page: number) => void;
  onOrder: (by: string) => void;
  onSort: (order: SortOrder) => void;
};

const TestimonialList = ({
  testimonials,
  paginatorInfo,
  onPagination,
  onOrder,
  onSort,
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignLeft, alignRight } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string) => ({
    onClick: () => {
      const newSort =
        sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc;
      setSortingObj({ sort: newSort, column });
      onOrder(column);
      onSort(newSort);
    },
  });

  const columns = [
    {
      title: t('table:table-item-name'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 180,
      render: (name: string) => (
        <span className="font-semibold text-heading">{name}</span>
      ),
    },
    {
      title: t('table:table-item-role'),
      dataIndex: 'role',
      key: 'role',
      align: alignLeft,
      width: 150,
    },
    {
      title: t('table:table-item-feedback'),
      dataIndex: 'feedback',
      key: 'feedback',
      align: alignLeft,
      width: 300,
      render: (feedback: string) => (
        <span className="truncate block max-w-[280px]" title={feedback}>
          {feedback}
        </span>
      ),
    },
    {
      title: t('table:table-item-image'),
      dataIndex: 'image',
      key: 'image',
      align: 'center' as const,
      width: 80,
      render: (image: string) =>
        image ? (
          <img
            src={image}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover mx-auto"
          />
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center' as const,
      width: 100,
      render: (is_active: boolean) => (
        <Badge
          text={is_active ? t('common:text-active') : t('common:text-inactive')}
          color={
            is_active ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-500'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (id: string) => (
        <ActionButtons
          id={id}
          editUrl={Routes.testimonials.editWithoutLang(id)}
          deleteModalView="DELETE_TESTIMONIAL"
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={testimonials}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>
      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
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
};

export default TestimonialList;
