import * as yup from 'yup';

export const modifierGroupValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  display_name: yup.string().optional(),
  display_type: yup
    .string()
    .transform((value, originalValue) => {
      // Handle the case where SelectInput returns an object {label, value}
      return typeof originalValue === 'object' && originalValue !== null
        ? originalValue.value
        : value;
    })
    .oneOf(['RADIO', 'CHECKBOX'])
    .required('form:error-display-type-required'),
  min_select: yup
    .number()
    .min(0, 'form:error-min-select-min')
    .required('form:error-min-select-required'),
  max_select: yup
    .number()
    .min(1, 'form:error-max-select-min')
    .test(
      'max-greater-than-min',
      'form:error-max-select-greater-than-min',
      function (value) {
        const { min_select } = this.parent;
        return value !== undefined && min_select !== undefined
          ? value >= min_select
          : true;
      },
    )
    .required('form:error-max-select-required'),
  quantity_levels: yup.array().of(
    yup.object().shape({
      quantity: yup
        .number()
        .required('form:error-quantity-required')
        .min(1, 'form:error-quantity-min'),
      name: yup.string().optional(),
      price: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .optional()
        .min(0, 'form:error-price-must-positive'),
      is_default: yup.boolean(),
      display_order: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .optional()
        .min(0, 'form:error-display-order-min'),
      is_active: yup.boolean(),
    }),
  ),
  prices_by_size: yup.array().of(
    yup.object().shape({
      sizeCode: yup
        .string()
        .oneOf(['S', 'M', 'L', 'XL', 'XXL'])
        .required('form:error-size-code-required'),
      priceDelta: yup.number().required('form:error-price-delta-required'),
    }),
  ),
  is_active: yup.boolean(),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('form:error-sort-order-required'),
});
