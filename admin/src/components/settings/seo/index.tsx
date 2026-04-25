import { Fragment, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { Disclosure, Transition } from '@headlessui/react';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import FileInput from '@/components/ui/file-input';
import Button from '@/components/ui/button';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { SaveIcon } from '@/components/icons/save';
import { Skeleton, SkeletonText } from '@/components/ui/loading-skeleton';
import { Routes } from '@/config/routes';
import {
  SeoLocaleSettingsPayload,
  useGenerateSeoSettingsMutation,
  useSeoHealthScoreQuery,
  useSeoSettingsQuery,
  useUpdateSeoSettingsMutation,
} from '@/data/settings';
import { Settings } from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';

type IProps = {
  settings?: Settings | null;
};

type SeoFormValues = {
  metaTitle: string;
  metaDescription: string;
  keywordsText: string;
  slug: string;
  shareTitle: string;
  shareDescription: string;
  shareImage?: any;
  canonicalUrl: string;
  noindex: boolean;
  ogTitle: string;
  ogDescription: string;
};

const DEFAULT_LOCALE = 'en';

function parseKeywords(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => {
      const normalized = keyword.toLowerCase();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function getAttachmentPreview(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?.original || value?.thumbnail || value?.url || '';
}

function buildFormDefaults(seo?: SeoLocaleSettingsPayload): SeoFormValues {
  return {
    metaTitle: seo?.metaTitle ?? '',
    metaDescription: seo?.metaDescription ?? '',
    keywordsText: (seo?.keywords ?? []).join(', '),
    slug: seo?.slug ?? '',
    shareTitle: seo?.shareTitle ?? '',
    shareDescription: seo?.shareDescription ?? '',
    shareImage: seo?.shareImage ?? null,
    canonicalUrl: seo?.canonicalUrl ?? '',
    noindex: Boolean(seo?.noindex),
    ogTitle: seo?.ogTitle ?? '',
    ogDescription: seo?.ogDescription ?? '',
  };
}

function computeHealthScore(values: SeoFormValues, source: any) {
  let score = 0;
  const warnings: string[] = [];
  const title = typeof values?.metaTitle === 'string' ? values.metaTitle : '';
  const description =
    typeof values?.metaDescription === 'string' ? values.metaDescription : '';
  const keywordsText =
    typeof values?.keywordsText === 'string' ? values.keywordsText : '';
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  const keywords = parseKeywords(keywordsText);
  const shareImage = getAttachmentPreview(values?.shareImage);
  const hasAddress = Boolean(source?.city || source?.state || source?.country);

  if (titleLength) score += 20;
  else warnings.push('Missing meta title.');

  if (descriptionLength) score += 20;
  else warnings.push('Missing meta description.');

  if (keywords.length) score += 15;
  else warnings.push('No keywords provided.');

  if (shareImage) score += 15;
  else warnings.push('No share image selected.');

  if (source?.phone) score += 10;
  else warnings.push('Business phone is missing.');

  if (hasAddress) score += 10;
  else warnings.push('Business address is missing.');

  if (titleLength >= 30 && titleLength <= 60) score += 5;
  else if (titleLength) warnings.push('Title should be 30-60 characters.');

  if (descriptionLength >= 70 && descriptionLength <= 160) score += 5;
  else if (descriptionLength) warnings.push('Description should be 70-160 characters.');

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
  };
}

export default function SeoSettingsForm(_: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = DEFAULT_LOCALE;
  const { data, isPending } = useSeoSettingsQuery({ locale });
  const { data: healthData } = useSeoHealthScoreQuery({ locale });
  const { mutate: updateSeoSettings, isPending: savingSeo } = useUpdateSeoSettingsMutation();
  const { mutate: generateSeo, isPending: generatingSeo } = useGenerateSeoSettingsMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<SeoFormValues>({
    shouldUnregister: true,
    defaultValues: buildFormDefaults(),
  });

  const source = data?.sources;
  const watchedValues = watch();
  const localScore = useMemo(
    () => computeHealthScore(watchedValues, source),
    [watchedValues, source],
  );
  const titleChars = watchedValues.metaTitle?.trim().length ?? 0;
  const descriptionChars = watchedValues.metaDescription?.trim().length ?? 0;
  const keywordList = parseKeywords(watchedValues.keywordsText ?? '');

  useEffect(() => {
    if (data?.seoSettings) {
      reset(buildFormDefaults(data.seoSettings));
    }
  }, [data?.seoSettings, reset]);

  useConfirmRedirectIfDirty({ isDirty });

  const onSubmit = (values: SeoFormValues) => {
    const payload = {
      locale,
      seoSettings: {
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        keywords: parseKeywords(values.keywordsText),
        slug: values.slug,
        shareTitle: values.shareTitle,
        shareDescription: values.shareDescription,
        shareImage: values.shareImage ?? null,
        canonicalUrl: values.canonicalUrl,
        noindex: Boolean(values.noindex),
        ogTitle: values.ogTitle,
        ogDescription: values.ogDescription,
      },
    };

    updateSeoSettings(payload, {
      onSuccess: (response: any) => {
        if (response?.seoSettings) {
          reset(buildFormDefaults(response.seoSettings));
        }
      },
    });
  };

  const handleGenerate = () => {
    generateSeo(
      { locale, force: false },
      {
        onSuccess: (response: any) => {
          if (response?.seoSettings) {
            reset(buildFormDefaults(response.seoSettings));
          }
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:mt-8 sm:mb-3">
        <Description
          title={t('text-seo') || 'SEO'}
          details="Preview how your restaurant appears in search results."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          {isPending ? (
            <div className="space-y-3">
              <SkeletonText className="w-32 h-5" />
              <SkeletonText className="w-4/5 h-4" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="truncate text-sm text-green-700">
                {source?.websiteUrl || 'https://your-restaurant.com'}/{watchedValues.slug || 'restaurant-slug'}
              </p>
              <h4 className="mt-1 line-clamp-2 text-lg font-medium text-blue-700">
                {watchedValues.metaTitle || source?.businessName || 'Restaurant SEO title preview'}
              </h4>
              <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                {watchedValues.metaDescription || source?.businessDescription || 'Your search description appears here.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Basic SEO Settings"
          details="Configure title, description, keywords, and slug."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label="Meta Title"
            toolTipText="Recommended length is 30-60 characters."
            {...register('metaTitle')}
            variant="outline"
            className="mb-2"
          />
          <p className="mb-4 text-xs text-gray-500">{titleChars}/60</p>

          <TextArea
            label="Meta Description"
            toolTipText="Recommended length is 70-160 characters."
            {...register('metaDescription')}
            variant="outline"
            className="mb-2"
          />
          <p className="mb-4 text-xs text-gray-500">{descriptionChars}/160</p>

          <Input
            label="Keywords (comma separated)"
            toolTipText="Example: pizza, burgers, online ordering"
            {...register('keywordsText')}
            variant="outline"
            className="mb-3"
          />
          <div className="mb-5 flex flex-wrap gap-2">
            {keywordList.length ? (
              keywordList.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No keywords added yet.</span>
            )}
          </div>

          <Input
            label="Slug"
            toolTipText="Used in your website URL."
            {...register('slug')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Social Share Preview"
          details="How this page appears on Facebook and WhatsApp."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="h-36 bg-gray-100">
                {getAttachmentPreview(watchedValues.shareImage) ? (
                  <img
                    src={getAttachmentPreview(watchedValues.shareImage)}
                    alt="Social share preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">No share image</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Facebook / WhatsApp</p>
                <h5 className="mt-1 line-clamp-2 text-sm font-semibold text-heading">
                  {watchedValues.shareTitle || watchedValues.metaTitle || source?.businessName || 'Share title'}
                </h5>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {watchedValues.shareDescription || watchedValues.metaDescription || 'Share description preview'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Share Title" {...register('shareTitle')} variant="outline" />
              <TextArea label="Share Description" {...register('shareDescription')} variant="outline" />
              <FileInput
                label="Share Image"
                name="shareImage"
                control={control}
                multiple={false}
                helperText="Fallback is hero image, then logo, then favicon."
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Local SEO Info"
          details="Auto-synced business profile details used in SEO."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          {isPending ? (
            <div className="space-y-3">
              <SkeletonText className="w-2/3 h-4" />
              <SkeletonText className="w-1/2 h-4" />
              <SkeletonText className="w-3/4 h-4" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase text-gray-500">Business Name</p>
                  <p className="mt-1 text-sm font-medium text-heading">{source?.businessName || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase text-gray-500">Phone</p>
                  <p className="mt-1 text-sm font-medium text-heading">{source?.phone || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase text-gray-500">Address</p>
                  <p className="mt-1 text-sm font-medium text-heading">
                    {[source?.city, source?.state, source?.country].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <p className="text-xs uppercase text-gray-500">Hours</p>
                  <p className="mt-1 text-sm font-medium text-heading">{source?.hoursLabel || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="small" onClick={() => router.push(Routes.shopSettings)}>
                  Edit Business Source
                </Button>
                <Button type="button" variant="outline" size="small" onClick={() => router.push(Routes.landingSettings)}>
                  Edit Landing Source
                </Button>
                <Button type="button" variant="outline" size="small" onClick={() => router.push(Routes.socialSettings)}>
                  Edit Social Source
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="SEO Health Score"
          details="Live quality score with actionable warnings."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-xs uppercase text-gray-500">Current Score</p>
              <p className="text-2xl font-semibold text-heading">
                {localScore.score}
                <span className="text-base text-gray-500">/100</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Saved score: {healthData?.score ?? data?.seoSettings?.score ?? 0}/100
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {(localScore.warnings.length ? localScore.warnings : ['Great work - no critical SEO warnings.']).map(
              (warning) => (
                <div
                  key={warning}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
                >
                  {warning}
                </div>
              ),
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Advanced Settings"
          details="Optional advanced controls for indexing and canonical behavior."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <span>{open ? 'Hide advanced fields' : 'Show advanced fields'}</span>
                  <span>{open ? '−' : '+'}</span>
                </Disclosure.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-1"
                >
                  <Disclosure.Panel className="space-y-5">
                    <Input label="Canonical URL" {...register('canonicalUrl')} variant="outline" />
                    <Input label="OG Title" {...register('ogTitle')} variant="outline" />
                    <TextArea label="OG Description" {...register('ogDescription')} variant="outline" />
                    <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        {...register('noindex')}
                      />
                      <span>Noindex this page</span>
                    </label>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            loading={generatingSeo}
            disabled={generatingSeo || savingSeo}
            className="text-sm md:text-base"
            onClick={handleGenerate}
          >
            Auto Generate
          </Button>
          <Button
            loading={savingSeo}
            disabled={savingSeo || generatingSeo || !Boolean(isDirty)}
            className="text-sm md:text-base"
          >
            <SaveIcon className="relative w-6 h-6 top-px shrink-0 ltr:mr-2 rtl:pl-2" />
            {t('form:button-label-save-settings')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
