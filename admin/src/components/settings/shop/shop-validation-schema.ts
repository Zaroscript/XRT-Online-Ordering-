import * as yup from 'yup';

export const shopValidationSchema = yup.object().shape({
  siteTitle: yup.string().required('form:error-site-title-required'),
  siteSubtitle: yup.string().optional(),
  minimumOrderAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .moreThan(-1, 'form:error-sale-price-must-positive')
    .optional(),
  timezone: yup.mixed().optional(),
  currency: yup.mixed().optional(),
  currencyOptions: yup
    .object()
    .shape({
      formation: yup.mixed().optional(),
      fractions: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0)
        .optional(),
    })
    .optional(),
  isProductReview: yup.boolean().optional(),
  enableCoupons: yup.boolean().optional(),
  enableEmailForDigitalProduct: yup.boolean().optional(),
  useGoogleMap: yup.boolean().optional(),
  enableReviewPopup: yup.boolean().optional(),
  maxShopDistance: yup
    .number()
    .transform((v) => (isNaN(v) ? undefined : v))
    .min(0)
    .optional(),
  contactDetails: yup
    .object()
    .shape({
      location: yup.object().optional(),
      contact: yup.string().optional(),
      website: yup.string().optional(),
      emailAddress: yup.string().email('form:error-email-format').optional(),
      socials: yup.array().optional(),
    })
    .optional(),
  google: yup
    .object()
    .shape({
      isEnable: yup.boolean().optional(),
      tagManagerId: yup.string().optional(),
    })
    .optional(),
  facebook: yup
    .object()
    .shape({
      isEnable: yup.boolean().optional(),
      appId: yup.string().optional(),
      pageId: yup.string().optional(),
    })
    .optional(),
  reviewSystem: yup.mixed().optional(),
  orders: yup
    .object()
    .shape({
      accept_orders: yup.boolean().optional(),
      allowScheduleOrder: yup.boolean(),
      maxDays: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      deliveredOrderTime: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      auto_accept_orders: yup.boolean().optional(),
      auto_accept_order_types: yup.array().optional(),
      auto_accept_ready_time_pickup: yup
        .number()
        .typeError('form:error-must-number')
        .min(0),
      auto_accept_ready_time_delivery: yup
        .number()
        .typeError('form:error-must-number')
        .min(0),
    })
    .optional(),
  delivery: yup
    .object()
    .shape({
      enabled: yup.boolean(),
      radius: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      fee: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      min_order: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      zones: yup
        .array()
        .of(
          yup.object().shape({
            radius: yup
              .number()
              .transform((v) => (isNaN(v) ? 0 : v))
              .min(0, 'Must be positive')
              .required('Required'),
            fee: yup
              .number()
              .transform((v) => (isNaN(v) ? 0 : v))
              .min(0, 'Must be positive')
              .required('Required'),
            min_order: yup
              .number()
              .transform((v) => (isNaN(v) ? 0 : v))
              .min(0, 'Must be positive')
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  fees: yup
    .object()
    .shape({
      service_fee: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
      tip_options: yup.mixed().test({
        message: 'Must be a comma-separated list of numbers',
        test: (value) => {
          if (value === undefined || value === null || value === '')
            return true;
          if (Array.isArray(value))
            return value.every((v) => typeof v === 'number');
          if (typeof value === 'string') {
            return value.split(',').every((v) => !isNaN(Number(v.trim())));
          }
          return false;
        },
      }),
    })
    .optional(),
  taxes: yup
    .object()
    .shape({
      sales_tax: yup
        .number()
        .transform((v) => (isNaN(v) ? 0 : v))
        .min(0, 'Must be positive')
        .default(0),
    })
    .optional(),
  operating_hours: yup
    .object()
    .shape({
      auto_close: yup.boolean(),
      schedule: yup.array().of(
        yup.object().shape({
          day: yup.string().required('Required'),
          open_time: yup.string().required('Required'),
          close_time: yup.string().required('Required'),
          is_closed: yup.boolean(),
        }),
      ),
    })
    .optional(),
  siteLink: yup.string().optional(),
  copyrightText: yup.string().optional(),
  footer_text: yup.string().optional(),
  externalText: yup.string().optional(),
  externalLink: yup.string().optional(),
});
