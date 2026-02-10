import * as yup from 'yup';

export const settingsValidationSchema = yup.object().shape({
  maximumQuestionLimit: yup
    .number()
    .positive()
    .required('form:error-maximum-question-limit')
    .typeError('form:error-maximum-question-limit'),
  minimumOrderAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .moreThan(-1, 'form:error-sale-price-must-positive'),
  freeShippingAmount: yup
    .number()
    .moreThan(-1, 'form:error-free-shipping-amount-must-positive')
    .typeError('form:error-amount-number'),
  heroSlides: yup.array().of(
    yup.object().shape({
      title: yup.string().required('form:error-title-required'),
      offer: yup.string(),
      btnText: yup.string(),
      btnLink: yup.string(),
      bgImage: yup.object().nullable(),
    }),
  ),
  messages: yup.object().shape({
    closed_message: yup.string(),
    not_accepting_orders_message: yup.string(),
  }),
});
