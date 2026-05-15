import Layout from '@/components/layouts/admin';
import OrderHeader from '@/components/order/details/order-header';
import OrderStatusSection from '@/components/order/details/order-status-section';
import OrderItemsTable from '@/components/order/details/order-items-table';
import OrderSummary from '@/components/order/details/order-summary';
import CustomerDetails from '@/components/order/details/customer-details';
import OrderInfo from '@/components/order/details/order-info';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  useDownloadInvoiceMutation,
  useOrderQuery,
  useReprintOrderMutation,
  useUpdateOrderMutation,
} from '@/data/order';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useIsRTL } from '@/utils/locals';
import { toast } from 'react-toastify';

type FormValues = {
  order_status?: string;
};

export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const { query, locale } = useRouter();
  const { isRTL } = useIsRTL();
  const orderId = query.orderId as string;

  const { mutate: updateOrder, isPending: updating } = useUpdateOrderMutation();
  const { mutate: reprintOrder, isPending: reprinting } = useReprintOrderMutation();

  const {
    order,
    isLoading: loading,
    error,
  } = useOrderQuery(
    { id: orderId, language: locale! },
    { enabled: Boolean(orderId) },
  );

  const { refetch } = useDownloadInvoiceMutation(
    {
      order_id: orderId,
      isRTL,
      language: locale!,
    },
    { enabled: false },
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { order_status: order?.order_status ?? '' },
  });

  const ChangeStatus = ({ order_status }: FormValues) => {
    if (!order_status || !order?.id) return;
    updateOrder({
      id: order.id,
      status: order_status,
    });
  };

  function handleReprint() {
    if (!order?.id) return;
    reprintOrder(
      { id: order.id },
      {
        onSuccess: () => toast.success('Reprint sent to printer'),
        onError: (e: any) => toast.error(e?.message ?? 'Reprint failed'),
      },
    );
  }

  async function handleDownloadInvoice() {
    const { data } = await refetch();
    if (data) {
      const a = document.createElement('a');
      a.href = data;
      a.setAttribute('download', 'order-invoice');
      a.click();
    }
  }

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!order) return <ErrorMessage message={t('common:no-order-found')} />;

  return (
    <div className="flex flex-col space-y-8">
      <OrderHeader
        order={order}
        onDownloadInvoice={handleDownloadInvoice}
        onReprint={handleReprint}
        reprinting={reprinting}
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="flex flex-col space-y-8 xl:col-span-2">
          <OrderStatusSection
            order={order}
            control={control}
            errors={errors}
            updating={updating}
            onChangeStatus={handleSubmit(ChangeStatus)}
          />
          <OrderItemsTable products={order?.products ?? []} />
          <OrderInfo order={order} />
        </div>

        <div className="flex flex-col space-y-8 xl:col-span-1">
          <OrderSummary order={order} />
          <CustomerDetails order={order} />
        </div>
      </div>
    </div>
  );
}

OrderDetailsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
