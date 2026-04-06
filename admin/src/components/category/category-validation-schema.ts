import * as yup from 'yup';

export const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  kitchen_section_id: yup.object().nullable().optional(),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('form:error-sort-order-required'),
  icon: yup.mixed().nullable().optional(),
  details: yup.string(),
  image: yup.mixed().nullable().optional(),
  is_active: yup.boolean(),
  modifier_groups: yup.array().nullable(),
});
