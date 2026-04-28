import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox/checkbox';
import SelectInput from '@/components/ui/select-input';
import {
  useCreatePrinterMutation,
  useUpdatePrinterMutation,
  useScanWiFiMutation,
  useScanLANMutation,
} from '@/data/printer';
import { useTemplatesQuery } from '@/data/template';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';
import { Printer } from '@/data/client/printer';
import { Routes } from '@/config/routes';
import { useBusinessesQuery } from '@/data/business';
import PrintAgentStatus from '@/components/printer/PrintAgentStatus';

type FormValues = {
  name: string;
  connection_type: 'lan' | 'wifi' | 'bluetooth';
  interface: string;
  assigned_templates: any[];
  kitchen_sections_list: any[];
  active: boolean;
};

function looksLikeSerialPort(iface: string): boolean {
  const v = (iface || '').trim();
  return (
    /^COM\d+$/i.test(v) ||
    /^\\\\\.\\COM\d+$/i.test(v) ||
    v.startsWith('/dev/tty') ||
    v.startsWith('/dev/rfcomm')
  );
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  connection_type: yup.string().oneOf(['lan', 'wifi', 'bluetooth']).required(),
  interface: yup
    .string()
    .required('Interface is required')
    .test(
      'lan-wifi-not-serial',
      'LAN/Wi‑Fi expects a network address (e.g. 192.168.1.50 or 192.168.1.50:9100). For local USB printing choose "Bluetooth / USB Printer (This Device)".',
      function (value) {
        const type = this.parent.connection_type as string;
        if (type === 'lan' || type === 'wifi') {
          if (looksLikeSerialPort(value || '')) return false;
        }
        return true;
      },
    ),
  assigned_templates: yup.array().nullable(),
  kitchen_sections_list: yup.array().nullable(),
  active: yup.boolean(),
});

type DiscoveredDevice = {
  value: string;
  label: string;
  source: 'network';
};

type Props = {
  initialValues?: Printer | null;
};

export default function PrinterForm({ initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);
  const { businesses, loading: businessesLoading } = useBusinessesQuery();
  const restaurantId =
    (router.query.restaurant_id as string | undefined) ||
    (router.query.restaurantId as string | undefined) ||
    (router.query.business_id as string | undefined) ||
    businesses?.[0]?.id ||
    '';

  const { data: templatesData } = useTemplatesQuery();
  const templates = useMemo(
    () => (Array.isArray(templatesData) ? templatesData : []),
    [templatesData],
  );

  const { data: kitchenData } = useKitchenSectionsQuery();
  const kitchenSections = useMemo(() => {
    const d = kitchenData as { data?: unknown[] } | unknown[] | undefined;
    if (Array.isArray((d as { data?: unknown[] })?.data)) {
      return (d as { data: unknown[] }).data;
    }
    return Array.isArray(d) ? d : [];
  }, [kitchenData]);

  const { mutate: createPrinter, isPending: creating } =
    useCreatePrinterMutation();
  const { mutate: updatePrinter, isPending: updating } =
    useUpdatePrinterMutation();

  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name ?? '',
      connection_type: initialValues?.connection_type ?? 'lan',
      interface: initialValues?.interface ?? '',
      assigned_templates: initialValues?.assigned_template_ids
        ? initialValues.assigned_template_ids.map(
            (id) => templates.find((x) => x.id === id) || { id, name: id },
          )
        : [],
      kitchen_sections_list: initialValues?.kitchen_sections
        ? initialValues.kitchen_sections.map(
            (name) =>
              (kitchenSections as { id?: string; name: string }[]).find(
                (s) => s.name === name,
              ) || {
                id: name,
                name,
              },
          )
        : [],
      active: initialValues?.active ?? true,
    },
    resolver: yupResolver(schema) as any,
  });

  const connectionType = useWatch({ control, name: 'connection_type' });
  const selectedInterface = useWatch({ control, name: 'interface' });

  const { mutate: scanWiFi, isPending: scanningWiFi } = useScanWiFiMutation();
  const { mutate: scanLAN, isPending: scanningLAN } = useScanLANMutation();

  const scanning = scanningWiFi || scanningLAN;
  const [showConnectionChecklist, setShowConnectionChecklist] = useState(false);

  const autoFilledNetworkRef = useRef(false);

  useEffect(() => {
    setDiscoveredDevices([]);
    autoFilledNetworkRef.current = false;
  }, [connectionType]);

  useEffect(() => {
    if (connectionType !== 'bluetooth') return;
    if (selectedInterface) return;
    // For browser-based USB printing, interface is a logical marker, not a COM path.
    setValue('interface', 'browser-usb', { shouldValidate: true });
  }, [connectionType, selectedInterface, setValue]);

  useEffect(() => {
    if (connectionType === 'bluetooth') return;
    if (selectedInterface !== 'browser-usb') return;
    // Prevent carrying USB-only interface marker into LAN/WiFi settings.
    setValue('interface', '', { shouldValidate: true });
  }, [connectionType, selectedInterface, setValue]);

  const onScanServer = () => {
    setDiscoveredDevices([]);
    const mutation = connectionType === 'lan' ? scanLAN : scanWiFi;

    mutation(undefined, {
      onSuccess: (raw: string[]) => {
        const list = Array.isArray(raw) ? raw : [];
        const mapped: DiscoveredDevice[] = list.map((entry) => ({
          value: entry.trim(),
          label: `${entry.trim()} · TCP 9100`,
          source: 'network' as const,
        }));
        setDiscoveredDevices(mapped);
        if (mapped.length === 0) {
          toast.info(
            'No hosts with port 9100 open on the API server’s network.',
          );
        } else if (mapped.length === 1) {
          const ip = mapped[0].value;
          setValue('interface', ip, { shouldValidate: true });
          toast.success(`Interface set to ${ip} (uses port 9100 if not specified)`);
        } else {
          toast.success(`Found ${mapped.length} devices — pick one below`);
        }
      },
      onError: () => toast.error('Server network scan failed'),
    });
  };

  const allSelectableDevices = useMemo(() => {
    return connectionType === 'lan' || connectionType === 'wifi'
      ? discoveredDevices
      : [];
  }, [
    connectionType,
    discoveredDevices,
  ]);

  const onSubmit = (values: FormValues) => {
    const kitchen_sections = values.kitchen_sections_list
      ? values.kitchen_sections_list.map((s: any) => s.name || s.id)
      : [];
    const assigned_template_ids = values.assigned_templates
      ? values.assigned_templates.map((x: any) => x.id)
      : [];

    const payload = {
      name: values.name,
      connection_type: values.connection_type,
      interface: values.interface,
      assigned_template_ids,
      kitchen_sections,
      active: values.active,
    };

    if (initialValues?.id) {
      updatePrinter(
        { id: initialValues.id, input: payload as any },
        {
          onSuccess: () => {
            toast.success(t('common:update-success'));
            router.push(Routes.printers.list);
          },
          onError: (e: any) =>
            toast.error(e?.message ?? t('common:error-something-wrong')),
        },
      );
    } else {
      createPrinter(payload as any, {
        onSuccess: () => {
          toast.success(t('common:create-success'));
          router.push(Routes.printers.list);
        },
        onError: (e: any) =>
          toast.error(e?.message ?? t('common:error-something-wrong')),
      });
    }
  };

  const isLoading = creating || updating;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Card className="mb-8">
        <div className="space-y-5">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            variant="outline"
            disabled={isLoading}
          />
          <div>
            <Label>Connection type</Label>
            <select
              {...register('connection_type')}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm focus:border-accent focus:ring-accent/20"
              disabled={isLoading}
            >
              <option value="lan">LAN</option>
              <option value="wifi">WiFi</option>
              <option value="bluetooth">Bluetooth / USB Printer (This Device)</option>
            </select>
          </div>
          {connectionType !== 'bluetooth' ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <Input
                  label="Interface (filled automatically when possible)"
                  {...register('interface')}
                  error={errors.interface?.message}
                  variant="outline"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                onClick={onScanServer}
                loading={scanning}
                disabled={scanning || isLoading}
                variant="outline"
                className="shrink-0 sm:mt-7"
              >
                Scan (server)
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-md border border-dashed border-accent/40 p-3">
              <input type="hidden" {...register('interface')} />
              <span className="block text-sm font-medium text-heading">
                USB printer
              </span>
              <p className="text-sm text-body">
                Use the button below to connect your local USB printer in one step.
              </p>
            </div>
          )}

          {connectionType === 'bluetooth'
            ? restaurantId
              ? <PrintAgentStatus restaurantId={restaurantId} />
              : !businessesLoading
                ? (
                    <p className="text-sm text-red-600">
                      {t(
                        'common:print-agent.errors.restaurant-id-unavailable',
                        'Cannot start print agent: restaurant ID is unavailable.',
                      )}
                    </p>
                  )
                : null
            : null}

          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-blue-900">
                {connectionType === 'bluetooth'
                  ? t(
                      'common:print-agent.checklist.usb-title',
                      'USB Printer Connection Checklist',
                    )
                  : connectionType === 'lan'
                    ? t(
                        'common:print-agent.checklist.lan-title',
                        'LAN Printer Connection Checklist',
                      )
                    : t(
                        'common:print-agent.checklist.wifi-title',
                        'WiFi Printer Connection Checklist',
                      )}
              </h4>
              <button
                type="button"
                onClick={() => setShowConnectionChecklist((prev) => !prev)}
                className="text-xs font-medium text-blue-800 underline underline-offset-2 hover:text-blue-900"
              >
                {showConnectionChecklist
                  ? t('common:print-agent.checklist.hide', 'Hide steps')
                  : t('common:print-agent.checklist.show', 'Show steps')}
              </button>
            </div>
            {showConnectionChecklist ? (
              <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-blue-900">
                {connectionType === 'bluetooth' ? (
                  <>
                    <li>
                      {t(
                        'common:print-agent.checklist.usb-step-1',
                        'Set connection type to "Bluetooth / USB Printer (This Device)".',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.usb-step-2',
                        'Save the printer first.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.usb-step-3',
                        'Click "Connect Printer" and choose your USB printer in the browser popup.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.usb-step-4',
                        'Wait until status shows "Ready to print".',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.usb-step-5',
                        'Keep this dashboard tab open while printing orders.',
                      )}
                    </li>
                  </>
                ) : connectionType === 'lan' ? (
                  <>
                    <li>
                      {t(
                        'common:print-agent.checklist.lan-step-1',
                        'Set connection type to "LAN".',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.lan-step-2',
                        'Click "Scan (server)" to find printers on the server network.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.lan-step-3',
                        'Select a discovered device to fill the Interface field, or enter printer IP manually.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.lan-step-4',
                        'Save the printer and run "Check link" from the printers list.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.lan-step-5',
                        'If check fails, ensure the API server can reach the printer IP and port 9100.',
                      )}
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      {t(
                        'common:print-agent.checklist.wifi-step-1',
                        'Set connection type to "WiFi".',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.wifi-step-2',
                        'Click "Scan (server)" to discover printers accessible from the server.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.wifi-step-3',
                        'Pick a discovered device or enter the printer IP manually in Interface.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.wifi-step-4',
                        'Save the printer and run "Check link" from the printers list.',
                      )}
                    </li>
                    <li>
                      {t(
                        'common:print-agent.checklist.wifi-step-5',
                        'If connection fails, verify printer and API server are on reachable networks.',
                      )}
                    </li>
                  </>
                )}
              </ol>
            ) : null}
          </div>

          {connectionType !== 'bluetooth' && allSelectableDevices.length > 0 && (
            <div>
              <Label>Discovered devices — pick one to fill Interface</Label>
              <select
                className="mt-1 block w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm focus:border-accent focus:ring-accent/20"
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const dev = allSelectableDevices.find((d) => d.value === v);
                  if (!dev) return;
                  setValue('interface', dev.value, { shouldValidate: true });
                  e.target.value = '';
                }}
              >
                <option value="">Select a device…</option>
                {discoveredDevices.length > 0 && (
                  <optgroup label="Network scan (TCP 9100)">
                    {discoveredDevices.map((d) => (
                      <option key={`net-${d.value}-${d.label}`} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          <SelectInput
            name="assigned_templates"
            label="Assigned Templates"
            control={control}
            options={templates}
            isMulti
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            disabled={isLoading}
          />

          <SelectInput
            name="kitchen_sections_list"
            label="Kitchen Sections"
            control={control}
            options={kitchenSections as any}
            isMulti
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id || option.name}
            disabled={isLoading}
          />

          <Checkbox
            label="Active"
            {...register('active')}
            disabled={isLoading}
            className="mt-5"
          />
        </div>
      </Card>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          {t('form:button-label-back')}
        </Button>
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          {initialValues
            ? (t('form:button-label-update') ?? 'Update')
            : (t('form:button-label-add') ?? 'Create')}
        </Button>
      </div>
    </form>
  );
}
