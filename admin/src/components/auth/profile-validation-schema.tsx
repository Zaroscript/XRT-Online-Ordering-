import * as yup from 'yup';

export const profileValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  profile: yup.object().shape({
    contact: yup
      .string()
      .matches(
        /^\+?[1-9]\d{1,14}$/,
        'form:error-contact-number-invalid'
      )
      .required('form:error-contact-number-required'),
    bio: yup.string().optional(),
  }),
});
