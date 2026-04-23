import Button from '@/components/ui/button';
import cn from 'classnames';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface DashboardTimeframeFilterProps {
  activeTimeFrame: number;
  onChange: (timeFrame: number) => void;
}

const DashboardTimeframeFilter = ({
  activeTimeFrame,
  onChange,
}: DashboardTimeframeFilterProps) => {
  const { t } = useTranslation('common');

  const timeFrames = [
    { name: t('text-today'), day: 1 },
    { name: t('text-weekly'), day: 7 },
    { name: t('text-monthly'), day: 30 },
    { name: t('text-yearly'), day: 365 },
  ];

  return (
    <div className="mt-3.5 inline-flex rounded-full bg-gray-100/80 p-1.5 sm:mt-0">
      {timeFrames.map((timeFrame) => (
        <div key={timeFrame.day} className="relative">
          <Button
            className={cn(
              '!focus:ring-0 relative z-10 !h-7 rounded-full !px-2.5 text-sm font-medium text-gray-500',
              timeFrame.day === activeTimeFrame ? 'text-accent' : '',
            )}
            type="button"
            onClick={() => onChange(timeFrame.day)}
            variant="custom"
          >
            {timeFrame.name}
          </Button>
          {timeFrame.day === activeTimeFrame ? (
            <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default DashboardTimeframeFilter;
