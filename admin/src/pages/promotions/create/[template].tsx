import Layout from '@/components/layouts/admin';
import PromotionForm from '@/components/promotion/promotion-form';
import {
  getPromotionTemplateDefinition,
  isKnownPromotionTemplateParam,
} from '@/config/promotionTemplates';
import type { PromotionTemplateId } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

type PageProps = {
  template: PromotionTemplateId;
};

export default function CreatePromotionConfigurePage({ template }: PageProps) {
  const meta = getPromotionTemplateDefinition(template);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-border-base pb-5 md:pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Step 2 of 2
          </p>
          <h1 className="text-lg font-semibold text-heading">Configure promotion</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            {meta?.summary ??
              'Fill in storefront copy, amounts or item IDs, then schedule and publish.'}
          </p>
        </div>
        <Link
          href="/promotions/create"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          ← Change template
        </Link>
      </div>
      <PromotionForm lockedTemplateId={template} />
    </>
  );
}

CreatePromotionConfigurePage.Layout = Layout;

export const getServerSideProps = async ({ locale, params }: any) => {
  const raw = params?.template as string;
  if (!isKnownPromotionTemplateParam(raw)) {
    return {
      redirect: { destination: '/promotions/create', permanent: false },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['form', 'common'])),
      template: raw,
    },
  };
};
