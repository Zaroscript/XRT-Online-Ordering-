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
    url: '/logo.svg',
    alt: 'XRT Restaurant System',
    href: '/',
    width: 138,
    height: 34,
  },
  collapseLogo: {
    url: '/collapse-logo.svg',
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

      financial: {
        href: '',
        label: 'text-e-commerce-management',
        icon: 'WithdrawIcon',
        childMenu: [
          {
            href: Routes.tax.list,
            label: 'sidebar-nav-item-taxes',
            icon: 'TaxesIcon',
          },
          {
            href: Routes.shipping.list,
            label: 'sidebar-nav-item-shippings',
            icon: 'ShippingsIcon',
          },
          {
            href: Routes.withdraw.list,
            label: 'sidebar-nav-item-withdraws',
            icon: 'WithdrawIcon',
          },
          {
            href: '',
            label: 'sidebar-nav-item-refunds',
            icon: 'RefundsIcon',
            childMenu: [
              {
                href: Routes.refund.list,
                label: 'text-reported-refunds',
                icon: 'RefundsIcon',
              },
              {
                href: Routes.refundPolicies.list,
                label: 'sidebar-nav-item-refund-policy',
                icon: 'AuthorIcon',
              },
              {
                href: Routes.refundPolicies.create,
                label: 'text-new-refund-policy',
                icon: 'RefundsIcon',
              },
              {
                href: Routes.refundReasons.list,
                label: 'text-refund-reasons',
                icon: 'RefundsIcon',
              },
              {
                href: Routes.refundReasons.create,
                label: 'text-new-refund-reasons',
                icon: 'RefundsIcon',
              },
            ],
          },
        ],
      },

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
            href: Routes.order.create,
            label: 'sidebar-nav-item-create-order',
            icon: 'CreateOrderIcon',
          },
          {
            href: Routes.transaction,
            label: 'text-transactions',
            icon: 'TransactionsIcon',
          },
          // {
          //   href: '',
          //   label: 'Order tracking',
          //   icon: 'OrderTrackingIcon',
          // },
          // {
          //   href: '',
          //   label: 'Delivery policies',
          //   icon: 'ShippingsIcon',
          // },
          // {
          //   href: '',
          //   label: 'Cancelation policies',
          //   icon: 'CancelationIcon',
          // },
        ],
      },

      layout: {
        href: '',
        label: 'text-page-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.type.list,
            label: 'text-groups',
            icon: 'HomeIcon',
          },
          {
            href: '',
            label: 'text-faqs',
            icon: 'FaqIcon',
            childMenu: [
              {
                href: Routes.faqs.list,
                label: 'text-all-faqs',
                icon: 'FaqIcon',
              },
              {
                href: Routes.faqs.create,
                label: 'text-new-faq',
                icon: 'TypesIcon',
              },
            ],
          },
          {
            href: '',
            label: 'text-terms-conditions',
            icon: 'TermsIcon',
            childMenu: [
              {
                href: Routes.termsAndCondition.list,
                label: 'text-all-terms',
                icon: 'TermsIcon',
              },
              {
                href: Routes.termsAndCondition.create,
                label: 'text-new-terms',
                icon: 'TermsIcon',
              },
            ],
          },
          {
            href: Routes.becomeSeller,
            label: 'Become a seller Page',
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

      feedback: {
        href: '',
        label: 'text-feedback-control',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.reviews.list,
            label: 'sidebar-nav-item-reviews',
            icon: 'ReviewIcon',
          },
          {
            href: Routes.question.list,
            label: 'sidebar-nav-item-questions',
            icon: 'QuestionIcon',
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
            label: 'text-flash-sale',
            icon: 'FlashDealsIcon',
            childMenu: [
              {
                href: Routes.flashSale.list,
                label: 'text-all-campaigns',
                icon: 'FlashDealsIcon',
              },
              {
                href: Routes.flashSale.create,
                label: 'text-new-campaigns',
                icon: 'FlashDealsIcon',
              },
              {
                href: Routes.vendorRequestForFlashSale.list,
                label: 'Vendor requests',
                icon: 'CouponsIcon',
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

      feature: {
        href: '',
        label: 'text-feature-management',
        icon: 'SettingsIcon',
        childMenu: [
          {
            href: Routes.message.list,
            label: 'sidebar-nav-item-message',
            icon: 'ChatIcon',
          },
          {
            href: Routes.storeNotice.list,
            label: 'sidebar-nav-item-store-notice',
            icon: 'StoreNoticeIcon',
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
                href: Routes.settings,
                label: 'text-general-settings',
                icon: 'SettingsIcon',
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
                href: Routes.printerSettings,
                label: 'text-printer-settings',
                icon: 'RefundsIcon',
              },
              {
                href: Routes.shopSettings,
                label: 'text-shop-settings',
                icon: 'RefundsIcon',
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
        href: Routes?.ownerDashboardNotice,
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
