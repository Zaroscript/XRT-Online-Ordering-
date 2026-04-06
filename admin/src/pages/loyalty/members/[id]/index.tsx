import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useLoyaltyMemberQuery, useLoyaltyProgramQuery } from '@/data/loyalty';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import LoyaltyTransactionsList from '@/components/loyalty/loyalty-transactions-list';
import dayjs from 'dayjs';
import { adminOnly } from '@/utils/auth-utils';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';

export default function LoyaltyMemberDetails() {
  const router = useRouter();
  const { query } = router;
  const { t } = useTranslation();
  const { member, loading, error } = useLoyaltyMemberQuery(query.id as string);
  const { program } = useLoyaltyProgramQuery();
  const redeemRate = program?.redeem_rate_currency_per_point || 0;

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!member) return <ErrorMessage message={t('common:text-not-found')} />;

  const currentPointsValue = member.points_balance * redeemRate;
  const totalRedeemedValue = member.total_points_redeemed * redeemRate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-heading">
          {t('common:text-loyalty-member-details', 'Loyalty Member Details')}
        </h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 transition-all hover:bg-primary/20"
        >
          {t('common:text-back', 'Back')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-1 flex flex-col p-5">
          <h2 className="text-lg font-semibold text-heading mb-4 border-b pb-2">
            {t('common:text-customer-info', 'Customer Information')}
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-body block">{t('common:text-name', 'Name')}</span>
              <span className="font-medium text-heading">{member.customer?.name || t('common:text-unknown')}</span>
            </div>
            <div>
              <span className="text-sm text-body block">{t('common:text-phone', 'Phone')}</span>
              <span className="font-medium text-heading">{member.customer?.phoneNumber || member.phone || '-'}</span>
            </div>
            <div>
              <span className="text-sm text-body block">{t('common:text-email', 'Email')}</span>
              <span className="font-medium text-heading">{member.customer?.email || '-'}</span>
            </div>
            <div>
              <span className="text-sm text-body block">{t('common:text-joined-at', 'Joined At')}</span>
              <span className="font-medium text-heading">{dayjs(member.created_at).format('DD MMM YYYY')}</span>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2 p-5">
          <h2 className="text-lg font-semibold text-heading mb-4 border-b pb-2">
            {t('common:text-points-summary', 'Points Summary')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-body uppercase tracking-wider block mb-1">
                {t('common:text-current-balance', 'Current Balance')}
              </span>
              <span className="text-2xl font-bold text-accent">{member.points_balance}</span>
              <span className="text-xs text-body block mt-1">
                Value: ${currentPointsValue.toFixed(2)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-body uppercase tracking-wider block mb-1">
                {t('common:text-total-earned', 'Total Earned')}
              </span>
              <span className="text-2xl font-bold text-heading">{member.total_points_earned}</span>
              <span className="text-xs text-body block mt-1">
                Value: ${(member.total_points_earned * redeemRate).toFixed(2)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-body uppercase tracking-wider block mb-1">
                {t('common:text-total-redeemed', 'Total Redeemed')}
              </span>
              <span className="text-2xl font-bold text-heading">{member.total_points_redeemed}</span>
              <span className="text-xs text-body block mt-1">
                Value: ${totalRedeemedValue.toFixed(2)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-body uppercase tracking-wider block mb-1">
                {t('common:text-status', 'Status')}
              </span>
              <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium border border-accent/20 flex items-center gap-1.5">
                <CheckMarkCircle className="w-3 h-3" />
                Active Member
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-heading mb-4 border-b pb-2">
          {t('common:text-transaction-history', 'Transaction History')}
        </h2>
        <LoyaltyTransactionsList accountId={member.id} />
      </Card>
    </div>
  );
}

LoyaltyMemberDetails.authenticate = {
  permissions: adminOnly,
};
LoyaltyMemberDetails.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
