export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: November 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CuraLink, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Use of Service</h2>
            <p>
              CuraLink provides a platform to connect patients with clinical trials and researchers. 
              You agree to use the service only for lawful purposes and in accordance with these Terms.
            </p>
            <p className="mt-2">You agree NOT to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate another person or entity</li>
              <li>Share false or misleading information</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Medical Disclaimer</h2>
            <p className="font-semibold text-red-600">
              CuraLink is an informational platform and does not provide medical advice.
            </p>
            <p className="mt-2">
              The information provided on CuraLink is for general informational purposes only. 
              Always seek the advice of your physician or other qualified health provider with any 
              questions you may have regarding a medical condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You agree to notify us immediately 
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p>
              The CuraLink platform, including all content, features, and functionality, is owned by 
              CuraLink and is protected by international copyright, trademark, and other intellectual 
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>
              CuraLink shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the platform. Your continued use of the service 
              after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:legal@curalink.com" className="text-blue-600 hover:underline">
                legal@curalink.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}