import { useForm, FormProvider, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { itemValidationSchema } from './item-validation-schema';
import { CreateItemInput, UpdateItemInput, ItemSizeConfig } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getErrorMessage } from '@/utils/form-error';
import { useCreateItemMutation, useUpdateItemMutation } from '@/data/item';
import { useMeQuery } from '@/data/user';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { EditIcon } from '@/components/icons/edit';
import { useCategoriesQuery } from '@/data/category';
import { useModifierGroupsQuery } from '@/data/modifier-group';
import { useModifiersQuery } from '@/data/modifier';
import { useItemSizesQuery } from '@/data/item-size';
import {
  adminOnly,
  getAuthCredentials,
  hasPermission,
} from '@/utils/auth-utils';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  MobileTabSelect,
} from '@/components/ui/tabs';

// Types and constants
import {
  FormValues,
  ItemFormProps,
  defaultFormValues,
} from './item-form-types';

// Hooks
import {
  useItemFormCache,
  transformInitialModifierAssignment,
} from './hooks/use-item-form';

// Utils
import { getGroupId } from './utils/item-form-utils';
import {
  filterSizeRelatedGroups,
  filterGroupsByModifiers,
  filterRelevantModifiers,
} from './utils/modifier-helpers';
import {
  transformModifierAssignment,
  buildCreateItemInput,
} from './utils/form-transformers';

// UI Sections
import BasicInfoSection from './sections/BasicInfoSection';
import SizesSection from './sections/SizesSection';
import ImageSection from './sections/ImageSection';
import ModifiersSection from './sections/ModifiersSection';

export default function CreateOrUpdateItemForm({
  initialValues,
}: ItemFormProps) {
  const router = useRouter();
  const { locale } = router;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Shop data
  const { data: shopData } = useShopQuery(
    { slug: router.query.shop as string },
    { enabled: !!router.query.shop },
  );
  const { data: me } = useMeQuery();
  const authCredentials = getAuthCredentials();
  const shopId =
    (shopData as any)?.id! ||
    initialValues?.business_id ||
    me?.managed_shop?.id ||
    me?.shops?.[0]?.id;

  // Form caching
  const {
    cacheKey,
    cachedFormData,
    setCachedFormData,
    imageFileRef,
    clearCache,
    getInitialValues,
  } = useItemFormCache({
    itemId: initialValues?.id,
    shopId,
    initialValues,
  });

  // Form setup
  const methods = useForm<FormValues>({
    resolver: yupResolver(itemValidationSchema),
    shouldUnregister: false,
    defaultValues: getInitialValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  // Watch form values
  const isSizeable = useWatch({
    control,
    name: 'is_sizeable',
    defaultValue: false,
  });
  const defaultSizeId = useWatch({
    control,
    name: 'default_size_id',
    defaultValue: null,
  });
  const selectedModifierGroups =
    useWatch({
      control,
      name: 'modifier_assignment.modifier_groups',
      defaultValue: [],
    }) || [];

  // Initialize form with cached or initial values
  useEffect(() => {
    if (
      cachedFormData &&
      (!initialValues ||
        (initialValues.id && cacheKey.includes(initialValues.id)))
    ) {
      methods.reset(cachedFormData);
      setIsInitialized(true);
    } else if (initialValues) {
      const modifierAssignment =
        transformInitialModifierAssignment(initialValues);
      const formValues: FormValues = {
        ...initialValues,
        category: initialValues.category,
        sizes: initialValues.sizes || [],
        max_per_order: initialValues.max_per_order ?? undefined,
        is_sizeable:
          initialValues.is_sizeable || !!initialValues.default_size_id || false,
        default_size_id: initialValues.default_size_id || null,
        is_customizable: initialValues.is_customizable || false,
        modifier_groups: initialValues.modifier_groups || [],
        modifier_assignment: modifierAssignment || {
          modifier_groups: [],
          default_modifiers: [],
          assignment_scope: 'ITEM' as const,
        },
      };
      methods.reset(formValues);
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Cache form data on change using subscription
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = watch((formValues) => {
      if (!formValues || !Object.keys(formValues).length) return;
      const cacheableData: Partial<FormValues> = {
        ...(formValues as any),
        image: formValues.image
          ? typeof formValues.image === 'string'
            ? formValues.image
            : ''
          : undefined,
        // Cast sizes to satisfy ItemSizeConfig[] type (watch returns deeply partial types)
        sizes: formValues.sizes as ItemSizeConfig[] | undefined,
      };
      if (formValues.image && typeof formValues.image !== 'string') {
        imageFileRef.current = formValues.image as File;
      }
      setCachedFormData(cacheableData as FormValues);
    });

    return () => subscription.unsubscribe();
  }, [isInitialized, watch, setCachedFormData, imageFileRef]);

  // Auto-set is_sizeable
  useEffect(() => {
    if (initialValues?.default_size_id && !isSizeable) {
      setValue('is_sizeable', true, { shouldValidate: false });
    }
  }, [initialValues?.id, initialValues?.default_size_id, isSizeable]);

  // Switch to sizes tab when is_sizeable is enabled - REMOVED to prevent auto-switching on load
  /*
  useEffect(() => {
    if (isSizeable) {
      setActiveTab('sizes');
    }
  }, [isSizeable]);
  */

  // Mutations
  const { mutate: createItem, isPending: creating } = useCreateItemMutation();
  const { mutate: updateItem, isPending: updating } = useUpdateItemMutation();

  const handleCreateItem = useCallback(
    (data: CreateItemInput) => {
      createItem(data, { onSuccess: clearCache });
    },
    [createItem, clearCache],
  );

  const handleUpdateItem = useCallback(
    (data: UpdateItemInput) => {
      updateItem(data, {
        onSuccess: () => {
          clearCache();
          router.back();
        },
      });
    },
    [updateItem, clearCache, router],
  );

  // Data queries
  const { categories, loading: loadingCategories } = useCategoriesQuery({
    limit: 1000,
    language: locale,
    type: 'all',
  });

  const { groups: modifierGroupsRaw, loading: loadingModifierGroups } =
    useModifierGroupsQuery({ limit: 1000, language: locale, is_active: true });

  const { modifiers: allModifiersList, loading: loadingModifiers } =
    useModifiersQuery({ limit: 1000, language: locale, is_active: true });

  const { sizes: itemSizes } = useItemSizesQuery(shopId, {
    enabled: !!shopId && isSizeable,
  });

  // Filter modifier groups
  const modifierGroups = useMemo(
    () => filterSizeRelatedGroups(modifierGroupsRaw || []),
    [modifierGroupsRaw],
  );

  const modifierGroupsFiltered = useMemo(
    () => filterGroupsByModifiers(modifierGroups, allModifiersList || []),
    [modifierGroups, allModifiersList],
  );

  const relevantModifiers = useMemo(
    () =>
      filterRelevantModifiers(allModifiersList || [], selectedModifierGroups),
    [allModifiersList, selectedModifierGroups],
  );

  // Populate modifier groups with full objects
  useEffect(() => {
    if (isInitialized && modifierGroups && allModifiersList && initialValues) {
      const currentValues = getValues();
      if (currentValues.modifier_assignment?.modifier_groups) {
        const populatedGroups =
          currentValues.modifier_assignment.modifier_groups.map(
            (group: any) => {
              if (typeof group === 'string') {
                return modifierGroups.find((g: any) => g.id === group) || group;
              }
              return group;
            },
          );

        const populatedModifiers =
          currentValues.modifier_assignment.default_modifiers?.map(
            (modifier: any) => {
              if (typeof modifier === 'string') {
                return (
                  allModifiersList.find((m: any) => m.id === modifier) ||
                  modifier
                );
              }
              return modifier;
            },
          ) || [];

        if (
          populatedGroups.some(
            (g: any, idx: number) =>
              g !== currentValues.modifier_assignment?.modifier_groups?.[idx],
          )
        ) {
          setValue('modifier_assignment.modifier_groups', populatedGroups, {
            shouldValidate: false,
          });
        }

        if (
          populatedModifiers.some(
            (m: any, idx: number) =>
              m !== currentValues.modifier_assignment?.default_modifiers?.[idx],
          )
        ) {
          setValue(
            'modifier_assignment.default_modifiers',
            populatedModifiers,
            { shouldValidate: false },
          );
        }
      }
    }
  }, [modifierGroups, allModifiersList, isInitialized, initialValues?.id]);

  // Form submission
  const onSubmit = async (values: any) => {
    let basePrice: number | undefined = undefined;

    if (!values.is_sizeable) {
      basePrice = values.base_price ?? 0;
      if (!basePrice || basePrice <= 0) {
        setError('base_price', {
          type: 'manual',
          message: t('form:error-base-price-required'),
        });
        return;
      }
    } else {
      basePrice = 0;
      if (!values.default_size_id) {
        setError('default_size_id', {
          type: 'manual',
          message: t('form:error-default-size-required'),
        });
        return;
      }
    }

    const modifierGroupsForBackend = transformModifierAssignment(
      values,
      allModifiersList || [],
      itemSizes,
    );

    const inputValues = buildCreateItemInput(
      values,
      shopId,
      basePrice,
      modifierGroupsForBackend,
    );

    try {
      if (!initialValues) {
        handleCreateItem(inputValues);
      } else {
        handleUpdateItem({ ...inputValues, id: initialValues.id });
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  const onError = (errors: any) => {
    console.error('Validation Errors:', errors);
    const errorMsg = t('form:error-check-inputs');
    setErrorMessage(errorMsg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`) || errorMessage}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <Tabs
            defaultTab="basic"
            className="w-full"
            selectedTab={activeTab}
            onTabChange={setActiveTab}
          >
            <TabList>
              <Tab id="basic">{t('form:tab-basic-information')}</Tab>
              <Tab id="sizes">{t('form:tab-sizes')}</Tab>
              <Tab id="image">{t('form:tab-image')}</Tab>
              <Tab id="modifiers">{t('form:tab-modifiers')}</Tab>
            </TabList>

            <MobileTabSelect
              tabs={[
                { id: 'basic', label: t('form:tab-basic-information') },
                { id: 'sizes', label: t('form:tab-sizes') },
                { id: 'image', label: t('form:tab-image') },
                { id: 'modifiers', label: t('form:tab-modifiers') },
              ]}
            />

            <TabPanel id="basic">
              <BasicInfoSection
                register={register}
                control={control}
                errors={errors}
                categories={categories}
                loadingCategories={loadingCategories}
                isSizeable={isSizeable}
                isEditing={!!initialValues}
              />
            </TabPanel>

            <TabPanel id="sizes">
              <SizesSection
                control={control}
                errors={errors}
                setValue={setValue}
                isSizeable={isSizeable}
                shopId={shopId}
                itemId={initialValues?.id}
                defaultSizeId={defaultSizeId}
              />
            </TabPanel>

            <TabPanel id="image">
              <ImageSection control={control} />
            </TabPanel>

            <TabPanel id="modifiers">
              <ModifiersSection
                register={register}
                control={control}
                setValue={setValue}
                modifierGroupsFiltered={modifierGroupsFiltered}
                loadingModifierGroups={loadingModifierGroups}
                relevantModifiers={relevantModifiers}
                loadingModifiers={loadingModifiers}
                selectedModifierGroups={selectedModifierGroups}
                allModifiersList={allModifiersList || []}
                isSizeable={isSizeable}
                itemSizes={itemSizes}
              />
            </TabPanel>
          </Tabs>

          <StickyFooterPanel className="z-0">
            <div className="flex items-center justify-end">
              <Button
                variant="custom"
                onClick={() => router.back()}
                className="!px-0 text-sm !text-body me-4 hover:!text-accent focus:ring-0 md:text-base"
                type="button"
                size="medium"
              >
                <LongArrowPrev className="w-4 h-5 me-2" />
                {t('form:button-label-back')}
              </Button>
              <Button
                loading={updating || creating}
                disabled={updating || creating}
                size="medium"
                className="text-sm md:text-base"
              >
                {initialValues ? (
                  <>
                    <EditIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                    <span className="sm:hidden">
                      {t('form:button-label-update')}
                    </span>
                    <span className="hidden sm:block">
                      {t('form:button-label-update-item')}
                    </span>
                  </>
                ) : (
                  t('form:button-label-add-item')
                )}
              </Button>
            </div>
          </StickyFooterPanel>
        </form>
      </FormProvider>
    </>
  );
}
