import * as yup from 'yup';

export const landingSettingsValidationSchema = yup.object().shape({
  logo: yup.object().nullable(),
  collapseLogo: yup.object().nullable(),
  favicon: yup.object().nullable(),
  footer_text: yup.string(),
  siteLink: yup.string(),
  copyrightText: yup.string(),
  showMenuSection: yup.boolean(),
  contactDetails: yup.object().shape({
    location: yup
      .object()
      .shape({
        city: yup.string(),
        country: yup.string(),
        state: yup.string(),
        zip: yup.string(),
        street_address: yup.string(),
      })
      .optional(),
    contact: yup.string(),
    website: yup.string(),
    emailAddress: yup.string().email('form:error-email-format').optional(),
  }),
  messages: yup.object().shape({
    closed_message: yup.string(),
    not_accepting_orders_message: yup.string(),
  }),
  heroSlides: yup.array().of(
    yup.object().shape({
      title: yup.string().required('form:error-title-required'),
      subtitle: yup.string(),
      offer: yup.string(),
      btnLink: yup.string(),
      btnText: yup.string(),
      bgType: yup.string().oneOf(['image', 'video']).default('image'),
      bgImage: yup.mixed().when('bgType', {
        is: 'image',
        then: () => yup.mixed().required('form:error-hero-bg-image-required'),
        otherwise: () => yup.mixed().nullable().optional(),
      }),
      bgVideo: yup.mixed().when('bgType', {
        is: 'video',
        then: () => yup.mixed().required('form:error-hero-bg-video-required'),
        otherwise: () => yup.mixed().nullable().optional(),
      }),
    }),
  ),
  offerCards: yup.array().of(
    yup.object().shape({
      title: yup.string().required('form:error-title-required'),
      description: yup.string(),
      image: yup.mixed().required('form:error-image-required'),
      couponCode: yup.mixed().nullable().optional(),
      showCouponCode: yup.boolean().default(false),
    }),
  ),
});
