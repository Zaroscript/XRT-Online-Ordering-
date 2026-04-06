export const Routes = {
  dashboard: '/',
  login: '/login',
  logout: '/logout',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  adminMyShops: '/my-shops',
  profile: '/profile',
  verifyCoupons: '/coupons/verify',
  settings: '/settings',
  landingSettings: '/landing-settings',
  paymentSettings: '/settings/payment',
  seoSettings: '/settings/seo',
  shopSettings: '/settings/shop',
  companyInformation: '/settings/company-information',
  socialSettings: '/settings/social',
  maintenance: '/settings/maintenance',
  promoPopup: '/promo-popup',
  storeSettings: '/vendor/settings',
  storeKeepers: '/vendor/store_keepers',
  profileUpdate: '/profile-update',

  verifyEmail: '/verify-email',
  verifyLicense: '/verify-license',
  role: {
    ...routesFactory('/roles'),
  },
  user: {
    ...routesFactory('/users'),
  },
  customer: {
    ...routesFactory('/users/customers'),
  },
  type: {
    ...routesFactory('/groups'),
  },
  category: {
    ...routesFactory('/categories'),
  },
  attribute: {
    ...routesFactory('/attributes'),
  },
  attributeValue: {
    ...routesFactory('/attribute-values'),
  },
  tag: {
    ...routesFactory('/tags'),
  },
  reviews: {
    ...routesFactory('/reviews'),
  },
  testimonials: {
    ...routesFactory('/testimonials'),
  },
  abuseReviews: {
    ...routesFactory('/abusive_reports'),
  },
  abuseReviewsReport: {
    ...routesFactory('/abusive_reports/reject'),
  },
  author: {
    ...routesFactory('/authors'),
  },
  coupon: {
    ...routesFactory('/coupons'),
  },
  manufacturer: {
    ...routesFactory('/manufacturers'),
  },
  order: {
    ...routesFactory('/orders'),
  },
  orderStatus: {
    ...routesFactory('/order-status'),
  },

  product: {
    ...routesFactory('/products'),
  },
  item: {
    ...routesFactory('/items'),
  },
  itemSize: {
    ...routesFactory('/item-sizes'),
  },
  modifierGroup: {
    ...routesFactory('/modifiers/groups'),
  },
  modifier: {
    ...routesFactory('/modifiers'),
  },
  import: {
    list: '/import',
    upload: '/import/upload',
    review: '/import/review/:id',
  },
  shop: {
    ...routesFactory('/shops'),
  },

  staff: {
    ...routesFactory('/staffs'),
  },

  message: {
    ...routesFactory('/message'),
  },
  emails: {
    ...routesFactory('/emails'),
  },
  sms: {
    ...routesFactory('/sms'),
  },
  shopMessage: {
    ...routesFactory('/shop-message'),
  },
  conversations: {
    ...routesFactory('/message/conversations'),
  },
  notifyLogs: {
    ...routesFactory('/notify-logs'),
  },
  newShops: '/new-shops',
  draftProducts: '/products/draft',
  outOfStockOrLowProducts: '/products/product-stock',
  productInventory: '/products/inventory',
  priceUpdates: {
    ...routesFactory('/price-updates'),
  },
  printers: {
    list: '/printers',
    create: '/printers/create',
    edit: (id: string) => `/printers/${id}/edit`,
  },
  printTemplates: {
    list: '/templates',
    create: '/templates/create',
    edit: (id: string) => `/templates/${id}/edit`,
  },
  kitchenSections: {
    list: '/kitchen-sections',
    create: '/kitchen-sections/create',
    edit: (id: string) => `/kitchen-sections/${id}/edit`,
  },
  orderHistory: '/orders/order-history',
  refund: {
    ...routesFactory('/refunds'),
  },
  termsAndCondition: {
    ...routesFactory('/terms-and-conditions'),
  },
  adminList: '/users/admins',
  vendorList: '/users/vendors',
  pendingVendorList: '/uمsers/vendors/pending',
  customerList: '/users/customer',
  myStaffs: '/users/my-staffs',
  vendorStaffs: '/users/vendor-staffs',
  ownerDashboardMessage: '/owner-message',
  ownerDashboardMyShop: '/my-shop',
  ownerDashboardNotifyLogs: '/notify-logs',
  inventory: {
    editWithoutLang: (slug: string) => {
      return `/products/${slug}/edit`;
    },
    edit: (slug: string, language: string) => {
      return `/${language}/products/${slug}/edit`;
    },
    translate: (slug: string, language: string) => {
      return `/${language}/products/${slug}/translate`;
    },
  },
  visitStore: (slug: string) =>
    `${process.env.NEXT_PUBLIC_SHOP_URL?.replace(/\/$/, '')}/${slug.replace(/^\//, '')}`,
  ownershipTransferRequest: {
    ...routesFactory('/shop-transfer'),
  },
  ownerDashboardShopTransferRequest: '/shop-transfer/vendor',
  loyalty: {
    settings: '/loyalty/settings',
    members: '/loyalty/members',
  },
};

function routesFactory(endpoint: string) {
  return {
    list: `${endpoint}`,
    create: `${endpoint}/create`,
    editWithoutLang: (slug: string) => {
      return `${endpoint}/${slug}/edit`;
    },
    edit: (slug: string, language: string) => {
      return `/${language}${endpoint}/${slug}/edit`;
    },
    translate: (slug: string, language: string) => {
      return `${language}${endpoint}/${slug}/translate`;
    },
    details: (slug: string) => `${endpoint}/${slug}`,
    editByIdWithoutLang: (id: string) => {
      return `${endpoint}/${id}/edit`;
    },
  };
}
