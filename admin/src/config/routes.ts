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
  paymentSettings: '/settings/payment',
  seoSettings: '/settings/seo',
  printerSettings: '/settings/printer',
  shopSettings: '/settings/shop',
  companyInformation: '/settings/company-information',
  socialSettings: '/settings/social',
  maintenance: '/settings/maintenance',
  promoPopup: '/promo-popup',
  storeSettings: '/vendor/settings',
  storeKeepers: '/vendor/store_keepers',
  profileUpdate: '/profile-update',
  checkout: '/orders/checkout',
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
  orderCreate: {
    ...routesFactory('/orders/create'),
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
  tax: {
    ...routesFactory('/taxes'),
  },
  shipping: {
    ...routesFactory('/shippings'),
  },
  withdraw: {
    ...routesFactory('/withdraws'),
  },
  staff: {
    ...routesFactory('/staffs'),
  },
  refund: {
    ...routesFactory('/refunds'),
  },
  question: {
    ...routesFactory('/questions'),
  },
  message: {
    ...routesFactory('/message'),
  },
  shopMessage: {
    ...routesFactory('/shop-message'),
  },
  conversations: {
    ...routesFactory('/message/conversations'),
  },
  storeNotice: {
    ...routesFactory('/store-notices'),
  },
  storeNoticeRead: {
    ...routesFactory('/store-notices/read'),
  },
  notifyLogs: {
    ...routesFactory('/notify-logs'),
  },
  faqs: {
    ...routesFactory('/faqs'),
  },
  refundPolicies: {
    ...routesFactory('/refund-policies'),
  },
  refundReasons: {
    ...routesFactory('/refund-reasons'),
  },
  newShops: '/new-shops',
  draftProducts: '/products/draft',
  outOfStockOrLowProducts: '/products/product-stock',
  productInventory: '/products/inventory',
  priceUpdates: {
    ...routesFactory('/price-updates'),
  },
  transaction: '/orders/transaction',
  termsAndCondition: {
    ...routesFactory('/terms-and-conditions'),
  },
  adminList: '/users/admins',
  vendorList: '/users/vendors',
  pendingVendorList: '/uمsers/vendors/pending',
  customerList: '/users/customer',
  myStaffs: '/users/my-staffs',
  vendorStaffs: '/users/vendor-staffs',
  flashSale: {
    ...routesFactory('/flash-sale'),
  },
  ownerDashboardNotice: '/notice',
  ownerDashboardMessage: '/owner-message',
  ownerDashboardMyShop: '/my-shop',
  myProductsInFlashSale: '/flash-sale/my-products',
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
  vendorRequestForFlashSale: {
    ...routesFactory('/flash-sale/vendor-request'),
  },
  becomeSeller: '/become-seller',
  ownershipTransferRequest: {
    ...routesFactory('/shop-transfer'),
  },
  ownerDashboardShopTransferRequest: '/shop-transfer/vendor',
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
