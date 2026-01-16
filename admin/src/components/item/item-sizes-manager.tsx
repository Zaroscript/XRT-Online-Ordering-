import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { PlusIcon } from '@/components/icons/plus-icon';
import { CloseIcon } from '@/components/icons/close-icon';
import { CheckMark } from '@/components/icons/checkmark';
import { useItemSizesQuery, useCreateItemSizeMutation } from '@/data/item-size';
import { ItemSize, ItemSizeConfig } from '@/types';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { Switch } from '@headlessui/react';
import { Controller, useForm } from 'react-hook-form';
import Description from '@/components/ui/description';
import cn from 'classnames';

interface ItemSizesManagerProps {
  businessId: string;
  value?: ItemSizeConfig[];
  onChange?: (value: ItemSizeConfig[]) => void;
  defaultSizeId?: string | null;
  onDefaultSizeChange?: (sizeId: string | null) => void;
  disabled?: boolean;
}

interface CreateGlobalSizeForm {
  name: string;
  code: string;
  display_order: number;
}

export default function ItemSizesManager({
  businessId,
  value = [],
  onChange,
  defaultSizeId,
  onDefaultSizeChange,
  disabled = false,
}: ItemSizesManagerProps) {
  const { t } = useTranslation();
  const {
    sizes: globalSizes,
    isLoading,
    error,
  } = useItemSizesQuery(businessId);
  const { mutate: createGlobalSize, isPending: creating } =
    useCreateItemSizeMutation();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form for creating a new GLOBAL size
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGlobalSizeForm>({
    defaultValues: {
      name: '',
      code: '',
      display_order: 0,
    },
  });

  const handleCreateGlobalSize = (data: CreateGlobalSizeForm) => {
    createGlobalSize(
      {
        business_id: businessId,
        name: data.name,
        code: data.code,
        display_order: data.display_order,
        is_active: true,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          reset();
        },
      },
    );
  };

  // Helper handling changes to specific size config
  const handleConfigChange = (
    sizeId: string,
    changes: Partial<ItemSizeConfig>,
  ) => {
    // Check if config exists
    const existingConfigIndex = value.findIndex((c) => c.size_id === sizeId);
    let newValue = [...value];

    if (existingConfigIndex >= 0) {
      newValue[existingConfigIndex] = {
        ...newValue[existingConfigIndex],
        ...changes,
      };
    } else {
      // Create new config if we are enabling a size or setting a price
      newValue.push({
        size_id: sizeId,
        price: 0,
        is_default: false,
        is_active: true,
        ...changes,
      });
    }

    // Filter out configs that are effectively empty/disabled if logic requires,
    // but typically we keep them if they are in the list.
    // Actually, let's say "enabled" means present in the array.
    onChange?.(newValue);
  };

  const toggleSizeEnabled = (sizeId: string, enabled: boolean) => {
    if (enabled) {
      if (!value.find((c) => c.size_id === sizeId)) {
        handleConfigChange(sizeId, {});
      }
    } else {
      // Remove from value
      const newValue = value.filter((c) => c.size_id !== sizeId);
      onChange?.(newValue);

      if (defaultSizeId === sizeId) {
        onDefaultSizeChange?.(null);
      }
    }
  };

  if (isLoading) return <Loader text={t('form:loading-sizes')} />;
  if (error)
    return (
      <ErrorMessage
        message={(error as any)?.message || t('form:error-loading-sizes')}
      />
    );

  // Prepare data for table: Merge global sizes with current item config
  const data = globalSizes.map((globalSize) => {
    const config = value.find((c) => c.size_id === globalSize.id);
    return {
      ...globalSize,
      itemConfig: config,
      isEnabled: !!config,
    };
  });

  const columns = [
    {
      title: t('common:status'),
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 80,
      render: (isEnabled: boolean, record: any) => (
        <div className="flex items-center justify-center">
          {isEnabled ? (
            <button
              type="button"
              onClick={() => toggleSizeEnabled(record.id, false)}
              disabled={disabled}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckMark className="h-5 w-5 text-accent" />
            </button>
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                onChange={(e) => toggleSizeEnabled(record.id, e.target.checked)}
                disabled={disabled}
                className="form-checkbox h-5 w-5 border-gray-300 rounded focus:ring-accent"
              />
            </label>
          )}
        </div>
      ),
    },
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: any) => (
        <div className="flex flex-col">
          <span
            className={cn(
              'text-sm font-medium',
              !record.isEnabled && 'text-gray-400',
            )}
          >
            {name}
          </span>
          <span className="text-xs text-gray-500 font-mono">{record.code}</span>
        </div>
      ),
    },
    {
      title: t('common:price'),
      dataIndex: 'id',
      key: 'price',
      width: 150,
      render: (id: string, record: any) => {
        if (!record.isEnabled) return <span className="text-gray-400">-</span>;
        return (
          <Input
            name={`price-${id}`}
            type="number"
            min="0"
            step="0.01"
            value={record.itemConfig?.price ?? 0}
            onChange={(e) =>
              handleConfigChange(id, { price: parseFloat(e.target.value) })
            }
            disabled={disabled}
            className="!h-9 !text-sm w-32"
            placeholder="0.00"
          />
        );
      },
    },
    {
      title: t('common:is-default'),
      dataIndex: 'id',
      key: 'is_default',
      width: 100,
      render: (id: string, record: any) => {
        if (!record.isEnabled) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="default-size"
                checked={defaultSizeId === id}
                onChange={() => onDefaultSizeChange?.(id)}
                disabled={disabled}
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300"
              />
              {defaultSizeId === id && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckMark className="h-3 w-3 text-accent" />
                </span>
              )}
            </label>
          </div>
        );
      },
    },
    {
      title: t('common:is-active'),
      dataIndex: 'id',
      key: 'is_active',
      width: 100,
      render: (id: string, record: any) => {
        if (!record.isEnabled) return <span className="text-gray-400">-</span>;
        return (
          <Switch
            checked={record.itemConfig?.is_active ?? true}
            onChange={(checked: boolean) =>
              handleConfigChange(id, { is_active: checked })
            }
            disabled={disabled}
            className={cn(
              (record.itemConfig?.is_active ?? true)
                ? 'bg-accent'
                : 'bg-gray-300',
              'relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none',
              disabled ? 'cursor-not-allowed bg-[#EEF1F4]' : '',
            )}
          >
            <span className="sr-only">Enable</span>
            <span
              className={cn(
                (record.itemConfig?.is_active ?? true)
                  ? 'translate-x-6'
                  : 'translate-x-1',
                'inline-block h-4 w-4 transform rounded-full bg-light transition-transform',
              )}
            />
          </Switch>
        );
      },
    },
  ];

  return (
    <Card className="overflow-hidden bg-light border-0 shadow-none">
      <div className="mb-6 flex items-center justify-between border-b border-border-200 pb-4">
        <div>
          <Label className="text-lg font-semibold text-heading">
            {t('form:input-label-sizes')}
          </Label>
          <Description className="mt-1 text-sm text-body">
            {t('form:sizes-global-help-text')}
          </Description>
        </div>
        {!showAddForm && (
          <Button
            type="button"
            size="small"
            onClick={() => setShowAddForm(true)}
            disabled={disabled}
            className="shrink-0"
          >
            <PlusIcon className="h-4 w-4 me-2" />
            {t('form:button-label-create-global-size')}
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="mb-6 border-2 border-dashed border-accent/30 bg-accent/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-heading">
              {t('form:create-new-global-size')}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => {
                setShowAddForm(false);
                reset();
              }}
              className="!h-8 !w-8 !p-0"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit(handleCreateGlobalSize)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label className="mb-2">
                  {t('form:input-label-size-name')}*
                </Label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('form:error-size-name-required') }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      error={errors.name?.message}
                      className="!h-10"
                      placeholder="e.g. Small"
                    />
                  )}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t('form:input-label-size-code')}*
                </Label>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: t('form:error-size-code-required') }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      error={errors.code?.message}
                      className="!h-10 font-mono"
                      placeholder="e.g. S"
                    />
                  )}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t('form:input-label-display-order')}
                </Label>
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      className="!h-10"
                      placeholder="0"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" loading={creating} disabled={creating}>
                {t('form:button-label-create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {globalSizes.length === 0 ? (
        <div className="py-8 text-center border rounded border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {t('form:text-no-global-sizes-found')}
          </p>
          <Button size="small" onClick={() => setShowAddForm(true)}>
            {t('form:button-create-first-size')}
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          data={data}
          rowKey="id"
          scroll={{ x: 600 }}
          className="sizes-table"
        />
      )}
    </Card>
  );
}
