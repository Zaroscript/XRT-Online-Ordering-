import * as yup from 'yup';
import { passwordRules } from '@/utils/constants';

export const customerValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup
    .string()
    .required('form:error-password-required')
    .matches(passwordRules, {
      message: 'form:error-password-rules-hint',
    }),
  passwordConfirmation: yup
    .string()
    .required('form:error-confirm-password')
    .oneOf([yup.ref('password')], 'form:error-match-passwords'),
  role: yup.mixed().required('form:error-role-required'),
});

export const customerUpdateValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().matches(passwordRules, {
    message: 'form:error-password-rules-hint',
  }),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'form:error-match-passwords'),
  role: yup.mixed(),
});
