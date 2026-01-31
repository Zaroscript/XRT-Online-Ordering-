import { useTranslation } from 'next-i18next';
import ImportCsv from '@/components/ui/import-csv';
import { useImportCategoriesMutation } from '@/data/category';

export default function ImportCategories() {
  const { t } = useTranslation('common');

  const { mutate: importCategories, isPending: loading } =
    useImportCategoriesMutation();

  const handleDrop = async (acceptedFiles: any) => {
    if (acceptedFiles.length) {
      const formData = new FormData();
      formData.append('csv', acceptedFiles[0]);
      importCategories(formData);
    }
  };

  return (
    <ImportCsv
      onDrop={handleDrop}
      loading={loading}
      title={t('text-import-categories')}
    />
  );
}
