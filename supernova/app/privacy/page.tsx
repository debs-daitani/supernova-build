'use client'

import Footer from '@/components/marketing/Footer'

export default function PrivacyPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Header */}
      <section className="bg-black text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-supernova text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-300">GDPR-Compliant Privacy Policy</p>
          <p className="text-gray-400 text-sm">Last Updated: November 23, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
            <ol className="space-y-2">
              <li><a href="#intro" className="text-hot-pink hover:underline">1. Introduction</a></li>
              <li><a href="#information" className="text-hot-pink hover:underline">2. Information We Collect</a></li>
              <li><a href="#use" className="text-hot-pink hover:underline">3. How We Use Information</a></li>
              <li><a href="#storage" className="text-hot-pink hover:underline">4. Data Storage and Security</a></li>
              <li><a href="#cookies" className="text-hot-pink hover:underline">5. Cookies</a></li>
              <li><a href="#third-party" className="text-hot-pink hover:underline">6. Third-Party Services</a></li>
              <li><a href="#rights" className="text-hot-pink hover:underline">7. Your GDPR Rights</a></li>
              <li><a href="#retention" className="text-hot-pink hover:underline">8. Data Retention</a></li>
              <li><a href="#children" className="text-hot-pink hover:underline">9. Children's Privacy</a></li>
              <li><a href="#changes" className="text-hot-pink hover:underline">10. Changes to Policy</a></li>
              <li><a href="#contact" className="text-hot-pink hover:underline">11. Contact Information</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <h2 id="intro" className="text-3xl font-bold mt-12 mb-4">1. Introduction</h2>
          <p>
            dAItaniverse Ltd ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service, including our website and mobile applications.
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service. By using our Service, you accept and agree to this Privacy Policy.
          </p>

          {/* Section 2 */}
          <h2 id="information" className="text-3xl font-bold mt-12 mb-4">2. Information We Collect</h2>

          <h3 className="text-2xl font-bold mt-6 mb-3">2.1 Information You Provide Directly</h3>
          <p>
            <strong>Account Registration:</strong> When you create an account, we collect your name, email address, password, and basic profile information.
          </p>
          <p>
            <strong>Payment Information:</strong> We collect payment information including credit card details. However, payment processing is handled by Stripe (see section 6 below). We do not store full credit card details on our servers.
          </p>
          <p>
            <strong>Content You Create:</strong> Any content you create within the Service (quizzes, emails, projects, customer information, etc.) is stored and processed by us to provide the Service.
          </p>
          <p>
            <strong>Communications:</strong> If you contact us with questions, feedback, or support requests, we collect the content of those communications.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">2.2 Automatically Collected Information</h3>
          <p>
            <strong>Device Information:</strong> We collect information about the devices you use to access our Service, including device type, operating system, and unique identifiers.
          </p>
          <p>
            <strong>Usage Data:</strong> We collect information about how you use the Service, including features accessed, actions taken, and time spent in the application.
          </p>
          <p>
            <strong>Location Information:</strong> We may collect approximate location information based on IP address.
          </p>
          <p>
            <strong>Log Data:</strong> We collect server logs including IP address, browser type, pages visited, and timestamps.
          </p>

          {/* Section 3 */}
          <h2 id="use" className="text-3xl font-bold mt-12 mb-4">3. How We Use Information</h2>
          <p>
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>To Provide the Service:</strong> To deliver, maintain, and improve the Service</li>
            <li><strong>To Process Transactions:</strong> To process payments and send billing information</li>
            <li><strong>To Communicate:</strong> To send service updates, security alerts, and support messages</li>
            <li><strong>To Personalize:</strong> To customize your experience and provide targeted features</li>
            <li><strong>For Analytics:</strong> To understand usage patterns and improve the Service</li>
            <li><strong>To Ensure Security:</strong> To detect, prevent, and address fraud and security issues</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
            <li><strong>Marketing:</strong> To send marketing communications (with your consent)</li>
          </ul>

          {/* Section 4 */}
          <h2 id="storage" className="text-3xl font-bold mt-12 mb-4">4. Data Storage and Security</h2>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.1 Where We Store Data</h3>
          <p>
            Your data is stored on secure servers located in the European Union. We comply with data residency requirements under GDPR.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.2 Security Measures</h3>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit using TLS/SSL</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and penetration testing</li>
            <li>Employee access controls and training</li>
            <li>Secure deletion of data upon request or account termination</li>
          </ul>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.3 Limitation</h3>
          <p>
            While we strive to protect your personal data, no security system is impenetrable. We cannot guarantee absolute security of your information transmitted over the internet.
          </p>

          {/* Section 5 */}
          <h2 id="cookies" className="text-3xl font-bold mt-12 mb-4">5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience. These may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
            <li><strong>Performance Cookies:</strong> To analyze usage and improve the Service</li>
            <li><strong>Functional Cookies:</strong> To remember your preferences</li>
          </ul>
          <p>
            You can control cookies through your browser settings. However, disabling essential cookies may affect your ability to use the Service.
          </p>

          {/* Section 6 */}
          <h2 id="third-party" className="text-3xl font-bold mt-12 mb-4">6. Third-Party Services</h2>
          <p>
            Our Service integrates with third-party services. We share data with these services only to the extent necessary to provide functionality:
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">6.1 Stripe</h3>
          <p>
            Stripe processes all payments. We share your payment information with Stripe according to Stripe's Privacy Policy. Stripe handles PCI compliance.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">6.2 OpenAI / Anthropic</h3>
          <p>
            Our AI coaching feature uses APIs from OpenAI and Anthropic. Your chat conversations are processed according to their privacy policies. Please review their policies at:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>OpenAI: https://openai.com/privacy</li>
            <li>Anthropic: https://www.anthropic.com/privacy</li>
          </ul>

          <h3 className="text-2xl font-bold mt-6 mb-3">6.3 Analytics Services</h3>
          <p>
            We use analytics services to understand usage patterns. These services may collect anonymized data about your interactions with the Service.
          </p>

          {/* Section 7 */}
          <h2 id="rights" className="text-3xl font-bold mt-12 mb-4">7. Your GDPR Rights</h2>
          <p>
            Under the General Data Protection Regulation (GDPR), you have the following rights:
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.1 Right of Access</h3>
          <p>
            You have the right to obtain confirmation of whether we process your personal data and to request a copy of your personal data.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.2 Right to Rectification</h3>
          <p>
            You have the right to correct inaccurate personal data and to complete incomplete data.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.3 Right to Erasure</h3>
          <p>
            You have the right to request erasure of your personal data in certain circumstances, commonly known as the "right to be forgotten."
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.4 Right to Restrict Processing</h3>
          <p>
            You have the right to restrict how we process your personal data in certain circumstances.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.5 Right to Data Portability</h3>
          <p>
            You have the right to receive your personal data in a structured, commonly used, and machine-readable format and to transmit that data to another controller.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.6 Right to Object</h3>
          <p>
            You have the right to object to processing of your personal data for marketing purposes.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">7.7 How to Exercise Your Rights</h3>
          <p>
            To exercise any of these rights, please contact us at privacy@daitaniverse.com. We will respond to your request within 30 days.
          </p>

          {/* Section 8 */}
          <h2 id="retention" className="text-3xl font-bold mt-12 mb-4">8. Data Retention</h2>
          <p>
            We retain your personal data for as long as necessary to provide the Service and as required by law. Specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Retained while your account is active and for 90 days after account deletion</li>
            <li><strong>Payment Information:</strong> Retained as long as needed for billing and tax purposes (up to 7 years)</li>
            <li><strong>Usage Data:</strong> Retained for up to 1 year for analytics purposes</li>
            <li><strong>Log Data:</strong> Retained for up to 30 days</li>
            <li><strong>Content Created:</strong> Retained until you request deletion or delete your account</li>
          </ul>
          <p>
            Upon account deletion, we will securely delete your personal data except where we are required to retain it for legal compliance.
          </p>

          {/* Section 9 */}
          <h2 id="children" className="text-3xl font-bold mt-12 mb-4">9. Children's Privacy</h2>
          <p>
            Our Service is not intended for users under the age of 18. We do not knowingly collect personal data from children under 18. If we become aware that a child under 18 has provided us with personal data, we will delete such information promptly.
          </p>
          <p>
            If you believe we have collected data from a child under 18, please contact us immediately at privacy@daitaniverse.com.
          </p>

          {/* Section 10 */}
          <h2 id="changes" className="text-3xl font-bold mt-12 mb-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the updated Privacy Policy on the Service and updating the "Last Updated" date. Your continued use of the Service following the posting of updated terms constitutes your acceptance of such updates.
          </p>

          {/* Section 11 */}
          <h2 id="contact" className="text-3xl font-bold mt-12 mb-4">11. Contact Information</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p>
              <strong>Data Protection Officer</strong><br />
              dAItaniverse Ltd<br />
              Email: privacy@daitaniverse.com<br />
              Website: www.daitaniverse.com
            </p>
            <p className="mt-4">
              <strong>European Representative (GDPR):</strong><br />
              dAItaniverse EU Representative<br />
              Email: gdpr@daitaniverse.com
            </p>
          </div>

          {/* Final Note */}
          <div className="bg-light-teal/10 p-6 rounded-lg mt-8 border-l-4 border-light-teal">
            <p>
              <strong>Effective Date:</strong> November 23, 2025
            </p>
            <p className="mt-2">
              This Privacy Policy complies with the General Data Protection Regulation (GDPR) (EU) 2016/679 and other applicable data protection laws.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
