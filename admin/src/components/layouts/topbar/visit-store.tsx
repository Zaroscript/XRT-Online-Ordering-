import { HomeIcon } from '@/components/icons/home-icon';
import { Routes } from '@/config/routes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@/contexts/settings.context';

const VisitStore = () => {
  const { t } = useTranslation();
  const { pathname, query } = useRouter();
  const { contactDetails, siteLink } = useSettings();
  const slug = (pathname === '/[shop]' && `shops/${query?.shop}`) || '/';
  
  // Prioritize siteLink from landing settings, fallback to contactDetails.website or calculated slug
  const siteUrl = siteLink || contactDetails?.website || Routes.visitStore(slug as string);

  return (
    <>
      <Link
        href={siteUrl}
        target="_blank"
        className="inline-flex h-9 flex-shrink-0 items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-0 text-sm font-medium leading-none text-accent outline-none transition duration-300 ease-in-out hover:border-transparent hover:bg-accent-hover hover:text-white focus:shadow focus:outline-none"
        rel="noreferrer"
      >
        <HomeIcon />
        {slug === '/' ? t('text-visit-site') : t('text-visit-store')}
      </Link>
    </>
  );
};

export default VisitStore;
