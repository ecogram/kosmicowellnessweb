import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Wishlist } from './pages/Wishlist';
import { Notifications } from './pages/Notifications';
import { About } from './pages/About';
import { BenefitsPage } from './pages/BenefitsPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FaqPage } from './pages/FaqPage';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { RealtimeProvider } from './components/layout/RealtimeProvider';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// We need an AuthInit component to check if the user is logged in on mount
const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setAuth(response.data.data.user, api.defaults.headers.common['Authorization']?.toString().replace('Bearer ', '') || '');
      } catch (error) {
        logout(); // Not logged in
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [setAuth, logout, setLoading]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthInit>
            <RealtimeProvider>
              <Routes>
                {/* Admin Routes with distinct Layout */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/reviews" element={<AdminReviews />} />
                  </Route>
                </Route>

                {/* Public/Customer Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
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
                  <Route path="*" element={<Navigate to="/" replace />} />

                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:orderNumber" element={<OrderDetails />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                </Route>
              </Routes>
            </RealtimeProvider>
          </AuthInit>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
