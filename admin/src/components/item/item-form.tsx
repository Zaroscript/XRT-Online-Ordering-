import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, FormProvider, Controller, useFieldArray, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { itemValidationSchema } from './item-validation-schema';
import { Item, CreateItemInput, UpdateItemInput, ItemSize } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/utils/form-error';
import {
    useCreateItemMutation,
    useUpdateItemMutation,
} from '@/data/item';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { EditIcon } from '@/components/icons/edit';
import SelectInput from '@/components/ui/select-input';
import { useCategoriesQuery } from '@/data/category';
import SwitchInput from '@/components/ui/switch-input';
import { TrashIcon } from '@/components/icons/trash';

type ItemFormProps = {
    initialValues?: Item | null;
};

type FormValues = {
    name: string;
    description?: string;
    base_price?: number | null;
    category: any;
    image?: any;
    sort_order?: number | null;
    max_per_order?: number | null;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    sizes?: ItemSize[];
};

const defaultValues = {
    name: '',
    description: '',
    base_price: 0,
    category: null,
    image: '',
    sort_order: 0,
    max_per_order: 0,
    is_active: true,
    is_available: true,
    is_signature: false,
    is_sizeable: false,
    is_customizable: false,
    sizes: [],
};

export default function CreateOrUpdateItemForm({
    initialValues,
}: ItemFormProps) {
    const router = useRouter();
    const { query, locale } = router;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useTranslation();

    const { data: shopData } = useShopQuery(
        { slug: router.query.shop as string },
        {
            enabled: !!router.query.shop,
        },
    );
    const shopId = shopData?.id!;

    const methods = useForm<FormValues>({
        resolver: yupResolver(itemValidationSchema),
        shouldUnregister: true,
        defaultValues: initialValues
            ? {
                ...initialValues,
                category: initialValues.category,
                sizes: initialValues.sizes || [],
                // If item has sizes, automatically set is_sizeable to true
                is_sizeable: initialValues.is_sizeable || (initialValues.sizes?.length > 0) || false,
                is_customizable: initialValues.is_customizable || false,
            }
            : defaultValues,
    });

    // Reset form when initialValues change (e.g., after update)
    useEffect(() => {
        if (initialValues) {
            const formValues = {
                ...initialValues,
                category: initialValues.category,
                sizes: initialValues.sizes || [],
                // If item has sizes, automatically set is_sizeable to true
                is_sizeable: initialValues.is_sizeable || (initialValues.sizes?.length > 0) || false,
                is_customizable: initialValues.is_customizable || false,
            };
            // Reset the form with new values
            methods.reset(formValues, { 
                keepDefaultValues: false,
                keepValues: false,
                keepDirty: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.id, initialValues?.sizes?.length, initialValues?.is_sizeable, initialValues?.is_customizable, initialValues?.updated_at]);

    const {
        register,
        handleSubmit,
        control,
        setError,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    const isSizeable = useWatch({
        control,
        name: 'is_sizeable',
        defaultValue: false,
    });

    const sizes = useWatch({
        control,
        name: 'sizes',
        defaultValue: [],
    });

    const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
        control,
        name: 'sizes',
    });

    // Update base_price when default size changes or when a default size's price changes
    useEffect(() => {
        if (isSizeable && sizes && sizes.length > 0) {
            const defaultSize = sizes.find((size: any) => size?.is_default === true);
            if (defaultSize && defaultSize.price !== undefined) {
                setValue('base_price', defaultSize.price, { shouldValidate: false });
            }
        }
    }, [isSizeable, sizes, setValue]);

    // Auto-set is_sizeable to true if item has sizes when editing
    // Also ensure sizes are preserved in the form
    useEffect(() => {
        if (initialValues) {
            // If item has sizes, ensure is_sizeable is true
            if (initialValues.sizes && initialValues.sizes.length > 0 && !isSizeable) {
                setValue('is_sizeable', true, { shouldValidate: false });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.id, initialValues?.sizes?.length, isSizeable]);

    // Handler to set default size (only one can be default)
    const handleDefaultSizeChange = (index: number) => {
        const currentSizes = watch('sizes') || [];
        
        // Update all sizes - only the selected index is default
        currentSizes.forEach((size: any, idx: number) => {
            setValue(`sizes.${idx}.is_default`, idx === index, { shouldValidate: false });
        });

        // Update base_price from the new default size
        const defaultSizePrice = currentSizes[index]?.price;
        if (defaultSizePrice !== undefined) {
            setValue('base_price', defaultSizePrice, { shouldValidate: false });
        }
    };

    const { mutate: createItem, isLoading: creating } = useCreateItemMutation();
    const { mutate: updateItem, isLoading: updating } = useUpdateItemMutation();

    const { categories, loading: loadingCategories } = useCategoriesQuery({
        limit: 1000,
        language: locale,
        type: 'all', // Adjust type if needed
    });

    const onSubmit = async (values: any) => {
        let basePrice = values.base_price ?? undefined;
        
        // If sizeable, ensure base_price is set from default size
        if (values.is_sizeable && values.sizes && values.sizes.length > 0) {
            const defaultSize = values.sizes.find((size: any) => size?.is_default === true);
            if (defaultSize && defaultSize.price) {
                basePrice = defaultSize.price;
            } else {
                // Validation should catch this, but set error if no default size
                setError('sizes', {
                    type: 'manual',
                    message: 'form:error-default-size-required',
                });
                return;
            }
        }

        const inputValues: CreateItemInput = {
            name: values.name,
            description: values.description,
            base_price: basePrice,
            category_id: values.category?.id,
            sort_order: values.sort_order ?? undefined,
            max_per_order: values.max_per_order ?? undefined,
            is_active: values.is_active,
            is_available: values.is_available,
            is_signature: values.is_signature,
            is_sizeable: values.is_sizeable ?? false,
            is_customizable: values.is_customizable ?? false,
            // Always send sizes array when item is sizeable (validation ensures at least one size)
            sizes: values.is_sizeable && values.sizes ? values.sizes : undefined,
            image: values.image,
            business_id: shopId,
        };

        try {
            if (!initialValues) {
                createItem(inputValues);
            } else {
                updateItem({
                    ...inputValues,
                    id: initialValues.id,
                });
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

    return (
        <>
            {errorMessage ? (
                <Alert
                    message={t(`common:${errorMessage}`)}
                    variant="error"
                    closeable={true}
                    className="mt-5"
                    onClose={() => setErrorMessage(null)}
                />
            ) : null}
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:item-description')}
                            details={`${initialValues
                                ? t('form:item-description-edit')
                                : t('form:item-description-add')
                                }`}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />

                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <Input
                                label={`${t('form:input-label-name')}*`}
                                {...register('name')}
                                error={t(errors.name?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

                            <TextArea
                                label={t('form:input-label-description')}
                                {...register('description')}
                                error={t(errors.description?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

                            <div className="mb-5">
                                <SwitchInput 
                                    name="is_sizeable" 
                                    control={control} 
                                    label={t('form:input-label-sizeable')} 
                                />
                            </div>

                            {!isSizeable && (
                                <Input
                                    label={`${t('form:input-label-base-price')}*`}
                                    {...register('base_price')}
                                    type="number"
                                    error={t(errors.base_price?.message!)}
                                    variant="outline"
                                    className="mb-5"
                                />
                            )}

                            {isSizeable && (
                                <div className="mb-5">
                                    <Label className="mb-3 block">
                                        {t('form:input-label-sizes')}*
                                    </Label>
                                    <div className="space-y-4">
                                        {sizeFields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="p-4 border border-border-200 rounded-lg"
                                            >
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                                    <div className="sm:col-span-4">
                                                        <Input
                                                            label={t('form:input-label-size-name')}
                                                            {...register(`sizes.${index}.name` as const)}
                                                            error={t(errors.sizes?.[index]?.name?.message!)}
                                                            variant="outline"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-4">
                                                        <Input
                                                            label={t('form:input-label-size-price')}
                                                            {...register(`sizes.${index}.price` as const, {
                                                                valueAsNumber: true,
                                                            })}
                                                            type="number"
                                                            step="0.01"
                                                            error={t(errors.sizes?.[index]?.price?.message!)}
                                                            variant="outline"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3 flex items-end">
                                                        <div className="mb-5">
                                                            <label className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="default-size"
                                                                    checked={sizes?.[index]?.is_default === true}
                                                                    onChange={() => handleDefaultSizeChange(index)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm text-body">
                                                                    {t('form:input-label-default')}
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="hidden"
                                                                {...register(`sizes.${index}.is_default` as const)}
                                                                value={sizes?.[index]?.is_default ? 'true' : 'false'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="sm:col-span-1 flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSize(index)}
                                                            className="text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const isFirstSize = sizeFields.length === 0;
                                                appendSize({ 
                                                    name: '', 
                                                    price: 0, 
                                                    is_default: isFirstSize // First size is default by default
                                                });
                                                if (isFirstSize) {
                                                    // Set base_price to 0 initially for first size
                                                    setValue('base_price', 0, { shouldValidate: false });
                                                }
                                            }}
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                        >
                                            {t('form:button-label-add-size')}
                                        </Button>
                                    </div>
                                    {errors.sizes && typeof errors.sizes.message === 'string' && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {t(errors.sizes.message)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mb-5">
                                <Label>{t('form:input-label-category')}*</Label>
                                <SelectInput
                                    name="category"
                                    control={control}
                                    getOptionLabel={(option: any) => option.name}
                                    getOptionValue={(option: any) => option.id}
                                    options={categories}
                                    isLoading={loadingCategories}
                                />
                                {errors.category?.message && (
                                    <p className="my-2 text-xs text-red-500">
                                        {t(errors.category.message)}
                                    </p>
                                )}
                            </div>

                            <Input
                                label={t('form:input-label-sort-order')}
                                {...register('sort_order')}
                                type="number"
                                error={t(errors.sort_order?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

                            <Input
                                label={t('form:input-label-max-per-order')}
                                {...register('max_per_order')}
                                type="number"
                                error={t(errors.max_per_order?.message!)}
                                variant="outline"
                                className="mb-5"
                            />
                        </Card>
                    </div>

                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:featured-image-title')}
                            details={t('form:featured-image-help-text')}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />

                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <FileInput
                                name="image"
                                control={control}
                                multiple={false}
                            />
                        </Card>
                    </div>

                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:form-settings-title')}
                            details={t('form:item-description-help-text')}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />
                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <div className="mb-5">
                                <SwitchInput name="is_active" control={control} label={t('form:input-label-active')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_available" control={control} label={t('form:input-label-available')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_signature" control={control} label={t('form:input-label-signature-dish')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_customizable" control={control} label={t('form:input-label-customizable')} />
                            </div>
                        </Card>
                    </div>

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
