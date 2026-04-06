import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useTranslation } from 'next-i18next';
import { LoyaltyProgram, LoyaltyProgramInput } from '@/types';
import { useUpdateLoyaltyProgramMutation } from '@/data/loyalty';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import Label from '@/components/ui/label';
import { useSettings } from '@/contexts/settings.context';

type FormValues = LoyaltyProgramInput;

const defaultValues: FormValues = {
  is_active: false,
  earn_rate_points_per_currency: 1,
  redeem_rate_currency_per_point: 0.01,
  minimum_points_to_redeem: 100,
  max_discount_percent_per_order: 50,
};

type IProps = {
  initialValues?: LoyaltyProgram | null;
};

export default function LoyaltySettingsForm({ initialValues }: IProps) {
  const { t } = useTranslation();
  const { currency } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues ? {
      is_active: initialValues.is_active,
      earn_rate_points_per_currency: initialValues.earn_rate_points_per_currency,
      redeem_rate_currency_per_point: initialValues.redeem_rate_currency_per_point,
      minimum_points_to_redeem: initialValues.minimum_points_to_redeem,
      max_discount_percent_per_order: initialValues.max_discount_percent_per_order,
    } : defaultValues,
  });

  const { mutate: updateProgram, isPending: updating } = useUpdateLoyaltyProgramMutation();

  const onSubmit = async (values: FormValues) => {
    updateProgram(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8 text-gray-700">
        <Description
          title={t('form:label-loyalty-status', 'Program Status')}
          details={t('form:loyalty-status-help', 'Enable or disable the global loyalty program.')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput name="is_active" control={control} />
              <Label className="mb-0">
                {t('form:label-loyalty-active', 'Active')}
              </Label>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap my-5 sm:my-8 text-gray-700">
        <Description
          title={t('form:label-loyalty-rules', 'Earning & Redemption Rules')}
          details={t('form:loyalty-rules-help', 'Set how points are earned and how much they are worth when redeemed.')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:label-earn-rate', `Points earned per 1 ${currency} spent`)}
            {...register('earn_rate_points_per_currency', { valueAsNumber: true, min: 0 })}
            type="number"
            step="0.01"
            error={t(errors.earn_rate_points_per_currency?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <Input
            label={t('form:label-redeem-rate', `Value of 1 point in ${currency} (e.g., 0.05 for 5 cents)`)}
            {...register('redeem_rate_currency_per_point', { valueAsNumber: true, min: 0 })}
            type="number"
            step="0.001"
            error={t(errors.redeem_rate_currency_per_point?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <Input
            label={t('form:label-min-points', 'Minimum points to redeem')}
            {...register('minimum_points_to_redeem', { valueAsNumber: true, min: 0, validate: (val) => Number.isInteger(val) || 'Must be an integer' })}
            type="number"
            error={t(errors.minimum_points_to_redeem?.message!)}
            variant="outline"
            className="mb-5"
            required
          />
          <Input
            label={t('form:label-max-discount', 'Max discount percent per order')}
            {...register('max_discount_percent_per_order', { valueAsNumber: true, min: 0, max: 100 })}
            type="number"
            error={t(errors.max_discount_percent_per_order?.message as any)}
            variant="outline"
            className="mb-5"
            required
          />
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="text-end">
          <Button
            loading={updating}
            disabled={updating}
          >
            {t('form:button-label-save', 'Save Settings')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
