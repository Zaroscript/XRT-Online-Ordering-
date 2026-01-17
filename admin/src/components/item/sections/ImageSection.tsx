import { Control } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import { FormValues } from '../item-form-types';

interface ImageSectionProps {
  control: Control<FormValues>;
}

export default function ImageSection({ control }: ImageSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
      <Description
        title={t('form:featured-image-title')}
        details={t('form:featured-image-help-text')}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />

      <Card className="w-full sm:w-8/12 md:w-2/3">
        <FileInput name="image" control={control} multiple={false} />
      </Card>
    </div>
  );
}
