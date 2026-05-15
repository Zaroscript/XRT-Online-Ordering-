import Navbar from '@/components/layouts/navigation/top-navbar';
import { miniSidebarInitialValue } from '@/utils/constants';
import Footer from '@/components/layouts/footer/footer-bar';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import { useTranslation } from 'next-i18next';
import SidebarItem from '@/components/layouts/navigation/sidebar-item';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import cn from 'classnames';
import Scrollbar from '@/components/ui/scrollbar';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import {
  checkIsMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  SUPER_ADMIN,
} from '@/utils/constants';
import { useSocketOrderListener } from '@/hooks/useSocketOrderListener';
import ThemeGear from '@/components/layouts/navigation/theme-gear';
import { Routes } from '@/config/routes';
import { getAuthCredentials } from '@/utils/auth-utils';

const ProfileSidebar = ({ userRole }: { userRole?: string }) => {
  const { t } = useTranslation();
  const [miniSidebar, _] = useAtom(miniSidebarInitialValue);
  const { width } = useWindowSize();
  const { role: authRole } = getAuthCredentials();
  const currentRole = userRole || authRole;

  const profileMenu = [
    {
      href: Routes.profileUpdate + '?tab=general',
      label: 'form:form-title-general-information',
      icon: 'UserIcon',
    },
    {
      href: Routes.profileUpdate + '?tab=settings',
      label: 'form:form-title-account-settings',
      icon: 'SettingsIcon',
    },
    {
      href: Routes.profileUpdate + '?tab=security',
      label: 'form:form-title-security',
      icon: 'OrdersStatusIcon',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Back to Dashboard Link */}
      <div className="px-5 py-5 border-b border-dashed border-gray-200">
        <SidebarItem
          href={Routes.dashboard}
          label={t('form:form-label-back-to-dashboard')}
          icon="ArrowPrev"
          miniSidebar={miniSidebar && width >= RESPONSIVE_WIDTH}
        />
      </div>

      <div className="flex flex-col px-5 pt-6 pb-3">
        <div
          className={cn(
            'px-3 pb-5 text-xs font-semibold uppercase tracking-[0.05em] text-body/60',
            miniSidebar && width >= RESPONSIVE_WIDTH ? 'hidden' : '',
          )}
        >
          {t('form:form-title-profile-settings')}
        </div>
        <div className="space-y-2">
          {profileMenu.map((item) => (
            <SidebarItem
              key={item.label}
              href={item.href}
              label={t(item.label)}
              icon={item.icon}
              miniSidebar={miniSidebar && width >= RESPONSIVE_WIDTH}
              currentUserRole={currentRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileLayout: React.FC<{
  children?: React.ReactNode;
  userRole?: string;
  userPermissions?: string[];
}> = ({ children, userRole }) => {
  const { locale } = useRouter();
  const { role: authRole } = getAuthCredentials();
  const currentRole = userRole || authRole;

  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  const [miniSidebar, _] = useAtom(miniSidebarInitialValue);
  const [underMaintenance] = useAtom(checkIsMaintenanceModeComing);
  const [underMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const { width } = useWindowSize();

  // Connect to socket.io for real-time new order notifications
  useSocketOrderListener();

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <ProfileSidebar userRole={currentRole} />
      </MobileNavigation>

      <div className="flex flex-1">
        <aside
          className={cn(
            'fixed bottom-0 z-10 hidden h-full w-72 bg-white transition-[width] duration-300 ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto lg:block',
            width >= RESPONSIVE_WIDTH &&
              (underMaintenance || underMaintenanceStart)
              ? 'lg:pt-[8.75rem]'
              : 'pt-20',
            miniSidebar && width >= RESPONSIVE_WIDTH ? 'lg:w-24' : 'lg:w-76',
          )}
        >
          <div className="sidebar-scrollbar h-full w-full overflow-x-hidden">
            <Scrollbar
              className="h-full w-full"
              options={{
                scrollbars: {
                  autoHide: 'never',
                },
              }}
            >
              <ProfileSidebar userRole={currentRole} />
            </Scrollbar>
          </div>
        </aside>
        <main
          className={cn(
            'relative flex w-full flex-col justify-start transition-[padding] duration-300',
            width >= RESPONSIVE_WIDTH &&
              (underMaintenance || underMaintenanceStart)
              ? 'lg:pt-[8.75rem]'
              : 'pt-[72px] lg:pt-20',
            miniSidebar && width >= RESPONSIVE_WIDTH
              ? 'ltr:lg:pl-24 rtl:lg:pr-24'
              : 'ltr:xl:pl-76 rtl:xl:pr-76 ltr:lg:pl-72 rtl:lg:pr-72 rtl:lg:pl-0',
          )}
        >
          <div className="h-full p-5 md:p-8">{children}</div>
          <Footer />
        </main>
      </div>

      {/* Global Notification Components */}
      <ThemeGear />
    </div>
  );
};
export default ProfileLayout;

