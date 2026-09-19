export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
};

export type Product = {
  id: string;
  sellerId?: string;
  categoryId?: string;
  name: string;
  description: string[];
  images: string[];
  pricePerDay: number;
  pricePerWeek?: number;
  securityDeposit: number;
  totalStock: number;
  availableStock: number;
  location: string;
  condition: string;
  specifications: Record<string, string>;
  status?: string;
  category: Category;
  seller: { id?: string; shopName: string; city: string; description?: string; user?: { name: string; email: string } };
  createdAt: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  startDate: string;
  endDate: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  gender?: string;
  dateOfBirth?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  marketingConsent: boolean;
  seller?: { id: string; shopName: string; city: string; status: string };
  createdAt?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  securityDeposit: number;
  product?: { images?: string; category?: { name: string } };
};

export type TrackingEvent = {
  id: string;
  orderId: string;
  status: string;
  description: string;
  timestamp: string;
};

export type Payment = {
  id: string;
  transactionId: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  customer?: { name: string; email: string };
  order?: { trackingCode?: string; totalAmount: number; status: string };
};

export type Order = {
  id: string;
  customerId: string;
  sellerId: string;
  rentalAmount: number;
  securityDeposit: number;
  commissionAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: { id?: string; name: string; email: string; phone?: string; city?: string };
  seller?: { id?: string; shopName: string; city: string; description?: string };
  payment?: Payment | null;
  trackingEvents?: TrackingEvent[];
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId?: string | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  segment: string;
  template: string;
  sentCount: number;
  status: string;
  createdAt: string;
};

export type AnalyticsOverview = {
  revenueOverTime: { month: string; revenue: number; orders: number; commission: number }[];
  categoryPerformance: { name: string; revenue: number; rentals: number; productCount: number }[];
  geographicData: { city: string; rentals: number; revenue: number }[];
  demographics: {
    gender: { name: string; value: number }[];
    age: { name: string; value: number }[];
  };
  websiteAnalytics: {
    footfall: { visits: number; uniqueVisitors: number; bounceRate: number; averageSessionMinutes: number };
    ageGroups: { name: string; value: number }[];
    locations: { city: string; rentals: number; revenue: number }[];
    gender: { name: string; value: number }[];
    income: { name: string; value: number }[];
    devices: { name: string; value: number }[];
    seo: { organicVisits: number; indexedPages: number; keywordVisibility: number; conversionRate: number };
  };
  orderStatusBreakdown: { status: string; count: number }[];
  topProducts: { id: string; name: string; rentals: number; revenue: number; image: string }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    activeProducts: number;
    avgOrderValue: number;
  };
};
