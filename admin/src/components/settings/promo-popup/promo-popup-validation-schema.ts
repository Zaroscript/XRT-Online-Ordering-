import * as yup from 'yup';

export const promoPopupValidationSchema = yup.object().shape({
  promoPopup: yup.object().when('isPromoPopUp', {
    is: (value: boolean) => value,
    then: () =>
      yup.object().shape({
        title: yup.string().required('form:error-title-required'),
        description: yup.string().required('form:error-description-required'),
        popupDelay: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .min(0, 'form:error-popup-delay-min')
          .required('form:error-popup-delay'),
        popupExpiredIn: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .min(1, 'form:error-popup-expired-min')
          .required('form:error-popup-expired'),
        image: yup.mixed().test('file', 'form:error-image', (value) => {
          if (value && Object.keys(value).length > 0) {
            return true;
          }
          return false;
        }),
        isNotShowAgain: yup.boolean(),
      }),
  }),
});
