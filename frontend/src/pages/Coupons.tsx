import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Ticket, Copy, Check, ArrowRight, Gift, Tag } from 'lucide-react';
import { useCoupons } from '../hooks/useCoupons';

export function Coupons() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { data: dbCoupons, isLoading } = useCoupons();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const activeCoupons = (dbCoupons || []).filter((c) => c.isActive !== false);

  return (
    <div className="bg-background min-h-screen py-10 md:py-16 font-sans">
      <Container className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
              <Gift className="w-3.5 h-3.5" />
              <span>Verified Offers &amp; Promo Codes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Exclusive Discounts &amp; Coupons
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Apply valid coupon codes during checkout to enjoy instant savings on 100% natural, erythritol-free Kosmico Sweet Monk.
            </p>
          </div>
        </div>

        {/* Coupons List / Empty State */}
        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-200 border-t-[#0a7a40] rounded-full animate-spin"></div>
          </div>
        ) : activeCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeCoupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.code}
                  className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Decorative border notch */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#0a7a40]">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {coupon.discountType === 'percentage' ? 'Percentage Savings' : 'Flat Discount'}
                      </span>
                    </div>

                    <h3 className="text-xl font-sans font-bold text-neutral-900 tracking-tight">
                      {coupon.discountType === 'percentage' ? (
                        <span>{coupon.discountValue}% Instant Discount</span>
                      ) : (
                        <span>Flat <span className="font-sans">₹</span>{coupon.discountValue} OFF</span>
                      )}
                    </h3>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {coupon.description || 'Applicable across all items in your cart.'}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-[11px] text-neutral-500 font-medium">
                      <span className="bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                        Min Order ₹{coupon.minOrderAmount || 0}
                      </span>
                      <span>•</span>
                      <span>
                        {coupon.expiresAt 
                          ? `Valid till ${new Date(coupon.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : 'Valid till 31 Dec 2026'}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code Action Box */}
                  <div className="mt-6 pt-4 border-t border-dashed border-neutral-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-[#eefbf3] border border-emerald-300 rounded-xl px-3.5 py-2">
                      <Ticket className="w-4 h-4 text-[#0a7a40]" />
                      <span className="font-mono font-black text-sm tracking-wider text-[#0a7a40]">
                        {coupon.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                          isCopied
                            ? 'bg-[#0a7a40] text-white'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>

                      <Link
                        to="/shop"
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        title="Go to Shop"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8 opacity-70" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-serif font-bold text-xl text-neutral-900">No Active Coupons Available</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                There are no public promotional vouchers available right now. As soon as new discount offers are launched, they will appear here automatically.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* How to Use Section */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-neutral-900">
            How to Redeem Your Coupon Code
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-neutral-600">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#0a7a40] text-white flex items-center justify-center font-bold text-xs mb-2">1</span>
              <p className="font-bold text-neutral-900">Copy Code</p>
              <p className="text-neutral-500">Tap the 'Copy Code' button on any active coupon card above.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#0a7a40] text-white flex items-center justify-center font-bold text-xs mb-2">2</span>
              <p className="font-bold text-neutral-900">Shop Products</p>
              <p className="text-neutral-500">Add your favorite Sweet Monk liquid drops or combos to the cart.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="w-6 h-6 rounded-full bg-[#0a7a40] text-white flex items-center justify-center font-bold text-xs mb-2">3</span>
              <p className="font-bold text-neutral-900">Apply at Checkout</p>
              <p className="text-neutral-500">Paste code in the "Apply Coupon" popup to get instant savings.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
