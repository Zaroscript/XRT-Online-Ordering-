import { Control } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import SwitchInput from '@/components/ui/switch-input';
import { FormValues } from '../item-form-types';

interface SettingsSectionProps {
  control: Control<FormValues>;
}

export default function SettingsSection({ control }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={t('form:form-settings-title')}
        details={t('form:item-description-help-text')}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />
      <Card className="w-full sm:w-8/12 md:w-2/3">
        <div className="mb-5">
          <SwitchInput
            name="is_active"
            control={control}
            label={t('form:input-label-active')}
          />
        </div>
        <div className="mb-5">
          <SwitchInput
            name="is_available"
            control={control}
            label={t('form:input-label-available')}
          />
        </div>
        <div className="mb-5">
          <SwitchInput
            name="is_signature"
            control={control}
            label={t('form:input-label-signature-dish')}
          />
        </div>
        <div className="mb-5">
          <SwitchInput
            name="is_customizable"
            control={control}
            label={t('form:input-label-customizable')}
          />
        </div>
      </Card>
    </div>
  );
}
