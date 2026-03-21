import React from 'react';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';
import { ChevronDown } from '@/components/icons/chevronDownIcon';
import cn from 'classnames';

interface ImportSummaryCardProps {
  counts: {
    categories: number;
    items: number;
    sizes: number;
    modifierGroups: number;
    modifiers: number;
  };
  onSave: () => void;
  isSaving: boolean;
  onToggleDetails: () => void;
  detailsVisible: boolean;
}

export const ImportSummaryCard: React.FC<ImportSummaryCardProps> = ({
  counts,
  onSave,
  isSaving,
  onToggleDetails,
  detailsVisible,
}) => {
  const { t } = useTranslation();

  const totalRecords =
    counts.categories +
    counts.items +
    counts.sizes +
    counts.modifierGroups +
    counts.modifiers;

  const summaryParts = [];
  if (counts.categories > 0) summaryParts.push(`${counts.categories} Categories`);
  if (counts.items > 0) summaryParts.push(`${counts.items} Items`);
  if (counts.sizes > 0) summaryParts.push(`${counts.sizes} Sizes`);
  if (counts.modifierGroups > 0) summaryParts.push(`${counts.modifierGroups} Mod Groups`);
  if (counts.modifiers > 0) summaryParts.push(`${counts.modifiers} Modifiers`);

  return (
    <Card className="mb-6 border border-green-200 bg-green-50 shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100/50">
            <CheckMarkFill className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading mb-1">
              Ready to Import
            </h3>
            <p className="text-sm text-body mb-3">
              We parsed <span className="font-semibold text-heading">{totalRecords}</span> records with 0 errors. You can safely save this data to your catalog.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-green-700 bg-green-100/50 px-3 py-1.5 rounded-lg border border-green-200">
              {summaryParts.length > 0 ? summaryParts.join(' • ') : 'No data found'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 min-w-[200px]">
          <Button
            onClick={onSave}
            loading={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md border-0"
            size="big"
          >
            {t('common:text-save-to-database')}
          </Button>
          <button
            onClick={onToggleDetails}
            className="flex items-center justify-center text-sm font-semibold text-body hover:text-heading py-2 px-4 whitespace-nowrap"
          >
            {detailsVisible ? 'Hide Details' : 'Review Details'}
            <ChevronDown
              className={cn('ml-1 h-4 w-4 transition-transform', {
                'rotate-180': detailsVisible,
              })}
            />
          </button>
        </div>
      </div>
    </Card>
  );
};
