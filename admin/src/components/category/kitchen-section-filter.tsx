import Select from '@/components/ui/select/select';
import React from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { ActionMeta } from 'react-select';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';

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

    const { data } = useKitchenSectionsQuery();
    const sections = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []) as { id: string; name: string }[];

    const kitchenSectionOptions = sections.map((s) => ({
        label: s.name,
        value: s.id,
    }));

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
