import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import Router from 'next/router';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  importClient,
  ImportSession,
  ParseImportInput,
  UpdateImportSessionInput,
} from './client/import';
import { Routes } from '@/config/routes';

export const useParseImportMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: importClient.parse,
    onSuccess: (data) => {
      const session = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.IMPORT_SESSION, session.id],
        session,
      );
      toast.success(t('common:successfully-created'));
      Router.push(`${Routes.import.review.replace(':id', session.id)}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useAppendImportFileMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      id,
      file,
      entity_type,
    }: {
      id: string;
      file: File;
      entity_type?:
        | 'categories'
        | 'items'
        | 'sizes'
        | 'modifierGroups'
        | 'modifiers';
    }) => importClient.appendFile(id, file, entity_type),
    onSuccess: (data, variables) => {
      const session = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.IMPORT_SESSION, variables.id],
        session,
      );
      toast.success(t('common:append-file-success'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t('common:append-file-failed'),
      );
    },
  });
};

export const useImportSessionQuery = (id: string) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ImportSession>({
    queryKey: [API_ENDPOINTS.IMPORT_SESSION, id],
    queryFn: () => importClient.getSession(id),
    enabled: !!id,
  });
  const session = (data as any)?.data || data;
  return {
    session,
    error,
    isLoading,
  };
};

export const useImportSessionsQuery = (business_id?: string) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ImportSession[]>({
    queryKey: [API_ENDPOINTS.IMPORT_SESSIONS, business_id],
    queryFn: () => importClient.listSessions(business_id),
  });
  const sessions = (data as any)?.data || data || [];
  return {
    sessions: Array.isArray(sessions) ? sessions : [],
    error,
    isLoading,
  };
};

export const useUpdateImportSessionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateImportSessionInput) =>
      importClient.updateSession(id, input),
    onSuccess: (data, variables) => {
      const session = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.IMPORT_SESSION, variables.id],
        session,
      );
      toast.success(t('common:draft-saved'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t('common:draft-save-failed'),
      );
    },
  });
};

export const useFinalSaveImportMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => importClient.finalSave(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSION, id],
      });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
      toast.success(t('common:save-success'));
      Router.push(Routes.item.list);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:save-failed'));
    },
  });
};

export const useDiscardImportSessionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => importClient.discardSession(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSION, id],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSIONS],
      });
      toast.success(t('common:discard-success'));
      Router.push(Routes.import.list);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:discard-failed'));
    },
  });
};

export const useDeleteImportSessionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => importClient.deleteSession(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSION, id],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSIONS],
      });
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:delete-failed'));
    },
  });
};

export const useDownloadImportErrorsMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await importClient.downloadErrors(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `import-errors-${id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success(t('common:download-errors-success'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t('common:download-failed'),
      );
    },
  });
};

export const useImportAttributesMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ shop_id, csv }: { shop_id: string; csv: File }) =>
      importClient.parse({ business_id: shop_id, file: csv }),
    onSuccess: (data) => {
      const session = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.IMPORT_SESSION, session.id],
        session,
      );
      toast.success(t('common:successfully-created'));
      Router.push(`${Routes.import.review.replace(':id', session.id)}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useImportProductsMutation = useImportAttributesMutation;
export const useImportVariationOptionsMutation = useImportAttributesMutation;

export const useRollbackImportSessionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => importClient.rollbackSession(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSION, id],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSIONS],
      });
      // Invalidate entities that might have been affected
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });

      toast.success(t('common:rollback-success'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t('common:rollback-failed'),
      );
    },
  });
};

export const useClearImportHistoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (business_id: string) => importClient.clearHistory(business_id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.IMPORT_SESSIONS],
      });
      toast.success(t('common:clear-history-success'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t('common:clear-history-failed'),
      );
    },
  });
};
