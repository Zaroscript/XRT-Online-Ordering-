import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Color from '@/components/ui/color';
import DatePicker from '@/components/ui/date-picker';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Range from '@/components/ui/range';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import { useUpdateSettingsMutation } from '@/data/settings';
import { MaintenanceFormValues, OperationsMode, Settings } from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import {
  DEFAULT_OPERATIONS_SETTINGS,
  getResolvedMode,
  normalizeOperationsSettings,
  OPERATIONS_MODE_OPTIONS,
} from '@/utils/operations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { maintenanceValidationSchema } from './maintenance-validation-schema';

type IProps = {
  settings?: Settings | null;
};

const MODE_META: Record<OperationsMode, { label: string; badge: string }> = {
  OPEN_NORMAL: {
    label: 'Open Normally',
    badge: 'bg-green-100 text-green-700',
  },
  SCHEDULED_ONLY: {
    label: 'Scheduled Orders Only',
    badge: 'bg-amber-100 text-amber-700',
  },
  ORDERS_PAUSED: {
    label: 'Orders Paused',
    badge: 'bg-orange-100 text-orange-700',
  },
  FULL_MAINTENANCE: {
    label: 'Full Maintenance',
    badge: 'bg-red-100 text-red-700',
  },
};

const formatTime = (value?: string) => {
  if (!value) return 'N/A';
  const [h, m] = value.split(':');
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
};

const getLegacyFromMode = (mode: OperationsMode) => {
  switch (mode) {
    case 'FULL_MAINTENANCE':
      return { isUnderMaintenance: true, accept_orders: false, allowScheduleOrder: false };
    case 'ORDERS_PAUSED':
      return { isUnderMaintenance: false, accept_orders: false, allowScheduleOrder: false };
    case 'SCHEDULED_ONLY':
      return { isUnderMaintenance: false, accept_orders: true, allowScheduleOrder: true };
    case 'OPEN_NORMAL':
    default:
      return { isUnderMaintenance: false, accept_orders: true, allowScheduleOrder: true };
  }
};

export default function MaintenanceSettingsForm({ settings }: IProps) {
  const { locale } = useRouter();
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();
  const options = settings?.options ?? {};

  const initialValues = useMemo<MaintenanceFormValues>(
    () => ({
      operationsSettings: normalizeOperationsSettings(options),
      maintenance: {
        ...options.maintenance,
      },
    }),
    [options],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MaintenanceFormValues>({
    shouldUnregister: true,
    resolver: yupResolver(maintenanceValidationSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const values = watch();
  const selectedMode = values?.operationsSettings?.mode ?? 'OPEN_NORMAL';
  const isFullMaintenance = selectedMode === 'FULL_MAINTENANCE';
  const isOverlayColor = Boolean(values?.maintenance?.isOverlayColor);

  const previewOptions = {
    ...options,
    operationsSettings: values?.operationsSettings,
    maintenance: values?.maintenance,
  } as Settings['options'];
  const resolvedState = getResolvedMode(previewOptions);

  useConfirmRedirectIfDirty({ isDirty });

  const onSubmit = (formValues: MaintenanceFormValues) => {
    const legacy = getLegacyFromMode(formValues.operationsSettings.mode);
    updateSettingsMutation(
      {
        language: locale,
        options: {
          ...options,
          operationsSettings: {
            ...DEFAULT_OPERATIONS_SETTINGS,
            ...formValues.operationsSettings,
            updatedAt: new Date().toISOString(),
          },
          maintenance: {
            ...options.maintenance,
            ...formValues.maintenance,
          },
          isUnderMaintenance: legacy.isUnderMaintenance,
          orders: {
            ...options.orders,
            accept_orders: legacy.accept_orders,
            allowScheduleOrder: legacy.allowScheduleOrder,
          },
        },
      },
      {
        onSuccess: () => {
          reset(formValues);
        },
      },
    );
  };

  const applyQuickMode = (mode: OperationsMode, minutes?: number) => {
    setValue('operationsSettings.mode', mode, { shouldDirty: true });
    setValue('operationsSettings.manualOverride', true, { shouldDirty: true });
    if (minutes) {
      setValue(
        'operationsSettings.overrideUntil',
        new Date(Date.now() + minutes * 60 * 1000).toISOString(),
        { shouldDirty: true },
      );
      return;
    }
    setValue('operationsSettings.overrideUntil', null, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Current Live Status"
          details="Resolved from manual override, selected mode, and weekly hours."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="rounded-lg border border-dashed border-gray-200 p-5 bg-gray-50">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Live State</p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xl font-semibold text-heading">
                {MODE_META[resolvedState.mode].label}
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${MODE_META[resolvedState.mode].badge}`}
              >
                {resolvedState.mode}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Reason:{' '}
              {resolvedState.reason === 'MANUAL_OVERRIDE'
                ? 'Manual override'
                : resolvedState.reason === 'WORKING_HOURS'
                  ? 'Working hours'
                  : 'Selected mode'}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Quick Actions"
          details="Instantly switch live mode with optional timers."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Button type="button" variant="outline" onClick={() => applyQuickMode('OPEN_NORMAL')}>
              Open Now
            </Button>
            <Button type="button" variant="outline" onClick={() => applyQuickMode('SCHEDULED_ONLY')}>
              Scheduled Only
            </Button>
            <Button type="button" variant="outline" onClick={() => applyQuickMode('ORDERS_PAUSED')}>
              Pause Orders
            </Button>
            <Button type="button" variant="outline" onClick={() => applyQuickMode('FULL_MAINTENANCE')}>
              Maintenance
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => applyQuickMode('ORDERS_PAUSED', 30)}>
              Pause 30 min
            </Button>
            <Button type="button" variant="outline" onClick={() => applyQuickMode('ORDERS_PAUSED', 60)}>
              Pause 1 hour
            </Button>
            <Button type="button" variant="outline" onClick={() => applyQuickMode('ORDERS_PAUSED', 180)}>
              Pause until closing
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Availability Mode"
          details="Mode selection and manual override controls."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPERATIONS_MODE_OPTIONS.map((modeOption) => (
              <label
                key={modeOption.value}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedMode === modeOption.value
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-accent/40'
                }`}
              >
                <input
                  type="radio"
                  value={modeOption.value}
                  {...register('operationsSettings.mode')}
                  className="sr-only"
                />
                <p className="font-semibold text-heading">{modeOption.label}</p>
                <p className="text-sm text-gray-500 mt-1">{modeOption.description}</p>
              </label>
            ))}
          </div>
          <div className="mt-5">
            <SwitchInput
              name="operationsSettings.manualOverride"
              control={control}
              label="Manual admin override"
              toolTipText="When enabled, this mode has highest priority."
            />
          </div>
          <div className="mt-5">
            <DatePicker
              control={control}
              name="operationsSettings.overrideUntil"
              minDate={new Date()}
              locale={locale}
              label="Override Until"
              placeholder="Override End Date"
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Customer Experience Preview"
          details="What customers should expect under each mode."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3 space-y-3">
          <div className="p-4 rounded-lg border bg-light">
            <p className="font-semibold text-heading">Open</p>
            <p className="text-sm text-gray-600">ASAP and scheduled ordering are both available.</p>
          </div>
          <div className="p-4 rounded-lg border bg-light">
            <p className="font-semibold text-heading">Scheduled Only</p>
            <p className="text-sm text-gray-600">ASAP is disabled and future slots stay available.</p>
          </div>
          <div className="p-4 rounded-lg border bg-light">
            <p className="font-semibold text-heading">Orders Paused</p>
            <p className="text-sm text-gray-600">Storefront visible, but checkout is blocked.</p>
          </div>
          <div className="p-4 rounded-lg border bg-light">
            <p className="font-semibold text-heading">Full Maintenance</p>
            <p className="text-sm text-gray-600">Public routes show branded maintenance page.</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Smart Schedule Rules"
          details="Weekly hours used as source of truth for valid slots."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="space-y-2">
            {(options.operating_hours?.schedule ?? []).map((entry) => (
              <div
                key={entry.day}
                className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2 last:border-0"
              >
                <span className="font-medium text-heading">{entry.day}</span>
                <span className="text-sm text-gray-600">
                  {entry.is_closed
                    ? 'Closed'
                    : `${formatTime(entry.open_time)} - ${formatTime(entry.close_time)}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Maintenance Branding"
          details="Used only when Full Maintenance mode is active."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full logo-field-area sm:w-8/12 md:w-2/3">
          <Input
            label="Headline"
            {...register('maintenance.title')}
            error={errors.maintenance?.title?.message}
            variant="outline"
            className="mb-5"
            disabled={!isFullMaintenance}
          />
          <TextArea
            label="Subheadline"
            {...register('maintenance.description')}
            error={errors.maintenance?.description?.message}
            variant="outline"
            className="mb-5"
            disabled={!isFullMaintenance}
          />
          <div className="mb-5">
            <FileInput
              name="maintenance.image"
              control={control}
              multiple={false}
              disabled={!isFullMaintenance}
              helperText="Background image for maintenance screen."
            />
          </div>
          <div className="mb-5">
            <SwitchInput
              name="maintenance.isOverlayColor"
              control={control}
              label="Use Overlay"
              disabled={!isFullMaintenance}
            />
          </div>
          {isOverlayColor && (
            <div className="mb-5">
              <Color
                {...register('maintenance.overlayColor')}
                label="Overlay Color"
                disabled={!isFullMaintenance}
              />
              <Range
                min="0"
                max="1"
                step="0.1"
                {...register('maintenance.overlayColorRange')}
                label="Overlay Strength"
                disabled={!isFullMaintenance}
              />
            </div>
          )}
          <Input
            label="Public Message Title"
            {...register('operationsSettings.messageTitle')}
            error={errors.operationsSettings?.messageTitle?.message}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label="Public Message Body"
            {...register('operationsSettings.messageBody')}
            error={errors.operationsSettings?.messageBody?.message}
            variant="outline"
            className="mb-5"
          />
          <div className="mb-5">
            <SwitchInput
              name="operationsSettings.showCountdown"
              control={control}
              label="Show Countdown"
            />
          </div>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <Button
          type="button"
          variant="outline"
          className="text-sm md:text-base ltr:mr-3 rtl:ml-3"
          onClick={() => reset(initialValues)}
          disabled={loading || !isDirty}
        >
          Cancel
        </Button>
        <Button loading={loading} disabled={loading || !isDirty} className="text-sm md:text-base">
          Save Changes
        </Button>
      </StickyFooterPanel>
    </form>
  );
}
