import { ProductType, CategoryProductCount } from '@/types';

// Mock data for dashboard widgets when server is not available

export const mockTopRatedProducts = [
  {
    id: "1",
    translated_languages: ["en"],
    shop_id: "1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    type: {
      id: "1",
      name: "Electronics",
      icon: "electronics",
      slug: "electronics",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      translated_languages: ["en"]
    },
    product_type: ProductType.Simple,
    categories: [],
    image: {
      thumbnail: "/images/products/headphones.svg",
      original: "/images/products/headphones.svg"
    },
    price: 299.99,
    max_price: 399.99,
    min_price: 199.99,
    sale_price: 249.99,
    description: "High-quality wireless headphones with noise cancellation",
    ratings: 4.5,
    in_stock: true,
    is_taxable: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    orders: [],
    in_flash_sale: false
  },
  {
    id: "2",
    translated_languages: ["en"],
    shop_id: "1",
    name: "Smart Watch Pro",
    slug: "smart-watch-pro",
    type: {
      id: "1",
      name: "Electronics",
      icon: "electronics",
      slug: "electronics",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      translated_languages: ["en"]
    },
    product_type: ProductType.Simple,
    categories: [],
    image: {
      thumbnail: "/images/products/smartwatch.svg",
      original: "/images/products/smartwatch.svg"
    },
    price: 399.99,
    max_price: 499.99,
    min_price: 299.99,
    sale_price: 349.99,
    description: "Advanced smartwatch with health monitoring",
    ratings: 4.8,
    in_stock: true,
    is_taxable: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    orders: [],
    in_flash_sale: false
  },
  {
    id: "3",
    translated_languages: ["en"],
    shop_id: "1",
    name: "Organic Coffee Beans",
    slug: "organic-coffee-beans",
    type: {
      id: "2",
      name: "Food",
      icon: "food",
      slug: "food",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      translated_languages: ["en"]
    },
    product_type: ProductType.Simple,
    categories: [],
    image: {
      thumbnail: "/images/products/coffee.svg",
      original: "/images/products/coffee.svg"
    },
    price: 24.99,
    max_price: 29.99,
    min_price: 19.99,
    sale_price: 22.99,
    description: "Premium organic coffee beans from Colombia",
    ratings: 4.6,
    in_stock: true,
    is_taxable: true,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    orders: [],
    in_flash_sale: false
  }
];

export const mockProductCountByCategory: CategoryProductCount[] = [
  {
    category_id: 1,
    category_name: "Electronics",
    shop_name: "Tech Store",
    product_count: 156
  },
  {
    category_id: 2,
    category_name: "Clothing",
    shop_name: "Fashion Hub",
    product_count: 234
  },
  {
    category_id: 3,
    category_name: "Food & Beverages",
    shop_name: "Gourmet Market",
    product_count: 89
  },
  {
    category_id: 4,
    category_name: "Books",
    shop_name: "Book World",
    product_count: 412
  },
  {
    category_id: 5,
    category_name: "Home & Garden",
    shop_name: "Home Essentials",
    product_count: 178
  }
];

export const mockDashboardStats = {
  totalRevenue: 123456.78,
  todaysRevenue: 2345.67,
  totalOrders: 1567,
  totalVendors: 89,
  totalShops: 45,
  totalRefunds: 1234.56,
  todayTotalOrderByStatus: [
    { status: 'pending', count: 12, total: 1299.99 },
    { status: 'processing', count: 8, total: 2345.67 },
    { status: 'completed', count: 45, total: 8901.23 },
    { status: 'cancelled', count: 3, total: 156.78 }
  ],
  weeklyTotalOrderByStatus: [
    { status: 'pending', count: 67, total: 7890.45 },
    { status: 'processing', count: 45, total: 12345.67 },
    { status: 'completed', count: 234, total: 45678.90 },
    { status: 'cancelled', count: 12, total: 890.12 }
  ],
  monthlyTotalOrderByStatus: [
    { status: 'pending', count: 234, total: 23456.78 },
    { status: 'processing', count: 156, total: 34567.89 },
    { status: 'completed', count: 789, total: 123456.78 },
    { status: 'cancelled', count: 45, total: 3456.78 }
  ],
  yearlyTotalOrderByStatus: [
    { status: 'pending', count: 1234, total: 123456.78 },
    { status: 'processing', count: 890, total: 234567.89 },
    { status: 'completed', count: 3456, total: 567890.12 },
    { status: 'cancelled', count: 234, total: 12345.67 }
  ],
  totalYearSaleByMonth: [
    { month: 'Jan', total: 45678.90 },
    { month: 'Feb', total: 52345.67 },
    { month: 'Mar', total: 61234.56 },
    { month: 'Apr', total: 58901.23 },
    { month: 'May', total: 67890.12 },
    { month: 'Jun', total: 72345.67 },
    { month: 'Jul', total: 69890.34 },
    { month: 'Aug', total: 71234.89 },
    { month: 'Sep', total: 65678.90 },
    { month: 'Oct', total: 69012.34 },
    { month: 'Nov', total: 73456.78 },
    { month: 'Dec', total: 78901.23 }
  ]
};

export const mockSettings = {
  id: '1',
  options: {
    siteTitle: 'XRT Restaurant System',
    isUnderMaintenance: false,
    maintenance: {
      start: null,
      until: null
    },
    pushNotification: {
      all: {
        order: true,
        message: true,
        storeNotice: false
      }
    },
    orders: {
      accept_orders: true,
      allowScheduleOrder: false,
      maxDays: 7,
      deliveredOrderTime: 120
    },
    heroSlides: [] as Array<{ bgImage?: any; title?: string; subtitle?: string; btnText?: string; btnLink?: string }>
  },
  language: 'en',
  translated_languages: ['en']
};

export const mockShop = {
  settings: {
    isShopUnderMaintenance: false,
    shopMaintenance: {
      start: null,
      until: null
    }
  }
};
