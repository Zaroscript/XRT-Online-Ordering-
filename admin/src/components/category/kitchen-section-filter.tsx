import Select from '@/components/ui/select/select';
import React from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { ActionMeta } from 'react-select';



type Props = {
    onKitchenSectionFilter: (newValue: any, actionMeta: ActionMeta<unknown>) => void;
    className?: string;
};

export default function KitchenSectionFilter({ onKitchenSectionFilter, className }: Props) {
    const { t } = useTranslation(['common', 'form']);

    const getFallback = (key: string, accessKey: string, fallback: string) => {
        const val = t(accessKey);
        return val === key || val === accessKey ? fallback : val;
    };

    const kitchenSectionOptions = [
        { label: getFallback('kitchen-section-appetizers', 'common:kitchen-section-appetizers', 'Appetizers'), value: 'KS_001' },
        { label: getFallback('kitchen-section-main-course', 'common:kitchen-section-main-course', 'Main Course'), value: 'KS_002' },
        { label: getFallback('kitchen-section-desserts', 'common:kitchen-section-desserts', 'Desserts'), value: 'KS_004' },
        { label: getFallback('kitchen-section-beverages', 'common:kitchen-section-beverages', 'Beverages'), value: 'KS_004' },
    ];

    return (
        <div className={cn('flex w-full', className)}>
            <div className="w-full">
                <Select
                    options={kitchenSectionOptions}
                    getOptionLabel={(option: any) => option.label}
                    getOptionValue={(option: any) => option.value}
                    placeholder={getFallback('input-placeholder-kitchen-section-filter', 'form:input-placeholder-kitchen-section-filter', 'Filter by Kitchen Section')}
                    onChange={onKitchenSectionFilter}
                    isClearable={true}
                />
            </div>
        </div>
    );
}
