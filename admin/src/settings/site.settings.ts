import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  ownerAndStaffOnly,
} from '@/utils/auth-utils';
import { PERMISSION_KEYS } from '@/utils/constants';
import { Routes } from '@/config/routes';

export const siteSettings = {
  name: 'XRT Restaurant System',
  description: 'Restaurant Management Platform',
  logo: {
    url: '/shop-logo-placeholder.svg',
    alt: 'XRT Restaurant System',
    href: '/',
    width: 138,
    height: 34,
  },
  collapseLogo: {
    url: '/shop-logo-placeholder.svg',
    alt: 'XRT',
    href: '/',
    width: 32,
    height: 32,
  },
  defaultLanguage: 'en',
  author: {
    name: 'XRT',
    websiteUrl: '#',
    address: '',
  },
  headerLinks: [],
  authorizedLinks: [
    {
      href: Routes.profileUpdate,
      labelTransKey: 'authorized-nav-item-profile',
      icon: 'UserIcon',
      permission: adminOwnerAndStaffOnly,
    },

    {
      href: Routes.settings,
      labelTransKey: 'authorized-nav-item-settings',
      icon: 'SettingsIcon',
      permission: adminOnly,
    },
    {
      href: Routes.logout,
      labelTransKey: 'authorized-nav-item-logout',
      icon: 'LogOutIcon',
      permission: adminOwnerAndStaffOnly,
    },
  ],
  currencyCode: 'USD',
  sidebarLinks: {
    admin: {
      root: {
        href: Routes.dashboard,
        label: 'Main',
        icon: 'DashboardIcon',
        childMenu: [
          {
            href: Routes.dashboard,
            label: 'sidebar-nav-item-dashboard',
            icon: 'DashboardIcon',
            permission: [PERMISSION_KEYS.DASHBOARD_VIEW],
          },
        ],
      },

      // analytics: {
      //   href: '',
      //   label: 'Analytics',
      //   icon: 'ShopIcon',
      //   childMenu: [
      //     {
      //       href: '',
      //       label: 'Shop',
      //       icon: 'ShopIcon',
      //     },
      //     {
      //       href: '',
      //       label: 'Product',
      //       icon: 'ProductsIcon',
      //     },
      //     {
      //       href: '',
      //       label: 'Order',
      //       icon: 'OrdersIcon',
      //     },
      //     // {
      //     //   href: '',
      //     //   label: 'Sale',
      //     //   icon: 'ShopIcon',
      //     // },
      //     {
      //       href: '',
      //       label: 'User',
      //       icon: 'UsersIcon',
      //     },
      //   ],
      // },

      order: {
        href: Routes.order.list,
        label: 'text-order-management',
        icon: 'OrdersIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_ORDERS_SECTION],
        childMenu: [
          {
            href: Routes.order.list,
            label: 'sidebar-nav-item-orders',
            icon: 'OrdersIcon',
            permission: [PERMISSION_KEYS.ORDERS_READ],
          },
          {
            href: Routes.orderHistory,
            label: 'text-order-history',
            icon: 'TransactionsIcon',
            permission: [PERMISSION_KEYS.ORDERS_READ],
          },
        ],
      },

      menu: {
        href: '',
        label: 'text-content-management',
        icon: 'ProductsIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_MENU_SECTION],
        childMenu: [
          {
            href: '',
            label: 'sidebar-nav-item-menu',
            icon: 'ProductsIcon',
            childMenu: [
              {
                href: Routes.category.list,
                label: 'sidebar-nav-item-categories',
                icon: 'CategoriesIcon',
                permission: [PERMISSION_KEYS.CATEGORIES_READ],
              },
              {
                href: Routes.item.list,
                label: 'sidebar-nav-item-categories-items',
                icon: 'ProductsIcon',
                permission: [PERMISSION_KEYS.ITEMS_READ],
              },
              {
                href: Routes.priceUpdates.list,
                label: 'Price Updates',
                icon: 'ProductsIcon', // Reusing icon for now
              },
              {
                href: Routes.itemSize.list,
                label: 'sidebar-nav-item-items-sizes',
                icon: 'ProductsIcon',
                permission: [PERMISSION_KEYS.ITEMS_READ],
              },
              {
                href: '',
                label: 'sidebar-nav-item-modifiers-management',
                icon: 'AttributeIcon',
                childMenu: [
                  {
                    href: Routes.modifierGroup.list,
                    label: 'form:input-label-modifier-groups',
                    icon: 'AttributeIcon',
                    permission: [PERMISSION_KEYS.MODIFIER_GROUPS_READ],
                  },
                  {
                    href: Routes.modifier.list,
                    label: 'sidebar-nav-item-modifier-items',
                    icon: 'AttributeIcon',
                    permission: [PERMISSION_KEYS.MODIFIERS_READ],
                  },
                ],
              },
              {
                href: Routes.import.list,
                label: 'Import / Export',
                icon: 'UploadIcon', // Using UploadIcon as placeholder for Import/Export
                permission: [PERMISSION_KEYS.IMPORTS_READ],
              },
            ],
          },
        ],
      },

      printing: {
        href: '',
        label: 'Printing',
        icon: 'OrdersIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_PRINTING_SECTION],
        childMenu: [
          {
            href: Routes.printers.list,
            label: 'Printers',
            icon: 'OrdersIcon',
            permission: [PERMISSION_KEYS.PRINTERS_READ],
          },
          {
            href: Routes.printTemplates.list,
            label: 'Templates',
            icon: 'ProductsIcon',
            permission: [PERMISSION_KEYS.PRINT_TEMPLATES_READ],
          },
          {
            href: Routes.kitchenSections.list,
            label: 'Kitchen Sections',
            icon: 'CategoriesIcon',
            permission: [PERMISSION_KEYS.KITCHEN_SECTIONS_READ],
          },
        ],
      },

      user: {
        href: '',
        label: 'text-user-control',
        icon: 'SettingsIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_USERS_SECTION],
        childMenu: [
          {
            href: Routes.adminList,
            label: 'text-admin-list',
            icon: 'AdminListIcon',
            permission: [PERMISSION_KEYS.USERS_READ],
          },

          {
            href: Routes.customerList,
            label: 'text-customers',
            icon: 'CustomersIcon',
            permission: [PERMISSION_KEYS.CUSTOMERS_READ],
          },
          {
            href: Routes.role.list,
            label: 'Roles',
            icon: 'UsersIcon',
            permission: [PERMISSION_KEYS.ROLES_READ],
          },
        ],
      },

      promotional: {
        href: '',
        label: 'text-promotional-management',
        icon: 'SettingsIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_PROMOTIONAL_SECTION],
        childMenu: [
          {
            href: '',
            label: 'sidebar-nav-item-coupons',
            icon: 'CouponsIcon',
            childMenu: [
              {
                href: Routes.coupon.list,
                label: 'text-all-coupons',
                icon: 'CouponsIcon',
                permission: [PERMISSION_KEYS.COUPONS_READ],
              },
              {
                href: Routes.coupon.create,
                label: 'text-new-coupon',
                icon: 'CouponsIcon',
                permission: [PERMISSION_KEYS.COUPONS_CREATE],
              },
            ],
          },
          {
            href: '',
            label: 'Loyalty Management',
            icon: 'ReviewIcon',
            childMenu: [
              {
                href: Routes.loyalty.settings,
                label: 'Settings',
                icon: 'SettingsIcon',
                permission: [PERMISSION_KEYS.LOYALTY_READ],
              },
              {
                href: Routes.loyalty.members,
                label: 'Members',
                icon: 'UsersIcon',
                permission: [PERMISSION_KEYS.LOYALTY_READ],
              },
            ],
          },
          // {
          //   href: '',
          //   label: 'Newsletter emails',
          //   icon: 'CouponsIcon',
          // },
          {
            href: Routes.promoPopup,
            label: 'text-popup-settings',
            icon: 'InformationIcon',
            permissions: adminOwnerAndStaffOnly,
          },
        ],
      },

      marketing: {
        href: '',
        label: 'text-marketing-management',
        icon: 'SettingsIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_MARKETING_SECTION],
        childMenu: [
          {
            href: Routes.message.list,
            label: 'sidebar-nav-item-message',
            icon: 'ChatIcon',
            permission: [PERMISSION_KEYS.EMAILS_READ, PERMISSION_KEYS.SMS_READ],
          },
          {
            href: Routes.emails.list,
            label: 'sidebar-nav-item-emails',
            icon: 'StoreNoticeIcon',
            permission: [PERMISSION_KEYS.EMAILS_READ],
          },
          {
            href: Routes.sms.list,
            label: 'sidebar-nav-item-sms',
            icon: 'ChatIcon',
            permission: [PERMISSION_KEYS.SMS_READ],
          },
        ],
      },

      settings: {
        href: '',
        label: 'text-site-management',
        icon: 'SettingsIcon',
        permission: [PERMISSION_KEYS.DASHBOARD_SETTINGS_SECTION],
        childMenu: [

          {
            href: Routes.settings,
            label: 'sidebar-nav-item-settings',
            icon: 'SettingsIcon',
            childMenu: [
              {
                href: Routes.shopSettings,
                label: 'text-shop-settings',
                icon: 'RefundsIcon',
                permission: [PERMISSION_KEYS.SETTINGS_READ],
              },
              {
                href: Routes.paymentSettings,
                label: 'text-payment-settings',
                icon: 'RefundsIcon',
                permission: [PERMISSION_KEYS.SETTINGS_READ],
              },
              {
                href: Routes.seoSettings,
                label: 'text-seo-settings',
                icon: 'StoreNoticeIcon',
                permission: [PERMISSION_KEYS.SETTINGS_READ],
              },
              {
                href: Routes?.maintenance,
                label: 'text-maintenance-settings',
                icon: 'InformationIcon',
                permission: [PERMISSION_KEYS.SETTINGS_UPDATE],
              },
              {
                href: Routes?.socialSettings,
                label: 'Social Settings',
                icon: 'RefundsIcon',
                permission: [PERMISSION_KEYS.SETTINGS_UPDATE],
              },
              {
                href: '',
                label: 'text-landing-control',
                icon: 'HomeIcon',
                childMenu: [
                  {
                    href: Routes.landingSettings,
                    label: 'text-landing-settings',
                    icon: 'HomeIcon',
                    permission: [PERMISSION_KEYS.SETTINGS_UPDATE],
                  },
                  {
                    href: Routes.testimonials.list,
                    label: 'sidebar-nav-item-testimonials',
                    icon: 'ReviewIcon',
                    permission: [PERMISSION_KEYS.SETTINGS_READ],
                  },
                  {
                    href: Routes.termsAndCondition.list,
                    label: 'text-terms-conditions',
                    icon: 'TermsIcon',
                    permission: [PERMISSION_KEYS.SETTINGS_READ],
                  },
                ],
              },
            ],
          },
          // {
          //   href: '',
          //   label: 'Company Information',
          //   icon: 'InformationIcon',
          // },
          // {
          //   href: '',
          //   label: 'Maintenance',
          //   icon: 'MaintenanceIcon',
          // },
        ],
      },

      // license: {
      //   href: '',
      //   label: 'Main',
      //   icon: 'DashboardIcon',
      //   childMenu: [
      //     {
      //       href: Routes.domains,
      //       label: 'sidebar-nav-item-domains',
      //       icon: 'DashboardIcon',
      //     },
      //   ],
      // },
    },

    ownerDashboard: [
      {
        href: Routes.dashboard,
        label: 'sidebar-nav-item-dashboard',
        icon: 'DashboardIcon',
        permissions: ownerAndStaffOnly,
      },
      {
        href: Routes?.ownerDashboardMyShop,
        label: 'common:sidebar-nav-item-my-shops',
        icon: 'MyShopOwnerIcon',
        permissions: ownerAndStaffOnly,
      },
      {
        href: Routes?.ownerDashboardMessage,
        label: 'common:sidebar-nav-item-message',
        icon: 'ChatOwnerIcon',
        permissions: ownerAndStaffOnly,
      },
      {
        href: Routes?.ownerDashboardNotifyLogs,
        label: 'common:sidebar-nav-item-store-notice',
        icon: 'StoreNoticeOwnerIcon',
        permissions: ownerAndStaffOnly,
      },
      {
        href: Routes?.ownerDashboardShopTransferRequest,
        label: 'Shop Transfer Request',
        icon: 'MyShopIcon',
        permissions: adminAndOwnerOnly,
      },
    ],
  },
  product: {
    placeholder: '/product-placeholder.svg',
  },
  avatar: {
    placeholder: '/avatar-placeholder.svg',
  },
};

export const socialIcon = [
  {
    value: 'FacebookIcon',
    label: 'Facebook',
  },
  {
    value: 'InstagramIcon',
    label: 'Instagram',
  },
  {
    value: 'TwitterIcon',
    label: 'Twitter',
  },
  {
    value: 'YouTubeIcon',
    label: 'Youtube',
  },
  {
    value: 'TikTokIcon',
    label: 'TikTok',
  },
  {
    value: 'LinkedInIcon',
    label: 'LinkedIn',
  },
];
