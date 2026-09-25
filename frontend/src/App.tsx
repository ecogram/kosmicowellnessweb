import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import React, { useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RealtimeProvider } from './components/layout/RealtimeProvider';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';

// Helper to automatically recover from Vite dynamic import chunk mismatch when a new version is deployed
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err: any) {
      const isChunkError =
        err?.message?.includes('Failed to fetch dynamically imported module') ||
        err?.message?.includes('Importing a module script failed') ||
        err?.name === 'ChunkLoadError';

      if (isChunkError) {
        const reloadKey = 'chunk_reload_' + window.location.pathname;
        const lastReload = sessionStorage.getItem(reloadKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
          sessionStorage.setItem(reloadKey, now.toString());
          const url = new URL(window.location.href);
          url.searchParams.set('_v', now.toString());
          window.location.replace(url.toString());
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
}

// Lazy-loaded pages for faster initial load & optimized code-splitting
const Home = lazyWithRetry(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazyWithRetry(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazyWithRetry(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Login = lazyWithRetry(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazyWithRetry(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Profile = lazyWithRetry(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Cart = lazyWithRetry(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazyWithRetry(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazyWithRetry(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const Orders = lazyWithRetry(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const OrderDetails = lazyWithRetry(() => import('./pages/OrderDetails').then(m => ({ default: m.OrderDetails })));
const Wishlist = lazyWithRetry(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Coupons = lazyWithRetry(() => import('./pages/Coupons').then(m => ({ default: m.Coupons })));
const Notifications = lazyWithRetry(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const CarePage = lazyWithRetry(() => import('./pages/CarePage').then(m => ({ default: m.CarePage })));
const AiConsultantPage = lazyWithRetry(() => import('./pages/AiConsultantPage').then(m => ({ default: m.AiConsultantPage })));
const About = lazyWithRetry(() => import('./pages/About').then(m => ({ default: m.About })));
const BenefitsPage = lazyWithRetry(() => import('./pages/BenefitsPage').then(m => ({ default: m.BenefitsPage })));
const IngredientsPage = lazyWithRetry(() => import('./pages/IngredientsPage').then(m => ({ default: m.IngredientsPage })));
const HowItWorksPage = lazyWithRetry(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const FaqPage = lazyWithRetry(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const Contact = lazyWithRetry(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazyWithRetry(() => import('./pages/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ReturnsRefunds = lazyWithRetry(() => import('./pages/ReturnsRefunds').then(m => ({ default: m.ReturnsRefunds })));

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

// AuthInit preserves persistent login state and keeps profile in live sync with mobile app
const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, setAuth, updateUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res?.data?.data) {
          const user = res.data.data.user || res.data.data;
          if (user && (user.name || user.email || user._id || user.id)) {
            updateUser(user);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          useAuthStore.getState().logout();
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch on mount
    fetchFreshProfile();

    // Re-sync immediately when user switches back from mobile app to website tab
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchFreshProfile();
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // Continuous background sync (every 12 seconds) while logged in
    const syncInterval = setInterval(fetchFreshProfile, 12000);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      clearInterval(syncInterval);
    };
  }, [accessToken, setAuth, updateUser, setLoading]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <AuthInit>
            <RealtimeProvider>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public/Customer Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/products" element={<Shop />} />
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
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/terms-and-conditions" element={<TermsOfService />} />
                    <Route path="/refunds" element={<RefundPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/return-policy" element={<RefundPolicy />} />

                    {/* Protected User Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:orderNumber" element={<OrderDetails />} />
                      <Route path="/returns-refunds" element={<ReturnsRefunds />} />
                      <Route path="/returns" element={<ReturnsRefunds />} />
                      <Route path="/my-refunds" element={<ReturnsRefunds />} />
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
