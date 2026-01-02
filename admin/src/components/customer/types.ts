import { Customer, MappedPaginatorInfo } from "@/types";

export type ImportRow = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
};

export interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<ImportRow, 'id'>[]) => void;
  data: Omit<ImportRow, 'id'>[];
  isLoading?: boolean;
}

export type IProps = {
  customers: Customer[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

export type CustomerFormProps = {
  initialValues?: any;
};

export type FormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
};
