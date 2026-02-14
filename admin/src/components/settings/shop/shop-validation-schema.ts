import * as yup from 'yup';

export const shopValidationSchema = yup.object().shape({
  siteTitle: yup.string().required('form:error-site-title-required'),
  siteSubtitle: yup.string().optional(),
  timezone: yup.mixed().optional(),
  currency: yup.mixed().optional(),
  currencyOptions: yup
    .object()
    .shape({
      formation: yup.string().optional(),
      fractions: yup.number().min(0).optional(),
    })
    .optional(),
  isProductReview: yup.boolean().optional(),
  enableTerms: yup.boolean().optional(),
  enableCoupons: yup.boolean().optional(),
  enableEmailForDigitalProduct: yup.boolean().optional(),
  useGoogleMap: yup.boolean().optional(),
  enableReviewPopup: yup.boolean().optional(),
  maxShopDistance: yup.number().positive().optional(),
  contactDetails: yup.object().shape({
    location: yup.object().optional(),
    contact: yup.string().required('form:error-contact-required'),
    website: yup.string().optional(),
    emailAddress: yup.string().email('form:error-email-format').optional(),
    socials: yup.array().optional(),
  }),
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
        .when('allowScheduleOrder', ([allowScheduleOrder], schema) => {
          return allowScheduleOrder
            ? schema.min(0, 'Must be positive').required('Required')
            : schema.nullable();
        }),
      deliveredOrderTime: yup
        .number()
        .when('allowScheduleOrder', ([allowScheduleOrder], schema) => {
          return allowScheduleOrder
            ? schema.min(0, 'Must be positive').required('Required')
            : schema.nullable();
        }),
    })
    .optional(),
  delivery: yup
    .object()
    .shape({
      enabled: yup.boolean(),
      radius: yup.number().min(0, 'Must be positive').required('Required'),
      fee: yup.number().min(0, 'Must be positive').required('Required'),
      min_order: yup.number().min(0, 'Must be positive').required('Required'),
    })
    .optional(),
  fees: yup
    .object()
    .shape({
      service_fee: yup.number().min(0, 'Must be positive'),
      tip_options: yup.mixed().test({
        message: 'Must be a comma-separated list of numbers',
        test: (value) => {
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
      sales_tax: yup.number().min(0, 'Must be positive').required('Required'),
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
