import { Container } from '../components/ui/Container';
import { Mail, Phone, Clock, AlertCircle, CheckCircle2, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RefundPolicy() {
  return (
    <div className="py-14 md:py-20 bg-background text-neutral-900">
      <Container className="max-w-4xl mx-auto space-y-10">

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Transparency & Trust</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-neutral-900 tracking-tight">
            Refund & Return Policy
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm">
            Last Updated: September 4, 2026
          </p>
        </div>

        {/* Introduction Banner */}
        <div className="p-6 md:p-8 bg-[#f5faf6] border border-emerald-200/80 rounded-3xl space-y-3 shadow-xs">
          <h2 className="text-lg md:text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
            Customer Satisfaction at Kosmico Wellness
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            At <strong>Kosmico Wellness</strong>, customer satisfaction is our top priority. Please read our refund and return policy carefully before making a purchase.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8 text-neutral-800 leading-relaxed">

          {/* 1. Return Eligibility */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Return Eligibility</h3>
            </div>
            
            <p className="text-sm text-neutral-700">
              Since our products (including <strong>Sweet Monk</strong>) are consumable food and wellness items, we accept returns only under the following strict conditions:
            </p>

            <ul className="space-y-2.5 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>The product received is <strong>damaged, defective, or incorrect</strong> at the time of delivery.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>The <strong>seal/packaging is tampered or broken</strong> upon arrival.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>You must raise a return or replacement request within <strong>48 hours</strong> of delivery, along with an unboxing video or clear photos as proof.</span>
              </li>
            </ul>

            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Hygiene Notice:</strong> Due to hygiene and food safety regulations, we <strong>do not accept returns</strong> for products that have been opened, consumed, or where the request is based solely on personal preference or taste.
              </span>
            </div>
          </section>

          {/* 2. Refund Process */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Refund Process</h3>
            </div>

            <ul className="space-y-3 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>Once your return request is inspected and approved, refunds will be initiated within <strong>5–7 business days</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>The refund amount will be credited directly to your <strong>original payment method</strong> (UPI, Credit/Debit Card, Net Banking, etc.).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>For <strong>Cash on Delivery (COD)</strong> orders, refunds will be processed via bank transfer (NEFT/IMPS) or verified UPI ID after we receive your valid account details.</span>
              </li>
            </ul>
          </section>

          {/* 3. Order Cancellation */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Order Cancellation</h3>
            </div>

            <ul className="space-y-3 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>Orders can be cancelled <strong>before they are shipped</strong> by contacting our customer support team directly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>Once an order has been dispatched from our warehouse, it cannot be cancelled. However, you may request a return upon delivery strictly adhering to the return eligibility criteria listed above.</span>
              </li>
            </ul>
          </section>

          {/* 4. Non-Returnable Items */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Non-Returnable Items</h3>
            </div>

            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                <span>Products purchased during special promotional sale or clearance discount events.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                <span>Opened, unsealed, or partially used product packaging.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                <span>Requests raised after the 48-hour delivery window.</span>
              </li>
            </ul>
          </section>

          {/* 5. How to Request a Refund / Return */}
          <section className="bg-gradient-to-br from-[#0a7a40]/5 via-emerald-50/60 to-transparent p-6 md:p-8 rounded-3xl border border-emerald-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">How to Request a Refund / Return</h3>
            </div>

            <p className="text-sm text-neutral-700">
              To initiate a return or refund request, please reach out to our dedicated support team with your <strong>Order ID</strong>, <strong>reason for return</strong>, and <strong>clear unboxing photos or video proof</strong>:
            </p>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <a
                href="mailto:support@kosmicowellness.com?subject=Refund%20/%20Return%20Request"
                className="p-4 bg-white rounded-2xl border border-emerald-200/80 hover:border-emerald-800 shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Email Support</span>
                  <span className="text-xs font-bold text-emerald-900 break-all">support@kosmicowellness.com</span>
                </div>
              </a>

              <a
                href="https://wa.me/919793170555?text=Hello%20Kosmico%20Wellness%2C%20I%20would%20like%20to%20raise%20a%20return%20/%20refund%20request."
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white rounded-2xl border border-emerald-200/80 hover:border-emerald-800 shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Phone & WhatsApp</span>
                  <span className="text-xs font-bold text-emerald-900">+91 97931 70555</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Our support team is available <strong>Mon – Sat, 11:00 AM – 7:00 PM</strong> and responds within 24–48 hours.</span>
            </div>
          </section>

          {/* 6. Policy Changes */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Policy Changes</h3>
            </div>

            <p className="text-sm text-neutral-700">
              Kosmico Wellness reserves the right to update, change, or modify this policy at any time without prior notice. Any changes will be posted on this page with an updated revision date. Please review this page periodically for updates.
            </p>
          </section>

        </div>

        {/* Footer Navigation Back Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} KOSMICO WELLNESS PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-emerald-800 font-bold hover:underline flex items-center gap-1">
              <span>Need help? Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </Container>
    </div>
  );
}
