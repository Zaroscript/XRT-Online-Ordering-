import Badge from '@/components/ui/badge/badge';
import { useTranslation } from 'next-i18next';

interface StatusCellProps {
  errors: any[];
  warnings: any[];
}

export default function StatusCell({ errors, warnings }: StatusCellProps) {
  const { t } = useTranslation();

  const displayMessage = (err: { message: string }) => err.message;

  if (errors?.length > 0) {
    return (
      <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
        <span title={errors.map((e) => e.message).join(' · ')}>
          <Badge text={t('common:error')} color="bg-red-500" />
        </span>
        <span
          className="text-xs text-red-600 dark:text-red-400 truncate"
          title={errors.map((e) => e.message).join(' · ')}
        >
          {displayMessage(errors[0])}
        </span>
      </div>
    );
  }

  if (warnings?.length > 0) {
    return (
      <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
        <span title={warnings.map((w) => w.message).join(' · ')}>
          <Badge text={t('common:warning')} color="bg-amber-500" />
        </span>
        <span
          className="text-xs text-amber-700 dark:text-amber-300 truncate"
          title={warnings.map((w) => w.message).join(' · ')}
        >
          {displayMessage(warnings[0])}
        </span>
      </div>
    );
  }

  return <Badge text={t('common:valid')} color="bg-accent" />;
}
