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
import { Config } from '@/config';
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
import edit from '@/pages/[shop]/edit';

type FormValues = {
  name: string;
  details?: string;
  image?: any;
  icon?: any;
  kitchen_section_id: any;
  sort_order: number;
  is_active?: boolean;
  modifier_groups?: any;
  apply_modifier_groups_to_items?: boolean;
};

const defaultValues = {
  image: [],
  name: '',
  details: '',
  icon: [],
  kitchen_section_id: '',
  sort_order: 0,
  is_active: true,
  modifier_groups: [],
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

  const isNewTranslation = router?.query?.action === 'translate';

  // Helper for text fallback
  const getFallback = useCallback(
    (key: string, accessKey: string, fallback: string) => {
      const val = t(accessKey);
      return val === key || val === accessKey ? fallback : val;
    },
    [t],
  );

  const kitchenSectionOptions: { label: string; value: string }[] = useMemo(
    () => [
      {
        label: getFallback(
          'kitchen-section-appetizers',
          'common:kitchen-section-appetizers',
          'Appetizers',
        ),
        value: 'KS_001',
      },
      {
        label: getFallback(
          'kitchen-section-main-course',
          'common:kitchen-section-main-course',
          'Main Course',
        ),
        value: 'KS_002',
      },
      {
        label: getFallback(
          'kitchen-section-desserts',
          'common:kitchen-section-desserts',
          'Desserts',
        ),
        value: 'KS_003',
      },
      {
        label: getFallback(
          'kitchen-section-beverages',
          'common:kitchen-section-beverages',
          'Beverages',
        ),
        value: 'KS_004',
      },
    ],
    [t],
  );

  const { locale } = router;
  const {
    // @ts-ignore
    settings: { options },
  } = useSettingsQuery({
    language: locale!,
  });

  const { groups: modifierGroups, loading: loadingModifierGroups } =
    useModifierGroupsQuery({
      limit: 1000,
      language: locale!,
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
          kitchen_section_id: kitchenSectionOptions.find(
            (opt: any) => opt.value === initialValues.kitchen_section_id,
          ),
          modifier_groups: initialValues.modifier_groups?.map((bg: any) => ({
            label: bg.modifier_group_id?.name || bg.modifier_group_id, // Handle populated vs string ID if needed, though usually populated in detailed view
            value: {
              modifier_group_id:
                bg.modifier_group_id?._id || bg.modifier_group_id,
              display_order: bg.display_order,
            },
          })),
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
    };
  }, [initialValues, kitchenSectionOptions, modifierGroups]);

  const previousValuesRef = useRef<string | null>(null);

  // Reset form when formattedValues changes (using deep comparison check)
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

  const categoryDetailSuggestionLists = useMemo(() => {
    return CategoryDetailSuggestion({ name: generateName ?? '' });
  }, [generateName]);

  // Create modifier group options - filter out already selected ones to prevent duplicate selection
  const availableModifierGroupOptions = useMemo(() => {
    const selectedIds = (selectedModifierGroups || []).map(
      (mg: any) => mg?.value?.modifier_group_id || mg?.modifier_group_id,
    );
    return (
      modifierGroups
        ?.filter((group) => !selectedIds.includes(group.id))
        .map((group) => ({
          label: group.display_name || group.name, // Use display_name if available, fallback to name
          value: {
            modifier_group_id: group.id,
            modifier_group_name: group.name, // Use name for system use
            display_order: 0,
          },
        })) || []
    );
  }, [modifierGroups, selectedModifierGroups]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'details',
      suggestion: categoryDetailSuggestionLists as ItemProps[],
    });
  }, [generateName]);

  const { mutate: createCategory, isPending: creating } =
    useCreateCategoryMutation();
  const { mutate: updateCategory, isPending: updating } =
    useUpdateCategoryMutation();

  const onSubmit = async (values: any) => {
    const input = {
      language: router.locale,
      name: values.name,
      details: values.details,
      kitchen_section_id: values.kitchen_section_id?.value,
      sort_order: Number(values.sort_order),
      is_active: values.is_active,
      business_id: 'biz_001',
      modifier_groups: values.modifier_groups?.map((mg: any) => ({
        modifier_group_id: mg.value.modifier_group_id,
        display_order: mg.value.display_order || 0,
      })),
      apply_modifier_groups_to_items: !!values.apply_modifier_groups_to_items,
    };

    // Extract File objects if they exist in the values (returned as array from FileInput)
    // If the Uploader already successfully uploaded to /attachments, it will be an object with id/thumbnail/original
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

    // If it's already uploaded (has id/thumbnail), pass the URL and ID in the body
    if (!imageFile && imageValue?.original) {
      payload.image = imageValue.original;
      payload.image_public_id = imageValue.id;
    }
    if (!iconFile && iconValue?.original) {
      payload.icon = iconValue.original;
      payload.icon_public_id = iconValue.id;
    }

    // If we are updating and haven't provided a new file, we don't want to send the "existing" image object
    // as it would be serialized to string incorrectly.
    // However, if we want to preserve the existing image, we just don't send anything for 'image' in FormData.
    // The backend won't update it if it's not provided in req.files and not in req.body.

    console.log('--- CATEGORY SUBMIT PAYLOAD ---');
    console.log(payload);
    console.log('-------------------------------');

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
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:category-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput
            name="image"
            control={control as any}
            multiple={false}
            section="categories"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:icon-title')}
          details={t('form:icon-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput
            name="icon"
            control={control as any}
            multiple={false}
            accept="image/svg+xml"
            helperText={t('form:upload-svg-helper-text')}
            section="categories"
          />
        </Card>
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
              {getFallback(
                'input-label-kitchen-section',
                'form:input-label-kitchen-section',
                'Kitchen Section',
              )}
            </Label>
            <SelectInput
              name="kitchen_section_id"
              control={control as any}
              options={kitchenSectionOptions}
              isClearable={true}
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

          <div className="mb-5">
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
