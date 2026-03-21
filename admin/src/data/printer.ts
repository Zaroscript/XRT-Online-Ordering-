import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printerClient, Printer } from './client/printer';
import { API_ENDPOINTS } from './client/api-endpoints';

export const usePrinterDiscoverSerialQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.PRINTERS, 'discover-serial'],
    queryFn: () => printerClient.discoverSerial(),
    enabled,
    staleTime: 30_000,
  });
};

export const usePrintersQuery = (params?: { active?: boolean }) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.PRINTERS, params],
    queryFn: () => printerClient.fetchPrinters(params),
  });
};

export const usePrinterQuery = (id: string | null) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.PRINTER_DETAIL, id],
    queryFn: () => printerClient.fetchPrinter(id!),
    enabled: !!id,
  });
};

export const useCreatePrinterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: printerClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRINTERS] });
    },
  });
};

export const useUpdatePrinterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Printer> }) =>
      printerClient.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRINTERS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.PRINTER_DETAIL, id],
      });
    },
  });
};

export const useTestPrintMutation = () => {
  return useMutation({
    mutationFn: (id: string) => printerClient.testPrint(id),
  });
};

export const useCheckPrinterConnectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => printerClient.checkConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRINTERS] });
    },
  });
};

export const useScanWiFiMutation = () => {
  return useMutation({
    mutationFn: () => printerClient.scanWiFi(),
  });
};

export const useScanLANMutation = () => {
  return useMutation({
    mutationFn: () => printerClient.scanLAN(),
  });
};

export const useScanBluetoothMutation = () => {
  return useMutation({
    mutationFn: () => printerClient.scanBluetooth(),
  });
};

export const useDeletePrinterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => printerClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PRINTERS] });
    },
  });
};
