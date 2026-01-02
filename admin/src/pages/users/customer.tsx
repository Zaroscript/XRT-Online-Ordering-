import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import CustomerList from '@/components/customer/customer-list';
import ImportPreviewModal from '@/components/customer/import-preview-modal';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  useCustomersQuery,
  useImportCustomersMutation,
  useExportCustomersMutation,
} from '@/data/customer';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import { SortOrder, MappedPaginatorInfo } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { toast } from 'react-toastify';
import { useMeQuery } from '@/data/user';
import { useShopsQuery } from '@/data/shop';
import Button from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { DownloadIcon } from '@/components/icons/download-icon';
import { UploadIcon } from '@/components/icons/upload-icon';
import Link from 'next/link';

type ImportRow = {
  name: string;
  email: string;
  phoneNumber: string;
  rewards?: number;
  notes?: string;
};

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  // Import preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);

  // Get current user and shops context
  const { data: currentUser } = useMeQuery();
  const { shops } = useShopsQuery({ limit: 100 });

  const {
    data: customerData,
    isLoading,
    error,
    refetch,
  } = useCustomersQuery({
    limit: 20,
    page,
    search: searchTerm,
    orderBy,
    sortedBy: sortedBy as unknown as 'DESC' | 'ASC',
  });

  const customers = customerData?.data || [];
  const paginatorInfo: MappedPaginatorInfo | null = customerData
    ? {
      currentPage: customerData.current_page || page,
      total: customerData.total || 0,
      perPage: customerData.per_page || 20,
      lastPage: customerData.last_page || 1,
      hasMorePages:
        (customerData.current_page || page) < (customerData.last_page || 1),
      firstPageUrl: '',
      from: 0,
      lastPageUrl: '',
      links: [],
      nextPageUrl: null,
      path: '',
      prevPageUrl: null,
      to: 0,
    }
    : null;

  const importMutation = useImportCustomersMutation();
  const exportMutation = useExportCustomersMutation();

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  // Parse CSV file and show preview modal
  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error(
          'CSV file must have at least a header row and one data row',
        );
        return;
      }

      // Parse header row
      const headers = lines[0]
        .split(',')
        .map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

      // Find column indices
      const nameIdx = headers.findIndex(
        (h) =>
          h.includes('name') &&
          !h.includes('business') &&
          !h.includes('location'),
      );
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone'));
      const rewardsIdx = headers.findIndex((h) => h.includes('reward'));
      const notesIdx = headers.findIndex((h) => h.includes('note'));

      if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
        toast.error('CSV must contain columns: name, email, phoneNumber');
        return;
      }

      // Parse data rows
      const parsedData: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 3) {
          parsedData.push({
            name: values[nameIdx]?.trim() || '',
            email: values[emailIdx]?.trim() || '',
            phoneNumber: values[phoneIdx]?.trim() || '',
            rewards: rewardsIdx !== -1 ? parseInt(values[rewardsIdx]) || 0 : 0,
            notes: notesIdx !== -1 ? values[notesIdx]?.trim() : '',
          });
        }
      }

      if (parsedData.length === 0) {
        toast.error('No valid data found in CSV');
        return;
      }

      setPreviewData(parsedData);
      setIsPreviewOpen(true);
    };
    reader.readAsText(file);
  }

  // Helper to parse CSV line handling quoted values
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Handle confirmed import from preview modal
  function handleConfirmImport(data: ImportRow[]) {
    // Data now contains business_id per customer (automatically set)
    importMutation.mutate({ customers: data } as any, {
      onSuccess: (response: any) => {
        toast.success(
          `Successfully imported ${response.data?.imported || data.length} customers`,
        );
        setIsPreviewOpen(false);
        setPreviewData([]);
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Import failed: ${error.message}`);
      },
    });
  }

  function handleExportCSV() {
    // Export all customers (don't filter by business/location)
    exportMutation.mutate(
      {
        format: 'csv',
        // Export all customers (business_id is automatically filtered by current user's business)
      },
      {
        onSuccess: async (response: any) => {
          try {
            // Read the blob/response as text
            let csvText: string;
            if (response instanceof Blob) {
              csvText = await response.text();
            } else if (typeof response === 'string') {
              csvText = response;
            } else {
              csvText = response?.data || String(response);
            }

            // Check for JSON error response (in case server returned JSON instead of CSV)
            if (csvText.trim().startsWith('{')) {
              try {
                const jsonResponse = JSON.parse(csvText);
                if (jsonResponse.status === 'error') {
                  toast.error(jsonResponse.message || 'Export failed');
                  return;
                }
              } catch (e) {
                // Not JSON, continue with CSV handling
              }
            }

            // Count lines to determine customer count
            const lines = csvText.trim().split('\n');
            const customerCount = Math.max(0, lines.length - 1); // Subtract header row

            // Create a blob and download
            const blob = new Blob([csvText], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show appropriate toast message
            if (customerCount > 0) {
              toast.success(
                `Exported ${customerCount} customer${customerCount !== 1 ? 's' : ''} successfully`,
              );
            } else {
              toast.info(
                'No customers found to export. The file contains only headers.',
              );
            }
          } catch (err) {
            console.error('Export processing error:', err);
            toast.error('Failed to process export data');
          }
        },
        onError: (error: any) => {
          toast.error(`Export failed: ${error.message}`);
        },
      },
    );
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between gap-4 p-6 md:flex-row md:gap-0">
        <div className="w-full md:w-1/4">
          <PageHeading title={t('form:input-label-customers')} />
        </div>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row md:items-center">
          <div className="w-full md:w-auto md:flex-1 md:max-w-sm">
            <Search onSearch={handleSearch} />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
            <Button
              onClick={() => document.getElementById('csv-import')?.click()}
              className="flex items-center space-x-2"
              variant="outline"
              size="small"
            >
              <UploadIcon className="w-4 h-4" />
              <span>Import CSV</span>
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = ''; // Reset input
              }}
              className="hidden"
              id="csv-import"
            />
            <Button
              onClick={handleExportCSV}
              className="flex items-center space-x-2"
              variant="outline"
              size="small"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Link href={Routes.customer.create}>
              <Button className="flex items-center space-x-2" size="small">
                <PlusIcon className="w-4 h-4" />
                <span>{t('form:button-label-create-customer')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {isLoading ? null : (
        <CustomerList
          customers={customers}
          paginatorInfo={paginatorInfo}
          onPagination={handlePagination}
          onOrder={setOrder}
          onSort={setColumn}
        />
      )}

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewData([]);
        }}
        onConfirm={handleConfirmImport}
        data={previewData as any}
        isLoading={importMutation.isLoading}
      />
    </>
  );
}

CustomersPage.authenticate = {
  permissions: adminOnly,
};
CustomersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
