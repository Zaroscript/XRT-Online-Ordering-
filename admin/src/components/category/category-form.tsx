import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Category, ItemProps } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { categoryValidationSchema } from './category-validation-schema';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/data/category';
import { useModifierGroupsQuery } from '@/data/modifier-group';
import { useSettingsQuery } from '@/data/settings';
import { useModalAction } from '@/components/ui/modal/modal.context';
import OpenAIButton from '@/components/openAI/openAI.button';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { CategoryDetailSuggestion } from '@/components/category/category-ai-prompt';
import SwitchInput from '@/components/ui/switch-input';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';
import { useItemsQuery } from '@/data/item';

type FormValues = {
  name: string;
  details?: string;
  image?: any;
  icon?: any;
  kitchen_section_id?: any;
  sort_order: number;
  is_active?: boolean;
  modifier_groups?: any;
  suggested_products?: any;
  apply_modifier_groups_to_items?: boolean;
};

const defaultValues = {
  image: [],
  name: '',
  details: '',
  icon: [],
  kitchen_section_id: null,
  sort_order: 0,
  is_active: true,
  modifier_groups: [],
  suggested_products: [],
  apply_modifier_groups_to_items: false,
};

type IProps = {
  initialValues?: Category | undefined;
};

export default function CreateOrUpdateCategoriesForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);

  const { locale } = router;

  const { data: kitchenSectionsData, isLoading: loadingKitchenSections } =
    useKitchenSectionsQuery();

  const kitchenSectionOptions = useMemo(() => {
    const sections =
      (kitchenSectionsData as any)?.data || kitchenSectionsData || [];
    return (Array.isArray(sections) ? sections : []).map((section: any) => ({
      label: section.name,
      value: section.id,
    }));
  }, [kitchenSectionsData]);

  const { settings } = useSettingsQuery({
    language: locale!,
  });
  const options = settings?.options;

  const { groups: modifierGroups, loading: loadingModifierGroups } =
    useModifierGroupsQuery({
      limit: 1000,
      language: locale!,
    });

  const { items: allProducts, loading: loadingProducts } = useItemsQuery({
    limit: 1000,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          ...initialValues,
          image: initialValues?.image
            ? typeof initialValues.image === 'string'
              ? [
                  {
                    id: 1,
                    thumbnail: initialValues.image,
                    original: initialValues.image,
                    file_name: (initialValues.image as any).split('/').pop(),
                  },
                ]
              : [initialValues.image]
            : [],
          icon: initialValues?.icon
            ? typeof initialValues.icon === 'string'
              ? [
                  {
                    id: 1,
                    thumbnail: initialValues.icon,
                    original: initialValues.icon,
                    file_name: initialValues.icon.split('/').pop(),
                  },
                ]
              : [initialValues.icon]
            : [],
          kitchen_section_id: initialValues.kitchen_section_data
            ? {
                label: initialValues.kitchen_section_data.name,
                value: initialValues.kitchen_section_data.id,
              }
            : initialValues.kitchen_section_id
              ? {
                  label: initialValues.kitchen_section_id,
                  value: initialValues.kitchen_section_id,
                }
              : null,
          modifier_groups: initialValues.modifier_groups?.map((bg: any) => ({
            label: bg.modifier_group_id?.name || bg.modifier_group_id,
            value: {
              modifier_group_id:
                bg.modifier_group_id?._id || bg.modifier_group_id,
              display_order: bg.display_order,
            },
          })),
          suggested_products: initialValues.suggested_products?.map(
            (p: any) => ({
              label: p.name || p.id || p,
              value: p.id || p,
            }),
          ),
        }
      : defaultValues,
    resolver: yupResolver(categoryValidationSchema),
  });

  const formattedValues = useMemo(() => {
    if (!initialValues) return undefined;
    return {
      ...initialValues,
      image: initialValues?.image
        ? typeof initialValues.image === 'string'
          ? [
              {
                id: 1,
                thumbnail: initialValues.image,
                original: initialValues.image,
                file_name: (initialValues.image as any).split('/').pop(),
              },
            ]
          : [initialValues.image]
        : [],
      icon: initialValues?.icon
        ? typeof initialValues.icon === 'string'
          ? [
              {
                id: 1,
                thumbnail: initialValues.icon,
                original: initialValues.icon,
                file_name: initialValues.icon.split('/').pop(),
              },
            ]
          : [initialValues.icon]
        : [],
      kitchen_section_id: kitchenSectionOptions.find(
        (opt: any) => opt.value === initialValues.kitchen_section_id,
      ),
      modifier_groups: initialValues.modifier_groups?.map((bg: any) => {
        const modifierGroupId =
          bg.modifier_group_id?._id || bg.modifier_group_id;
        const group = modifierGroups?.find(
          (g: any) => g.id === modifierGroupId,
        );
        return {
          label:
            group?.display_name ||
            group?.name ||
            bg.modifier_group_id?.name ||
            bg.modifier_group_id,
          value: {
            modifier_group_id: modifierGroupId,
            display_order: bg.display_order,
          },
        };
      }),
      suggested_products: initialValues.suggested_products?.map((p: any) => ({
        label: p.name || p.id || p,
        value: p.id || p,
      })),
    };
  }, [initialValues, kitchenSectionOptions, modifierGroups]);

  const previousValuesRef = useRef<string | null>(null);

  useEffect(() => {
    if (formattedValues) {
      const stringifiedValues = JSON.stringify(formattedValues);
      if (previousValuesRef.current !== stringifiedValues) {
        reset(formattedValues);
        previousValuesRef.current = stringifiedValues;
      }
    }
  }, [formattedValues, reset]);

  const { openModal } = useModalAction();

  const generateName = watch('name');
  const selectedModifierGroups = watch('modifier_groups');
  const selectedSuggestedProducts = watch('suggested_products');

  const categoryDetailSuggestionLists = useMemo(() => {
    return CategoryDetailSuggestion({ name: generateName ?? '' });
  }, [generateName]);

  const availableModifierGroupOptions = useMemo(() => {
    const selectedIds = (selectedModifierGroups || []).map(
      (mg: any) => mg?.value?.modifier_group_id || mg?.modifier_group_id,
    );
    return (
      modifierGroups
        ?.filter((group) => !selectedIds.includes(group.id))
        .map((group) => ({
          label: group.display_name || group.name,
          value: {
            modifier_group_id: group.id,
            modifier_group_name: group.name,
            display_order: 0,
          },
        })) || []
    );
  }, [modifierGroups, selectedModifierGroups]);

  const availableProductOptions = useMemo(() => {
    const selectedIds = (selectedSuggestedProducts || []).map(
      (p: any) => p?.value || p,
    );
    return (
      allProducts
        ?.filter((product) => !selectedIds.includes(product.id))
        .map((product) => ({
          label: product.name,
          value: product.id,
        })) || []
    );
  }, [allProducts, selectedSuggestedProducts]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'details',
      suggestion: categoryDetailSuggestionLists as ItemProps[],
    });
  }, [generateName, categoryDetailSuggestionLists, control, setValue, openModal]);

  const { mutate: createCategory, isPending: creating } =
    useCreateCategoryMutation();
  const { mutate: updateCategory, isPending: updating } =
    useUpdateCategoryMutation();

  const onSubmit = async (values: any) => {
    const selectedKitchenSectionId = values.kitchen_section_id?.value ?? null;

    const input = {
      language: router.locale,
      name: values.name,
      details: values.details,
      kitchen_section_id: selectedKitchenSectionId,
      sort_order: Number(values.sort_order),
      is_active: values.is_active,
      business_id: 'biz_001',
      modifier_groups: values.modifier_groups?.map((mg: any) => ({
        modifier_group_id: mg.value.modifier_group_id,
        display_order: mg.value.display_order || 0,
      })),
      suggested_products: values.suggested_products?.map(
        (p: any) => p.value || p,
      ),
      apply_modifier_groups_to_items: !!values.apply_modifier_groups_to_items,
    };

    const imageValue = Array.isArray(values.image)
      ? values.image[0]
      : values.image;
    const iconValue = Array.isArray(values.icon) ? values.icon[0] : values.icon;

    const imageFile = imageValue instanceof File ? imageValue : undefined;
    const iconFile = iconValue instanceof File ? iconValue : undefined;

    const payload: any = {
      ...input,
      image: imageFile,
      icon: iconFile,
    };

    if (!imageFile && imageValue?.original) {
      payload.image = imageValue.original;
      payload.image_public_id = imageValue.id;
    }
    if (!iconFile && iconValue?.original) {
      payload.icon = iconValue.original;
      payload.icon_public_id = iconValue.id;
    } else if (
      (initialValues?.icon && !iconFile && !iconValue) ||
      (initialValues?.icon &&
        !iconFile &&
        Array.isArray(iconValue) &&
        iconValue.length === 0)
    ) {
      payload.delete_icon = true;
    }

    if (
      !initialValues ||
      !initialValues.translated_languages?.includes(router.locale!)
    ) {
      createCategory({
        ...payload,
      });
    } else {
      updateCategory({
        ...payload,
        id: initialValues.id!,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-heading mb-1">
            {t('form:input-label-image')} & {t('form:icon-title')}
          </h3>
          <p className="text-sm text-body">
            {t('form:category-image-helper-text')} {t('form:icon-helper-text')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="overflow-hidden rounded-xl border-2 border-dashed border-border-200 bg-gray-50/30 transition hover:border-accent/40 hover:bg-gray-50/50">
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('form:input-label-image')}
              </span>
              <p className="mt-1 text-xs text-body mb-3">
                {t('form:category-image-helper-text')}
              </p>
              <FileInput
                name="image"
                control={control as any}
                multiple={false}
                section="categories"
              />
            </div>
          </Card>
          <Card className="overflow-hidden rounded-xl border-2 border-dashed border-border-200 bg-gray-50/30 transition hover:border-accent/40 hover:bg-gray-50/50">
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('form:icon-title')}
              </span>
              <p className="mt-1 text-xs text-body mb-3">
                {t('form:icon-helper-text')} SVG, PNG, JPG.
              </p>
              <FileInput
                name="icon"
                control={control as any}
                multiple={false}
                accept="image/*"
                helperText={t('form:upload-image-help-text')}
                section="categories"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:category-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="relative mb-5">
            {options?.useAi && (
              <OpenAIButton
                title={t('form:button-label-description-ai')}
                onClick={handleGenerateDescription}
              />
            )}
            <TextArea
              label={t('form:input-label-details')}
              {...register('details')}
              variant="outline"
            />
          </div>

          <div className="mb-5">
            <Label>
              {t('form:input-label-kitchen-section') || 'Kitchen Section'}
            </Label>
            <SelectInput
              name="kitchen_section_id"
              control={control as any}
              options={kitchenSectionOptions}
              isClearable={true}
              isLoading={loadingKitchenSections}
            />
            <ValidationError message={t(errors.kitchen_section_id?.message!)} />
          </div>

          <div className="mb-5">
            <Input
              label={t('form:input-label-sort-order')}
              {...register('sort_order')}
              type="number"
              variant="outline"
              error={t(errors.sort_order?.message!)}
            />
          </div>

          <div className="mb-5">
            <SwitchInput
              name="is_active"
              control={control as any}
              label={t('form:input-label-is-active-question')}
            />
          </div>

          <div className="mb-5 border-t border-dashed border-border-200 pt-5">
            <Label>{t('form:input-label-modifier-groups')}</Label>
            <SelectInput
              name="modifier_groups"
              control={control as any}
              options={availableModifierGroupOptions}
              isMulti
              isLoading={loadingModifierGroups}
            />
          </div>

          <div className="mb-5">
            <SwitchInput
              name="apply_modifier_groups_to_items"
              control={control as any}
              label={t('form:input-label-apply-modifier-groups-to-items')}
            />
          </div>

          <div className="mb-5 border-t border-dashed border-border-200 pt-5">
            <Label>{t('form:input-label-suggested-products') || 'Suggested Products'}</Label>
            <SelectInput
              name="suggested_products"
              control={control as any}
              options={availableProductOptions}
              isMulti
              isLoading={loadingProducts}
            />
            <p className="mt-2 text-xs text-body">
              {t('form:category-suggested-products-helper-text') || 'Select products to suggest when viewing items from this category.'}
            </p>
          </div>
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          <Button
            variant="outline"
            onClick={() => router.push(Routes.category.list)}
            className="text-sm me-4 md:text-base"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update-category')
              : t('form:button-label-add-category')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
