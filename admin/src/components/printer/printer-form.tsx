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
  usePrinterDiscoverSerialQuery,
} from '@/data/printer';
import { useTemplatesQuery } from '@/data/template';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';
import { Printer } from '@/data/client/printer';
import { Routes } from '@/config/routes';
import {
  supportsWebSerial,
  listGrantedSerialPorts,
  requestSerialPortAccess,
  type LocalSerialPortOption,
} from '@/utils/localSerialPorts';

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
      'LAN/Wi‑Fi expects a network address (e.g. 192.168.1.50 or 192.168.1.50:9100). For COM/USB serial ports choose Bluetooth / USB-Serial.',
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
  source: 'network' | 'server-serial' | 'browser-serial';
};

type Props = {
  initialValues?: Printer | null;
};

export default function PrinterForm({ initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);

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
  const [browserSerialOptions, setBrowserSerialOptions] = useState<
    LocalSerialPortOption[]
  >([]);
  const [loadingBrowserPorts, setLoadingBrowserPorts] = useState(false);

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

  const {
    data: serialPorts = [],
    isFetching: serialDiscoverLoading,
    refetch: refetchSerialDiscovery,
  } = usePrinterDiscoverSerialQuery(connectionType === 'bluetooth');

  const { mutate: scanWiFi, isPending: scanningWiFi } = useScanWiFiMutation();
  const { mutate: scanLAN, isPending: scanningLAN } = useScanLANMutation();

  const scanning =
    scanningWiFi ||
    scanningLAN ||
    (connectionType === 'bluetooth' && serialDiscoverLoading);

  const autoFilledSerialRef = useRef(false);

  useEffect(() => {
    setDiscoveredDevices([]);
    autoFilledSerialRef.current = false;
  }, [connectionType]);

  useEffect(() => {
    if (initialValues?.id) return;
    if (connectionType !== 'bluetooth') return;
    if (serialDiscoverLoading) return;
    if (serialPorts.length !== 1) return;
    if (autoFilledSerialRef.current) return;
    setValue('interface', serialPorts[0].interface, { shouldValidate: true });
    autoFilledSerialRef.current = true;
    toast.success(`Interface set to ${serialPorts[0].interface}`);
  }, [
    connectionType,
    initialValues?.id,
    serialDiscoverLoading,
    serialPorts,
    setValue,
  ]);

  const refreshBrowserSerial = useCallback(async () => {
    if (!supportsWebSerial()) {
      toast.info(
        'Web Serial is only available in Chrome or Edge on desktop. Enter COM/port manually.',
      );
      return;
    }
    setLoadingBrowserPorts(true);
    try {
      const opts = await listGrantedSerialPorts();
      setBrowserSerialOptions(opts);
      if (opts.length === 0) {
        toast.info(
          'No USB serial devices granted yet. Click “Pair USB serial device” first.',
        );
      } else {
        toast.success(`${opts.length} granted serial device(s) listed below.`);
      }
    } catch {
      toast.error('Could not read serial ports from the browser.');
    } finally {
      setLoadingBrowserPorts(false);
    }
  }, []);

  const pairBrowserSerial = useCallback(async () => {
    try {
      await requestSerialPortAccess();
      toast.success('Device paired in browser. Refresh the list, then enter COM/tty in Interface.');
      await refreshBrowserSerial();
    } catch (e: any) {
      if (e?.name === 'NotFoundError') return;
      toast.error(e?.message || 'Could not open device picker.');
    }
  }, [refreshBrowserSerial]);

  const serialServerDevices: DiscoveredDevice[] = useMemo(() => {
    if (connectionType !== 'bluetooth') return [];
    return serialPorts.map((p) => ({
      value: p.interface,
      label: p.label,
      source: 'server-serial' as const,
    }));
  }, [connectionType, serialPorts]);

  const onScanServer = () => {
    if (connectionType === 'bluetooth') {
      void refetchSerialDiscovery().then((result) => {
        const list = result.data ?? [];
        if (list.length === 0) {
          toast.info(
            'No serial/COM ports detected on the machine running the API server.',
          );
        } else {
          toast.success(`Refreshed: ${list.length} port(s) on API server`);
        }
      });
      return;
    }

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
    const browserMapped: DiscoveredDevice[] = browserSerialOptions.map((o) => ({
      value: o.value,
      label: `${o.label} (browser — type COM/tty in Interface)`,
      source: 'browser-serial' as const,
    }));
    const networkOnly =
      connectionType === 'lan' || connectionType === 'wifi'
        ? discoveredDevices
        : [];
    return [...networkOnly, ...serialServerDevices, ...browserMapped];
  }, [
    connectionType,
    discoveredDevices,
    serialServerDevices,
    browserSerialOptions,
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
              <option value="bluetooth">Bluetooth / USB-Serial</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Interface (filled automatically when possible)"
                {...register('interface')}
                error={errors.interface?.message}
                variant="outline"
                disabled={isLoading}
              />
            </div>
            {(connectionType === 'wifi' ||
              connectionType === 'lan' ||
              connectionType === 'bluetooth') && (
              <Button
                type="button"
                onClick={onScanServer}
                loading={scanning}
                disabled={scanning || isLoading}
                variant="outline"
                className="mb-[2px] shrink-0"
              >
                Scan (server)
              </Button>
            )}
          </div>

          {connectionType === 'bluetooth' && supportsWebSerial() && (
            <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-accent/40 p-3">
              <span className="w-full text-xs font-medium text-heading">
                This computer (browser)
              </span>
              <Button
                type="button"
                variant="outline"
                size="small"
                loading={loadingBrowserPorts}
                disabled={loadingBrowserPorts || isLoading}
                onClick={refreshBrowserSerial}
              >
                List granted USB serial
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                disabled={isLoading}
                onClick={pairBrowserSerial}
              >
                Pair USB serial device
              </Button>
            </div>
          )}

          {allSelectableDevices.length > 0 && (
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
                  if (dev.source === 'browser-serial') {
                    toast.info(
                      'Browser cannot read the COM name. Open Device Manager (Windows) or use ls /dev/tty* (Linux) and type it in Interface.',
                    );
                    e.target.value = '';
                    return;
                  }
                  setValue('interface', dev.value, { shouldValidate: true });
                  e.target.value = '';
                }}
              >
                <option value="">Select a device…</option>
                {serialServerDevices.length > 0 && (
                  <optgroup label="API server — USB / COM (auto-detected)">
                    {serialServerDevices.map((d) => (
                      <option key={`ser-${d.value}`} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {discoveredDevices.length > 0 && (
                  <optgroup label="Network scan (TCP 9100)">
                    {discoveredDevices.map((d) => (
                      <option key={`net-${d.value}-${d.label}`} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {browserSerialOptions.length > 0 && (
                  <optgroup label="Browser USB serial (enter COM/tty manually)">
                    {browserSerialOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
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
