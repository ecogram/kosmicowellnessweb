import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import React, { useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { RealtimeProvider } from './components/layout/RealtimeProvider';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';

// Lazy-loaded pages for faster initial load & optimized code-splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetails = lazy(() => import('./pages/OrderDetails').then(m => ({ default: m.OrderDetails })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Coupons = lazy(() => import('./pages/Coupons').then(m => ({ default: m.Coupons })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const CarePage = lazy(() => import('./pages/CarePage').then(m => ({ default: m.CarePage })));
const AiConsultantPage = lazy(() => import('./pages/AiConsultantPage').then(m => ({ default: m.AiConsultantPage })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const BenefitsPage = lazy(() => import('./pages/BenefitsPage').then(m => ({ default: m.BenefitsPage })));
const IngredientsPage = lazy(() => import('./pages/IngredientsPage').then(m => ({ default: m.IngredientsPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));

// Global Loading Fallback
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-3 border-emerald-200 border-t-[#0a7a40] rounded-full animate-spin"></div>
    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Loading...</span>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AuthInit preserves persistent login state
const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/profile');
        if (response.data?.data) {
          const user = response.data.data.user || response.data.data;
          setAuth(user, accessToken);
        }
      } catch (error) {
        // Keep persisted state intact even if profile check fails temporarily
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [accessToken, setAuth, setLoading]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthInit>
            <RealtimeProvider>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Admin Routes with distinct Layout */}
                  <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/coupons" element={<AdminCoupons />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/reviews" element={<AdminReviews />} />
                    </Route>
                  </Route>

                  {/* Public/Customer Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/care" element={<CarePage />} />
                    <Route path="/ai-consultant" element={<AiConsultantPage />} />
                    <Route path="/products/:slug" element={<ProductDetails />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Marketing & Info Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/benefits" element={<BenefitsPage />} />
                    <Route path="/ingredients" element={<IngredientsPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<PrivacyPolicy />} />
                    <Route path="/refunds" element={<PrivacyPolicy />} />

                    {/* Protected User Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:orderNumber" element={<OrderDetails />} />
                      <Route path="/notifications" element={<Notifications />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </RealtimeProvider>
          </AuthInit>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
