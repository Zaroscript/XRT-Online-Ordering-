import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { CustomerPaginator, Customer, MappedPaginatorInfo, SortOrder } from '@/types';
import { customerClient } from './client/customer';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

export const useCustomersQuery = ({
  limit = 20,
  page = 1,
  search = '',
  orderBy = 'created_at',
  sortedBy = 'DESC' as const,
  isActive,
}: {
  limit?: number;
  page?: number;
  search?: string;
  orderBy?: string;
  sortedBy?: 'DESC' | 'ASC';
  isActive?: boolean;
}) => {
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.CUSTOMERS, { limit, page, search, orderBy, sortedBy, isActive }],
    () => customerClient.fetchCustomers({
      limit,
      page,
      search,
      orderBy,
      sortedBy: sortedBy.toLowerCase() as SortOrder,
      isActive,
    }),
    {
      keepPreviousData: true,
      staleTime: 60 * 1000, // 1 minute
    },
  );

  // Handle backend response format: { success: true, data: { customers: [...], paginatorInfo: {...} } }
  const responseData = data?.data || data;
  const customers = responseData?.customers ?? [];
  const paginatorInfo = responseData?.paginatorInfo ?? {
    total: customers.length,
    currentPage: page,
    lastPage: 1,
    perPage: limit,
    count: customers.length,
  };

  // Transform to match expected format
  const transformedData: CustomerPaginator = {
    data: customers,
    total: paginatorInfo.total,
    current_page: paginatorInfo.currentPage,
    first_page_url: '',
    from: 0,
    last_page: paginatorInfo.lastPage,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: paginatorInfo.perPage,
    prev_page_url: null,
    to: 0,
  };

  return {
    data: transformedData,
    error,
    isLoading,
    refetch: () => { },
  };
};

export const useCustomerQuery = (id: string) => {
  return useQuery<Customer, Error>(
    [API_ENDPOINTS.CUSTOMERS, id],
    () => customerClient.fetchCustomer({ id }),
    {
      enabled: !!id,
      select: (data: any) => {
        // Handle backend response format
        return data?.data?.customer || data?.data || data;
      },
    },
  );
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, any>(
    (variables) => {
      return customerClient.create(variables);
    },
    {
      onSuccess: () => {
        toast.success(t('common:successfully-created'));
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:create-failed'));
      },
    }
  );
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, { id: string; variables: any }>(
    ({ id, variables }) => customerClient.update({ id, input: variables }),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:update-failed'));
      },
    }
  );
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, string>(
    (id) => {
      return customerClient.delete(id);
    },
    {
      onSuccess: () => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:delete-failed'));
      },
    }
  );
};

export const useImportCustomersMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    any,
    Error,
    { customers: any[] }
  >(
    async (variables) => {
      // Import customers by creating them one by one (can be optimized later)
      const results = [];
      for (const customer of variables.customers) {
        try {
          const result = await customerClient.create({
            name: customer.name,
            email: customer.email,
            phoneNumber: customer.phoneNumber || '',
            rewards: customer.rewards || 0,
            notes: customer.notes,
          });
          results.push(result);
        } catch (error) {
          console.error('Failed to import customer:', customer, error);
        }
      }
      return { imported: results.length, data: results };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:import-failed'));
      },
    }
  );
};

export const useExportCustomersMutation = () => {
  const { t } = useTranslation();

  return useMutation<
    any,
    Error,
    { format?: string }
  >(
    async (variables) => {
      // Fetch all customers
      const response = await customerClient.fetchCustomers({
        limit: 10000, // Get all
      });

      const customers = response?.customers || [];

      // Convert to CSV
      const headers = ['Name', 'Email', 'Phone', 'Created At'];
      const rows = customers.map((customer: any) => [
        customer.name || '',
        customer.email || '',
        customer.phoneNumber || '',
        customer.created_at || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
      ].join('\n');

      // Return as blob-like object
      return new Blob([csvContent], { type: 'text/csv' });
    },
    {
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:export-failed'));
      },
    }
  );
};

