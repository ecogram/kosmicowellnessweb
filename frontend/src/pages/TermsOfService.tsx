import { Container } from '../components/ui/Container';
import { Mail, Phone, MapPin, FileText, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <div className="py-14 md:py-20 bg-background text-neutral-900">
      <Container className="max-w-4xl mx-auto space-y-10">

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-neutral-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm">
            Last Updated: September 4, 2026
          </p>
        </div>

        {/* Introduction Banner */}
        <div className="p-6 md:p-8 bg-[#f5faf6] border border-emerald-200/80 rounded-3xl space-y-3 shadow-xs">
          <h2 className="text-lg md:text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
            Welcome to Kosmico Wellness
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your use of our website{' '}
            <strong className="text-emerald-900 font-semibold">kosmicowellness.com</strong> and any purchases made
            through it. By accessing or using our website, you agree to be bound by these Terms. If you do not agree,
            please do not use our website.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8 text-neutral-800 leading-relaxed">

          {/* 1. General */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">General</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>These Terms apply to all visitors, users, and customers of Kosmico Wellness Private Limited.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  We reserve the right to update, change, or replace any part of these Terms by posting updates on this
                  page. Continued use of the website following any changes constitutes acceptance of the new Terms.
                </span>
              </li>
            </ul>
          </section>

          {/* 2. Eligibility */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Eligibility</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  By using this website, you confirm that you are at least 18 years of age or are accessing the site under
                  the supervision of a parent or legal guardian.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  You agree to provide accurate, current, and complete information when creating an account or placing an
                  order.
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Products & Pricing */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Products &amp; Pricing</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>All product descriptions, images, formulations, and pricing are subject to change without prior notice.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  We make every effort to display accurate product details and imagery; however, we do not warrant that product descriptions or other content are entirely error-free.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>All prices are listed in Indian Rupees (₹ INR) and include applicable GST/taxes as indicated at checkout.</span>
              </li>
            </ul>
          </section>

          {/* 4. Orders & Payments */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Orders &amp; Payments</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  By placing an order, you agree to pay the full amount listed at checkout, including applicable delivery fees and taxes.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  We reserve the right to refuse or cancel any order for reasons including but not limited to: product unavailability, errors in pricing or descriptions, or suspected fraudulent activity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  Accepted payment methods include <strong>UPI (Google Pay, PhonePe, Paytm, etc.)</strong>, <strong>Credit/Debit Cards</strong>, <strong>Net Banking</strong>, and <strong>Cash on Delivery (COD)</strong> where serviceable.
                </span>
              </li>
            </ul>
          </section>

          {/* 5. Shipping & Delivery */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Shipping &amp; Delivery</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>Estimated delivery timelines are provided during checkout and confirmed via SMS/WhatsApp notifications with live tracking links.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  Kosmico Wellness is not liable for delivery delays caused by third-party courier partners, state border clearances, severe weather, or circumstances beyond our reasonable control.
                </span>
              </li>
            </ul>
          </section>

          {/* 6. Returns & Refunds */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Returns &amp; Refunds</h3>
            </div>
            <p className="text-sm text-neutral-700">
              All product returns, replacements, and refund requests are governed strictly by our{' '}
              <Link to="/refunds" className="text-emerald-800 font-bold hover:underline">
                Refund &amp; Return Policy
              </Link>
              . Consumable items like Sweet Monk require unboxing proof within 48 hours of delivery if damaged or tampered.
            </p>
          </section>

          {/* 7. Intellectual Property */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Intellectual Property</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  All content on this website — including text, formulations, branding, graphics, logos, images, UI design, and software — is the exclusive property of Kosmico Wellness Private Limited and protected under Indian and international copyright and trademark laws.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>You may not reproduce, distribute, modify, scrape, or commercially exploit any content without our express prior written permission.</span>
              </li>
            </ul>
          </section>

          {/* 8. User Conduct */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">User Conduct</h3>
            </div>
            <p className="text-sm text-neutral-700 mb-2">You agree not to:</p>
            <ul className="space-y-2 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <span>Use the website or its services for any unlawful, misleading, or unauthorized purpose.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <span>Attempt to breach, disable, or interfere with security features or unauthorized access to our servers or databases.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <span>Submit fraudulent reviews, falsified personal identity, or abusive communications to customer support.</span>
              </li>
            </ul>
          </section>

          {/* 9. Limitation of Liability */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                9
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Limitation of Liability</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-neutral-700 pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 mt-2 shrink-0" />
                <span>
                  Kosmico Wellness shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products or website.
                </span>
              </li>
            </ul>
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Health &amp; Wellness Notice:</strong> Our products are intended to support general well-being and are not intended to diagnose, treat, cure, or prevent any medical condition. Please consult a qualified healthcare professional before beginning any new wellness or dietary routine if you have pre-existing health conditions or are pregnant/nursing.
              </span>
            </div>
          </section>

          {/* 10. Third-Party Links */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                10
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Third-Party Links</h3>
            </div>
            <p className="text-sm text-neutral-700">
              Our website may contain links to third-party services or payment gateways. We do not endorse or assume responsibility for the content, privacy policies, or terms of any third-party websites or services.
            </p>
          </section>

          {/* 11. Governing Law & Jurisdiction */}
          <section className="bg-surface p-6 md:p-8 rounded-3xl border border-border shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                11
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Governing Law &amp; Jurisdiction</h3>
            </div>
            <p className="text-sm text-neutral-700">
              These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising under or related to these Terms or your use of the website shall be subject to the exclusive jurisdiction of the competent courts in <strong>Greater Noida / Gautam Buddha Nagar, Uttar Pradesh, India</strong>.
            </p>
          </section>

          {/* 12. Contact Us */}
          <section className="bg-gradient-to-br from-[#0a7a40]/5 via-emerald-50/60 to-transparent p-6 md:p-8 rounded-3xl border border-emerald-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                12
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">Contact Us</h3>
            </div>
            <p className="text-sm text-neutral-700">
              For any questions or clarifications regarding these Terms of Service, please reach out to us:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="mailto:support@kosmicowellness.com?subject=Inquiry%20regarding%20Terms%20of%20Service"
                className="p-4 bg-white rounded-2xl border border-emerald-200/80 hover:border-emerald-800 shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Email</span>
                  <span className="text-xs font-bold text-emerald-900 break-all">support@kosmicowellness.com</span>
                </div>
              </a>

              <a
                href="tel:+919793170555"
                className="p-4 bg-white rounded-2xl border border-emerald-200/80 hover:border-emerald-800 shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Phone / WhatsApp</span>
                  <span className="text-xs font-bold text-emerald-900">+91 97931 70555</span>
                </div>
              </a>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 flex items-start gap-3 text-xs text-neutral-700">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <span>
                <strong>Kosmico Wellness Private Limited:</strong> 423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), Uttar Pradesh - 201306, India
              </span>
            </div>
          </section>

        </div>

        {/* Footer Navigation Back Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} KOSMICO WELLNESS PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-emerald-800 font-bold hover:underline">
              Privacy Policy
            </Link>
            <Link to="/refunds" className="text-emerald-800 font-bold hover:underline flex items-center gap-1">
              <span>Refund Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </Container>
    </div>
  );
}
