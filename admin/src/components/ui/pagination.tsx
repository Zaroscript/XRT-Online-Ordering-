import RCPagination, { PaginationProps } from 'rc-pagination';
import { ArrowNext } from '@/components/icons/arrow-next';
import { ArrowPrev } from '@/components/icons/arrow-prev';
import 'rc-pagination/assets/index.css';

const toSafeNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const Pagination: React.FC<PaginationProps> = (props = {}) => {
  const safeCurrent = toSafeNumber(props.current, 1);
  const safePageSize = toSafeNumber(props.pageSize, 10);
  const safeTotal = Math.max(0, Number(props.total ?? 0) || 0);

  return (
    <RCPagination
      nextIcon={<ArrowNext />}
      prevIcon={<ArrowPrev />}
      {...props}
      current={safeCurrent}
      pageSize={safePageSize}
      total={safeTotal}
    />
  );
};

export default Pagination;
