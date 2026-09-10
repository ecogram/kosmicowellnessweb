import { Container } from '../components/ui/Container';

export function PrivacyPolicy() {
  return (
    <Container className="py-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-primary mb-2 text-center">
        Privacy Policy
      </h1>

      <p className="text-text-muted text-center mb-16 text-sm">
        Last Updated: September 1, 2026
      </p>

      <div className="space-y-12 text-text-main leading-relaxed">

        <section>
          <p className="mb-4">
            Welcome to Kosmico Wellness Pvt. Ltd. ("we," "our," "us"). This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application and website
            (collectively, the "Service").
          </p>

          <p>
            Please read this Privacy Policy carefully. By using the Service, you
            agree to the practices described in this policy. If you do not
            agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-6">
            1. Information We Collect
          </h2>

          <h3 className="text-xl font-bold text-primary mb-3 mt-6">
            1.1 Personal Information You Provide
          </h3>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Name, email address, phone number</li>
            <li>Age, gender, height, weight</li>
            <li>
              Health information you choose to share, including but not limited
              to:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Blood pressure readings</li>
                <li>Blood glucose / diabetes status</li>
                <li>Dietary preferences and restrictions</li>
                <li>Meal logs and food photos</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-primary mb-3 mt-6">
            1.2 Photos and Images
          </h3>

          <p className="mb-4">
            Images of food/meals you upload for nutrition analysis.
          </p>

          <h3 className="text-xl font-bold text-primary mb-3 mt-6">
            1.3 Automatically Collected Information
          </h3>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Device information (device type, operating system, unique device
              identifiers)
            </li>
            <li>
              Usage data (features used, time spent, interaction patterns)
            </li>
            <li>IP address and approximate location (if permitted)</li>
            <li>Log data and crash reports</li>
          </ul>

          <h3 className="text-xl font-bold text-primary mb-3 mt-6">
            1.4 Health Data Disclaimer
          </h3>

          <p className="mb-4">
            Any health-related information generated or displayed by the Service
            (including but not limited to calorie estimates, glycemic
            index/load, "spike risk" indicators, or blood pressure trends) is
            generated using general nutritional information and databases. This
            information is for general wellness and informational purposes only
            and is not a substitute for professional medical advice, diagnosis,
            or treatment.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            2. How We Use Your Information
          </h2>

          <p className="mb-4">We use the information we collect to:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain the Service</li>
            <li>Analyze food images and generate nutritional estimates</li>
            <li>
              Track health metrics you choose to log (e.g., blood pressure,
              glucose trends)
            </li>
            <li>
              Personalize your experience and improve accuracy of recommendations
              over time
            </li>
            <li>
              Communicate with you regarding updates, support, or
              service-related notices
            </li>
            <li>Monitor and analyze usage trends to improve the Service</li>
            <li>
              Detect, prevent, and address technical issues or fraudulent
              activity
            </li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            3. Legal Basis for Processing (Where Applicable)
          </h2>

          <p className="mb-4">
            Where required by applicable law (including India's Digital Personal
            Data Protection Act, 2023), we process your personal data based on:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Your consent, which you may withdraw at any time</li>
            <li>Legitimate interest in operating and improving the Service</li>
            <li>Legal obligation, where applicable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            4. Third-Party Services
          </h2>

          <p className="mb-6">
            To provide core functionality, we may use trusted service providers
            where necessary, including:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border border-border">
              <thead>
                <tr className="bg-surface text-left">
                  <th className="py-3 px-4 border-b border-border font-bold">
                    Service Type
                  </th>
                  <th className="py-3 px-4 border-b border-border font-bold">
                    Purpose
                  </th>
                  <th className="py-3 px-4 border-b border-border font-bold">
                    Data Shared
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="py-3 px-4 border-b border-border">
                    Cloud Hosting Providers
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    App infrastructure and data storage
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    Account data, usage logs
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 border-b border-border">
                    Analytics Providers
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    Understanding app usage and improving features
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    Device data, usage patterns
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-4 border-b border-border">
                    Payment Processors
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    Processing subscription/payment transactions
                  </td>
                  <td className="py-3 px-4 border-b border-border">
                    Billing information (we do not store full card details)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We do not sell your personal data to third parties for advertising
            purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            5. Data Storage and Security
          </h2>

          <p className="mb-4">
            We implement reasonable administrative, technical, and physical
            safeguards to protect your information from unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <p className="mb-4">
            Health-related data is treated as sensitive personal data and is
            encrypted in transit and at rest where technically feasible.
          </p>

          <p>
            Despite our efforts, no method of electronic transmission or storage
            is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            6. Data Retention
          </h2>

          <p className="mb-4">
            We retain your personal information for as long as necessary to:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Provide the Service to you</li>
            <li>
              Comply with legal, regulatory, or contractual obligations
            </li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>

          <p>
            You may request deletion of your account and associated data at any
            time (see Section 8).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            7. Your Rights
          </h2>

          <p className="mb-4">
            Depending on your jurisdiction, you may have the right to:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Delete your personal data ("right to erasure")</li>
            <li>Withdraw consent for processing at any time</li>
            <li>
              Data portability - receive your data in a structured,
              machine-readable format
            </li>
            <li>Object to or restrict certain processing activities</li>
          </ul>

          <p>
            To exercise these rights, contact us at{' '}
            <a
              href="mailto:supportkosmicowellness@gmail.com"
              className="text-primary hover:underline"
            >
              supportkosmicowellness@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            8. Account Deletion
          </h2>

          <p className="mb-4">
            You may delete your account at any time through the app settings or
            by contacting us at{' '}
            <a
              href="mailto:supportkosmicowellness@gmail.com"
              className="text-primary hover:underline"
            >
              supportkosmicowellness@gmail.com
            </a>
            . Upon deletion, we will remove your personal data from active
            systems within 30 days, except where retention is required for legal
            or regulatory purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            9. Children's Privacy
          </h2>

          <p className="mb-4">
            The Service is not intended for individuals under the age of 18 (or
            the applicable age of majority in your jurisdiction). We do not
            knowingly collect personal information from children. If you believe
            a child has provided us with personal data, please contact us so we
            can delete it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            10. Health Data and Medical Disclaimer
          </h2>

          <p className="mb-4">
            This Service is not a medical device and does not provide medical
            diagnoses, treatment, or professional healthcare advice.
          </p>

          <p className="mb-4">
            Features such as food recognition, nutrition estimation, glycemic
            risk scoring, and blood pressure tracking are provided for general
            informational and wellness purposes only.
          </p>

          <p className="mb-4">
            Always consult a qualified healthcare professional before making
            decisions related to diet, medication, or health management.
          </p>

          <p>
            We are not liable for any health outcomes resulting from reliance on
            information provided by the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            11. International Data Transfers
          </h2>

          <p>
            If you are located outside the country where our servers or service
            providers operate, your information may be transferred to, stored,
            and processed in a different jurisdiction. We take reasonable steps
            to ensure your data is treated securely in accordance with this
            Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            12. Changes to This Privacy Policy
          </h2>

          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy on this page
            and updating the "Last Updated" date. Continued use of the Service
            after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            13. Contact Us
          </h2>

          <p className="mb-4">
            If you have questions, concerns, or requests regarding this Privacy
            Policy or your personal data, please contact us at:
          </p>

          <p className="mb-4 font-bold"></p>

          <p>
            Email:{' '}
            <a
              href="mailto:supportkosmicowellness@gmail.com"
              className="text-primary hover:underline"
            >
              supportkosmicowellness@gmail.com
            </a>
          </p>
        </section>

      </div>
    </Container>
  );
}