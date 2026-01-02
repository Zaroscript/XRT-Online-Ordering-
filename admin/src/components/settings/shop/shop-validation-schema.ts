import * as yup from 'yup';

export const shopValidationSchema = yup.object().shape({
  deliveryTime: yup
    .array()
    .min(1, 'form:error-add-at-least-one-delivery-time')
    .of(
      yup.object().shape({
        title: yup.string().required('form:error-title-required'),
      })
    ),
  orders: yup.object().shape({
    allowScheduleOrder: yup.boolean(),
    maxDays: yup.number().when('allowScheduleOrder', ([allowScheduleOrder], schema) => {
      return allowScheduleOrder
        ? schema.min(0, 'Must be positive').required('Required')
        : schema.nullable();
    }),
    deliveredOrderTime: yup.number().when('allowScheduleOrder', ([allowScheduleOrder], schema) => {
      return allowScheduleOrder
        ? schema.min(0, 'Must be positive').required('Required')
        : schema.nullable();
    }),
  }),
  delivery: yup.object().shape({
    enabled: yup.boolean(),
    radius: yup.number().min(0, 'Must be positive').required('Required'),
    fee: yup.number().min(0, 'Must be positive').required('Required'),
    min_order: yup.number().min(0, 'Must be positive').required('Required'),
  }),
  fees: yup.object().shape({
    service_fee: yup.number().min(0, 'Must be positive').required('Required'),
    tip: yup.number().min(0, 'Must be positive').required('Required'),
    tip_type: yup.string().oneOf(['fixed', 'percentage']).required('Required'),
  }),
  taxes: yup.object().shape({
    sales_tax: yup.number().min(0, 'Must be positive').required('Required'),
  }),
  operating_hours: yup.object().shape({
    auto_close: yup.boolean(),
    schedule: yup.array().of(
      yup.object().shape({
        day: yup.string().required('Required'),
        open_time: yup.string().required('Required'),
        close_time: yup.string().required('Required'),
        is_closed: yup.boolean(),
      })
    ),
  }),
});
