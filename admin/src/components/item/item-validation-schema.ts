import * as yup from 'yup';

export const itemValidationSchema = yup.object().shape({
    name: yup.string().required('form:error-name-required'),
    base_price: yup
        .number()
        .transform((value) => (isNaN(value) || value === null || value === '') ? undefined : value)
        .typeError('form:error-price-must-number')
        .when('is_sizeable', {
            is: (value: boolean) => !value,
            then: (schema) =>
                schema
                    .positive('form:error-price-must-positive')
                    .required('form:error-price-required'),
            otherwise: (schema) => schema.nullable(),
        }),
    category: yup.object().nullable().required('form:error-category-required'),
    sort_order: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable(),
    max_per_order: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable(),
    is_active: yup.boolean(),
    is_available: yup.boolean(),
    is_signature: yup.boolean(),
    is_sizeable: yup.boolean(),
    is_customizable: yup.boolean(),
    sizes: yup.array().when('is_sizeable', {
        is: (value: boolean) => value === true,
        then: (schema) =>
            schema
                .of(
                    yup.object().shape({
                        name: yup.string().required('form:error-size-name-required'),
                        price: yup
                            .number()
                            .typeError('form:error-price-must-number')
                            .positive('form:error-price-must-positive')
                            .required('form:error-price-required'),
                        is_default: yup.boolean(),
                    })
                )
                .min(1, 'form:error-at-least-one-size-required')
                .test('has-default', 'form:error-default-size-required', function (sizes) {
                    if (!sizes || sizes.length === 0) return true; // min validation will catch empty
                    return sizes.some((size: any) => size?.is_default === true);
                }),
        otherwise: (schema) => schema.nullable(),
    }),
    image: yup.mixed().nullable(),
});
