import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  ownerAndStaffOnly,
} from '@/utils/auth-utils';
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
        childMenu: [
          {
            href: Routes.order.list,
            label: 'sidebar-nav-item-orders',
            icon: 'OrdersIcon',
          },
          {
            href: Routes.orderHistory,
            label: 'text-order-history',
            icon: 'TransactionsIcon',
          },
        ],
      },

      menu: {
        href: '',
        label: 'text-content-management',
        icon: 'ProductsIcon',
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
              },
              {
                href: Routes.item.list,
                label: 'sidebar-nav-item-categories-items',
                icon: 'ProductsIcon',
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
                  },
                  {
                    href: Routes.modifier.list,
                    label: 'sidebar-nav-item-modifier-items',
                    icon: 'AttributeIcon',
                  },
                ],
              },
              {
                href: Routes.import.list,
                label: 'Import / Export',
                icon: 'UploadIcon', // Using UploadIcon as placeholder for Import/Export
              },
            ],
          },
        ],
      },

      printing: {
        href: '',
        label: 'Printing',
        icon: 'OrdersIcon',
        childMenu: [
          {
            href: Routes.printers.list,
            label: 'Printers',
            icon: 'OrdersIcon',
          },
          {
            href: Routes.printTemplates.list,
            label: 'Templates',
            icon: 'ProductsIcon',
          },
          {
            href: Routes.kitchenSections.list,
            label: 'Kitchen Sections',
            icon: 'CategoriesIcon',
          },
        ],
      },

      layout: {
        href: '',
        label: 'text-landing-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.landingSettings,
            label: 'text-landing-settings',
            icon: 'HomeIcon',
          },
          {
            href: Routes.testimonials.list,
            label: 'sidebar-nav-item-testimonials',
            icon: 'ReviewIcon',
          },
          {
            href: Routes.termsAndCondition.list,
            label: 'text-terms-conditions',
            icon: 'TermsIcon',
          },
        ],
      },

      user: {
        href: '',
        label: 'text-user-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.adminList,
            label: 'text-admin-list',
            icon: 'AdminListIcon',
          },

          {
            href: Routes.customerList,
            label: 'text-customers',
            icon: 'CustomersIcon',
          },
          {
            href: Routes.role.list,
            label: 'Roles',
            icon: 'UsersIcon',
          },
        ],
      },

      promotional: {
        href: '',
        label: 'text-promotional-management',
        icon: 'SettingsIcon',
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
              },
              {
                href: Routes.coupon.create,
                label: 'text-new-coupon',
                icon: 'CouponsIcon',
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
              },
              {
                href: Routes.loyalty.members,
                label: 'Members',
                icon: 'UsersIcon',
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
        childMenu: [
          {
            href: Routes.message.list,
            label: 'sidebar-nav-item-message',
            icon: 'ChatIcon',
          },
          {
            href: Routes.emails.list,
            label: 'sidebar-nav-item-emails',
            icon: 'StoreNoticeIcon',
          },
          {
            href: Routes.sms.list,
            label: 'sidebar-nav-item-sms',
            icon: 'ChatIcon',
          },
        ],
      },

      settings: {
        href: '',
        label: 'text-site-management',
        icon: 'SettingsIcon',
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
              },
              {
                href: Routes.paymentSettings,
                label: 'text-payment-settings',
                icon: 'RefundsIcon',
              },
              {
                href: Routes.seoSettings,
                label: 'text-seo-settings',
                icon: 'StoreNoticeIcon',
              },
              {
                href: Routes?.maintenance,
                label: 'text-maintenance-settings',
                icon: 'InformationIcon',
              },
              {
                href: Routes?.socialSettings,
                label: 'Social Settings',
                icon: 'RefundsIcon',
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
