'use client'

import Footer from '@/components/marketing/Footer'

export default function TermsPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* Header */}
      <section className="bg-black text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-supernova text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last Updated: November 23, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
            <ol className="space-y-2">
              <li><a href="#acceptance" className="text-hot-pink hover:underline">1. Acceptance of Terms</a></li>
              <li><a href="#description" className="text-hot-pink hover:underline">2. Description of Service</a></li>
              <li><a href="#accounts" className="text-hot-pink hover:underline">3. User Accounts</a></li>
              <li><a href="#payment" className="text-hot-pink hover:underline">4. Payment Terms</a></li>
              <li><a href="#prohibited" className="text-hot-pink hover:underline">5. Prohibited Uses</a></li>
              <li><a href="#ip" className="text-hot-pink hover:underline">6. Intellectual Property</a></li>
              <li><a href="#limitation" className="text-hot-pink hover:underline">7. Limitation of Liability</a></li>
              <li><a href="#termination" className="text-hot-pink hover:underline">8. Termination</a></li>
              <li><a href="#law" className="text-hot-pink hover:underline">9. Governing Law</a></li>
              <li><a href="#contact" className="text-hot-pink hover:underline">10. Contact Information</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <h2 id="acceptance" className="text-3xl font-bold mt-12 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using dAItaniverse ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <p>
            These Terms of Service apply to all users of the Service, including without limitation users who contribute content, information, and other materials or services on the Service.
          </p>

          {/* Section 2 */}
          <h2 id="description" className="text-3xl font-bold mt-12 mb-4">2. Description of Service</h2>
          <p>
            dAItaniverse provides an integrated business platform offering AI coaching, project management, quiz builder, CRM, email marketing, and knowledge library services. The Service is provided on an "as is" and "as available" basis.
          </p>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the Service with or without notice. You agree that dAItaniverse shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
          </p>

          {/* Section 3 */}
          <h2 id="accounts" className="text-3xl font-bold mt-12 mb-4">3. User Accounts</h2>
          <p>
            If you create an account on the Service, you are responsible for maintaining the confidentiality of your account information, including your password, and you are responsible for all activity that occurs under your account.
          </p>
          <p>
            You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          {/* Section 4 */}
          <h2 id="payment" className="text-3xl font-bold mt-12 mb-4">4. Payment Terms</h2>
          <h3 className="text-2xl font-bold mt-6 mb-3">4.1 Subscription Pricing</h3>
          <p>
            The Service is offered at £26 per month. This price includes all features with no additional hidden fees. Pricing is subject to change with 30 days' notice.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.2 Free Trial</h3>
          <p>
            We offer a 7-day free trial to all new users. No credit card is required to start your trial. After the trial period ends, you will be charged the monthly subscription fee unless you cancel beforehand.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.3 Billing Cycle</h3>
          <p>
            Subscriptions are billed on a monthly basis. Your billing cycle begins on the day you start your paid subscription or after your free trial ends.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.4 Payment Method</h3>
          <p>
            You authorize us to charge your credit card, debit card, or other payment method on file for all charges associated with your account. If your payment is declined, we will contact you to update your payment method.
          </p>

          <h3 className="text-2xl font-bold mt-6 mb-3">4.5 Cancellation and Refunds</h3>
          <p>
            You can cancel your subscription anytime from your account settings. Upon cancellation, your access will end at the end of your billing cycle. We do not offer refunds for partial months, but you may cancel anytime to avoid future charges.
          </p>

          {/* Section 5 */}
          <h2 id="prohibited" className="text-3xl font-bold mt-12 mb-4">5. Prohibited Uses</h2>
          <p>
            You agree that you will not use the Service for any purpose that is unlawful or prohibited by these terms, or for any illegal purpose or in violation of any laws, rules, or regulations applicable to you.
          </p>
          <p>
            Prohibited behavior includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Harassing or causing distress or inconvenience to any person</li>
            <li>Sending obscene or abusive messages</li>
            <li>Disrupting the normal flow of dialogue within the Service</li>
            <li>Attempting to access restricted areas of the Service without authorization</li>
            <li>Collecting or tracking personal information of others</li>
            <li>Spamming, phishing, or attempting to scam other users</li>
            <li>Uploading viruses or malicious code</li>
            <li>Using the Service to violate intellectual property rights</li>
          </ul>

          {/* Section 6 */}
          <h2 id="ip" className="text-3xl font-bold mt-12 mb-4">6. Intellectual Property</h2>
          <p>
            The Service and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by dAItaniverse, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You retain ownership of any content you upload or create within the Service. By uploading content, you grant dAItaniverse a license to use, store, and display your content as necessary to provide the Service.
          </p>
          <p>
            You may not reproduce, distribute, or transmit the content displayed on the Service without prior written permission from dAItaniverse.
          </p>

          {/* Section 7 */}
          <h2 id="limitation" className="text-3xl font-bold mt-12 mb-4">7. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL dAItaniverse, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
          </p>
          <p>
            dAItaniverse SHALL NOT BE LIABLE FOR ANY VIRUSES, MALWARE, OR OTHER HARMFUL CODE THAT MAY BE TRANSMITTED TO OR THROUGH THE SERVICE.
          </p>
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for incidental or consequential damages. Accordingly, some of the above limitations may not apply to you.
          </p>

          {/* Section 8 */}
          <h2 id="termination" className="text-3xl font-bold mt-12 mb-4">8. Termination</h2>
          <p>
            dAItaniverse may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach any provision of these Terms of Service.
          </p>
          <p>
            You may terminate your account at any time by canceling your subscription. Upon termination, your right to use the Service will immediately cease.
          </p>

          {/* Section 9 */}
          <h2 id="law" className="text-3xl font-bold mt-12 mb-4">9. Governing Law</h2>
          <p>
            These Terms of Service and your use of the Service are governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
          </p>
          <p>
            You agree that any legal action or proceeding related to your use of the Service shall be brought exclusively in the courts of England and Wales, and you consent to the personal jurisdiction and venue of these courts.
          </p>

          {/* Section 10 */}
          <h2 id="contact" className="text-3xl font-bold mt-12 mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p>
              <strong>dAItaniverse Ltd</strong><br />
              Email: legal@daitaniverse.com<br />
              Website: www.daitaniverse.com
            </p>
          </div>

          {/* Final Note */}
          <div className="bg-hot-pink/10 p-6 rounded-lg mt-8 border-l-4 border-hot-pink">
            <p>
              <strong>Last Updated:</strong> November 23, 2025
            </p>
            <p className="mt-2">
              dAItaniverse reserves the right to update these Terms of Service at any time. Your continued use of the Service following the posting of updated Terms constitutes your acceptance of such updates.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
