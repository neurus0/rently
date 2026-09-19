import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Customer Pages
import { Home, Categories, HowItWorks, SellerCTA } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Orders } from './pages/Orders';
import { Login, Signup, Account } from './pages/Auth';
import { TrackingPage } from './pages/TrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Seller Portal Pages
import { SellerLayout } from './pages/seller/SellerLayout';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProducts } from './pages/seller/SellerProducts';
import { SellerOrders } from './pages/seller/SellerOrders';
import { SellerInventory } from './pages/seller/SellerInventory';
import { SellerRegistration } from './pages/seller/SellerRegistration';

// Admin Portal Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';

// Shared Analytics & Marketing
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { MarketingCampaigns } from './pages/marketing/MarketingCampaigns';

const Missing = () => (
  <main className="container empty page">
    <h1>Page Not Found</h1>
    <p className="lead">The page you are looking for does not exist.</p>
  </main>
);

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public & Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/become-a-seller" element={<SellerCTA />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/tracking/:code" element={<TrackingPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />

        {/* Seller Portal */}
        <Route path="/seller/register" element={<SellerRegistration />} />
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="marketing" element={<MarketingCampaigns />} />
        </Route>

        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </>
  );
}
