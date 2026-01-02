import * as yup from 'yup';

export const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  kitchen_section_id: yup.object().nullable().required('form:error-kitchen-section-required'),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('form:error-sort-order-required'),
  icon: yup
    .mixed()
    .test('type', 'form:error-icon-must-be-svg', (value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      if (Array.isArray(value) && value[0] instanceof File) {
        return value[0].type === 'image/svg+xml' || value[0].name.toLowerCase().endsWith('.svg');
      }
      return true;
    }),
  details: yup.string(),
  image: yup.mixed(),
  is_active: yup.boolean(),
});
