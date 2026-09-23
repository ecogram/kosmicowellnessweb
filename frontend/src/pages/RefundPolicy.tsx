import { Container } from '../components/ui/Container';

export function RefundPolicy() {
  return (
    <Container className="py-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-primary mb-2 text-center">
        Refund & Return Policy
      </h1>

      <p className="text-text-muted text-center mb-16 text-sm">
        Last Updated: September 4, 2026
      </p>

      <div className="space-y-12 text-text-main leading-relaxed">
        <section>
          <p className="mb-4">
            At Kosmico Wellness, customer satisfaction is our top priority. Please read our refund and return policy carefully before making a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            1. Return Eligibility
          </h2>
          <p className="mb-4">
            Since our products (including Sweet Monk) are consumable food items, we accept returns only under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The product received is <strong>damaged, defective, or incorrect</strong> at the time of delivery.</li>
            <li>The <strong>seal/packaging is tampered or broken</strong> upon arrival.</li>
            <li>You must raise a return/replacement request within <strong>48 hours</strong> of delivery, along with an unboxing video or photos as proof.</li>
          </ul>
          <p className="mb-4">
            Due to hygiene and safety standards, we <strong>do not accept returns</strong> for products that have been opened, used, or where the request is based solely on personal preference/taste.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            2. Refund Process
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Once your return request is approved, refunds will be initiated within <strong>5–7 business days</strong>.</li>
            <li>The refund amount will be credited to your <strong>original payment method</strong> (UPI, card, net banking, etc.).</li>
            <li>For Cash on Delivery (COD) orders, refunds will be processed via bank transfer or UPI after we receive your account details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            3. Order Cancellation
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Orders can be cancelled <strong>before they are shipped</strong> by contacting our support team.</li>
            <li>Once an order is shipped, it cannot be cancelled, but you may request a return as per the eligibility criteria above.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            4. Non-Returnable Items
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Products purchased during sale/clearance offers.</li>
            <li>Opened or partially used product packaging.</li>
            <li>Requests raised after the 48-hour delivery window.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            5. How to Request a Refund/Return
          </h2>
          <p className="mb-4">
            To initiate a return or refund request, please contact us with your <strong>Order ID</strong>, <strong>reason for return</strong>, and <strong>photos/video proof</strong>:
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
          </ul>
          <p className="mb-4">
            We aim to respond to all queries within 24–48 hours (Mon – Sat: 11:00 AM – 7:00 PM).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            6. Policy Changes
          </h2>
          <p>
            Kosmico Wellness reserves the right to update or modify this policy at any time without prior notice. Please review this page periodically for updates.
          </p>
        </section>
      </div>
    </Container>
  );
}
