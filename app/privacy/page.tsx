export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: November 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              CuraLink collects information that you provide directly to us when you create an account, 
              use our services, or communicate with us. This may include your name, email address, 
              medical information, and other data you choose to share.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Match patients with relevant clinical trials</li>
              <li>Facilitate connections between patients and researchers</li>
              <li>Send you updates and notifications</li>
              <li>Protect against fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. 
              All sensitive data is encrypted, and we regularly review our security practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. HIPAA Compliance</h2>
            <p>
              CuraLink is committed to protecting your health information in accordance with HIPAA 
              regulations. We do not share your medical information without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data uses</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@curalink.com" className="text-blue-600 hover:underline">
                privacy@curalink.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}