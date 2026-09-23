import { Container } from '../components/ui/Container';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <Container className="py-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-primary mb-2 text-center">
        Terms of Service
      </h1>

      <p className="text-text-muted text-center mb-16 text-sm">
        Last Updated: September 4, 2026
      </p>

      <div className="space-y-12 text-text-main leading-relaxed">
        <section>
          <p className="mb-4">
            Welcome to Kosmico Wellness. These Terms of Service (&quot;Terms&quot;) govern your use of our website{' '}
            <strong>kosmicowellness.com</strong> and any purchases made through it. By accessing or using our website,
            you agree to be bound by these Terms. If you do not agree, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            1. General
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>These Terms apply to all visitors, users, and customers of Kosmico Wellness.</li>
            <li>We reserve the right to update, change, or replace any part of these Terms by posting updates on this page. Continued use of the website after changes constitutes acceptance of the new Terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            2. Eligibility
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>By using this website, you confirm that you are at least 18 years of age or are accessing the site under the supervision of a parent/legal guardian.</li>
            <li>You agree to provide accurate, current, and complete information when creating an account or placing an order.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            3. Products &amp; Pricing
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>All product descriptions, images, and pricing are subject to change without prior notice.</li>
            <li>We make every effort to display accurate product information; however, we do not warrant that product descriptions or other content is error-free.</li>
            <li>Prices are listed in INR (₹) and are inclusive/exclusive of applicable taxes as mentioned at checkout.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            4. Orders &amp; Payments
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>By placing an order, you agree to pay the full amount listed at checkout, including applicable shipping charges and taxes.</li>
            <li>We reserve the right to refuse or cancel any order for reasons including but not limited to: product unavailability, errors in pricing/product information, or suspected fraudulent activity.</li>
            <li>Accepted payment methods include UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (COD) as displayed at checkout.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            5. Shipping &amp; Delivery
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Estimated delivery timelines will be provided at checkout or via order confirmation email/SMS.</li>
            <li>Kosmico Wellness is not responsible for delays caused by third-party courier/logistics partners, natural events, or circumstances beyond our control.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            6. Returns &amp; Refunds
          </h2>
          <p className="mb-4">
            All returns, exchanges, and refunds are governed by our{' '}
            <Link to="/refunds" className="text-primary hover:underline font-semibold">
              Refund &amp; Return Policy
            </Link>
            , available separately on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            7. Intellectual Property
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>All content on this website — including text, graphics, logos, images, and product designs — is the property of Kosmico Wellness and protected under applicable copyright and trademark laws.</li>
            <li>You may not reproduce, distribute, modify, or use any content from this website without prior written consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            8. User Conduct
          </h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Use the website for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to our systems or data.</li>
            <li>Post or transmit any harmful, offensive, or fraudulent content through the website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            9. Limitation of Liability
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Kosmico Wellness shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</li>
            <li>Our products are not intended to diagnose, treat, cure, or prevent any disease. Please consult a healthcare professional before use if you have any medical concerns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            10. Third-Party Links
          </h2>
          <p className="mb-4">
            Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of such external sites.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            11. Governing Law
          </h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Greater Noida / Gautam Buddha Nagar, Uttar Pradesh, India.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            12. Contact Us
          </h2>
          <p className="mb-4">
            For any questions regarding these Terms of Service, please contact us at:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Email:{' '}
              <a href="mailto:support@kosmicowellness.com" className="text-primary hover:underline font-semibold">
                support@kosmicowellness.com
              </a>
            </li>
            <li>
              Phone / WhatsApp:{' '}
              <a href="tel:+919793170555" className="text-primary hover:underline font-semibold">
                +91 97931 70555
              </a>
            </li>
            <li>
              Address: 423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), Uttar Pradesh - 201306, India
            </li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
