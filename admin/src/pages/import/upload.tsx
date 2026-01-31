import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { useParseImportMutation } from '@/data/import';
import { adminOnly, getAuthCredentials } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { UploadIcon } from '@/components/icons/upload-icon';
import { useRouter } from 'next/router';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

const ImportUploadPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const {
    mutate: parseImport,
    isPending: isLoading,
    error,
  } = useParseImportMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    parseImport({
      file,
      business_id: businessId || undefined,
    });
  };

  return (
    <>
      <Card className="mb-8">
        <PageHeading title={t('common:import-items')} />
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">
            {t('common:upload-import-file')}
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('common:import-description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              {t('common:business-id')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 focus:border-accent focus:outline-none"
              placeholder="Enter business ID"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              {t('common:csv-or-zip-file')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv,.zip"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-accent hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {file ? file.name : t('common:click-to-upload')}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('common:csv-zip-files-only')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <ErrorMessage
              message={
                (error as any)?.response?.data?.message ||
                t('common:upload-failed')
              }
            />
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              {t('common:text-cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!file || !businessId || isLoading}
              loading={isLoading}
            >
              {isLoading
                ? t('common:text-loading')
                : t('common:parse-and-validate')}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

ImportUploadPage.authenticate = {
  permissions: adminOnly,
};
ImportUploadPage.Layout = Layout;

export default ImportUploadPage;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
