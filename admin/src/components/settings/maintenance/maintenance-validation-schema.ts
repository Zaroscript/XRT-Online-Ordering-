import * as yup from 'yup';

export const maintenanceValidationSchema = yup.object().shape({
  operationsSettings: yup.object().shape({
    mode: yup
      .string()
      .oneOf([
        'OPEN_NORMAL',
        'SCHEDULED_ONLY',
        'ORDERS_PAUSED',
        'FULL_MAINTENANCE',
      ])
      .required('Mode is required'),
    manualOverride: yup.boolean().required(),
    overrideUntil: yup
      .mixed()
      .nullable()
      .test('override-until', 'Override end must be a valid date', (value) => {
        if (!value) return true;
        return !Number.isNaN(new Date(value as any).getTime());
      }),
    messageTitle: yup.string().max(120),
    messageBody: yup.string().max(500),
    showCountdown: yup.boolean().required(),
    maintenanceTheme: yup.string().max(60),
  }),
  maintenance: yup.object().when('operationsSettings.mode', {
    is: (value: string) => value === 'FULL_MAINTENANCE',
    then: () =>
      yup.object().shape({
        title: yup.string().required('Title is required'),
        description: yup.string().required('Description is required'),
        overlayColorRange: yup
          .string()
          .test('overlay-range', 'Overlay strength should be between 0 and 1', (v) => {
            if (!v) return true;
            const value = Number(v);
            return Number.isFinite(value) && value >= 0 && value <= 1;
          }),
      }),
    otherwise: () => yup.object(),
  }),
});
