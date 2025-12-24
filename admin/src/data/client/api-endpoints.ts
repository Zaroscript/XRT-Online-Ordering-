export const API_ENDPOINTS = {
  // Authentication endpoints
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  REFRESH_TOKEN: 'auth/refresh-token',
  FORGET_PASSWORD: 'auth/forgot-password',
  RESET_PASSWORD: 'auth/reset-password',
  CHANGE_PASSWORD: 'auth/update-password',

  // User management endpoints
  USERS: 'auth/users',
  USER_APPROVE: 'auth/users/:id/approve',
  USER_BAN: 'auth/users/:id/ban',
  USER_DELETE: 'auth/users/:id',
  USER_PERMISSIONS: 'auth/users/:id/permissions',
  ALL_PERMISSIONS: 'auth/permissions',
  ROLES: 'roles',

  // Business endpoints
  BUSINESSES: 'businesses',
  BUSINESS_CREATE: 'businesses',
  BUSINESS_UPDATE: 'businesses/:id',
  BUSINESS_DELETE: 'businesses/:id',
  BUSINESS_ACTIVATE: 'businesses/:id/activate',
  BUSINESS_DEACTIVATE: 'businesses/:id/deactivate',
  BUSINESS_BY_OWNER: 'businesses/owner/:ownerId',
  BUSINESS_UPDATE_OWNER: 'businesses/:id/owner',

  // Location endpoints
  LOCATIONS: 'locations',
  LOCATION_CREATE: 'locations',
  LOCATION_UPDATE: 'locations/:id',
  LOCATION_DELETE: 'locations/:id',
  LOCATION_ACTIVATE: 'locations/:id/activate',
  LOCATION_DEACTIVATE: 'locations/:id/deactivate',
  LOCATION_NEARBY: 'locations/nearby',
  LOCATIONS_BY_BUSINESS: 'locations/business/:businessId',

  // Customer endpoints
  CUSTOMERS: 'customers',
  CUSTOMER_CREATE: 'customers',
  CUSTOMER_UPDATE: 'customers/:id',
  CUSTOMER_DELETE: 'customers/:id',
  CUSTOMER_IMPORT: 'customers/import',
  CUSTOMER_EXPORT: 'customers/export',

  // Legacy endpoints
  SETTINGS: 'settings',
  PROFILE_UPDATE: 'profile-update',

  // Additional endpoints for compatibility (may not exist in customize_server yet)
  VERIFY_FORGET_PASSWORD_TOKEN: 'auth/verify-reset-token',
  SEND_VERIFICATION_EMAIL: 'auth/send-verification-email',
  UPDATE_EMAIL: 'auth/update-email',
  ADD_WALLET_POINTS: 'auth/add-wallet-points',
  ADD_LICENSE_KEY_VERIFY: 'auth/verify-license',

  // User management endpoints (legacy - using USERS endpoint with role filters)
  STAFFS: 'auth/users',
  ADMIN_LIST: 'auth/users',
  VENDORS_LIST: 'auth/users',
  MY_STAFFS: 'auth/users',
  ALL_STAFFS: 'auth/users',

  // Placeholder endpoints
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  ATTRIBUTES: 'attributes',
  TYPES: 'types',
  ANALYTICS: 'analytics',

  // Product endpoints
  POPULAR_PRODUCTS: 'products/popular',
  LOW_STOCK_PRODUCTS_ANALYTICS: 'products/low-stock',
  CATEGORY_WISE_PRODUCTS: 'products/category-wise',
  CATEGORY_WISE_PRODUCTS_SALE: 'products/category-wise-sale',
  TOP_RATED_PRODUCTS: 'products/top-rated',

  // Withdraw endpoints
  WITHDRAWS: 'withdraws',
  APPROVE_WITHDRAW: 'withdraws/:id/approve',

  // Additional placeholder endpoints
  AUTHORS: 'authors',
  SHOPS: 'shops',
  TAGS: 'tags',
  COUPONS: 'coupons',
  TAX: 'tax',
  SHIPPING: 'shipping',
  MANUFACTURERS: 'manufacturers',
  GROUPS: 'groups',
  QUESTIONS: 'questions',
  REVIEWS: 'reviews',
  FLASH_SALE: 'flash-sale',
  REFUNDS: 'refunds',
  ORDER_STATUS: 'order-status',
  TERMS_AND_CONDITIONS: 'terms-and-conditions',
  FAQS: 'faqs',
  STORE_NOTICES: 'store-notices',
  BECAME_SELLER: 'become-seller',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  NOTIFY_LOGS: 'notify-logs',
  ORDER_RECEIVED: 'order-received',
  ORDER_CREATE: 'orders',
  ORDER_PAYMENT: 'orders/payment',
  DOWNLOADS: 'downloads',
  GENERATE_DESCRIPTION: 'generate-description',
  ATTRIBUTE_VALUES: 'attribute-values',
  UPLOAD: 'upload',
  CREATE_ORDER: 'orders',
  VERIFY_CHECKOUT: 'verify-checkout',
  CREATE_CHECKOUT: 'create-checkout',
  CHECKOUT: 'checkout',
  NEW_ORDERS: 'orders/new',
  PAYMENTS: 'payments',
  ATTACHMENTS: 'attachments',
  CONVERSIONS: 'conversations', // typo in codebase
  MESSAGE: 'messages', // typo in codebase - should be MESSAGES
};
