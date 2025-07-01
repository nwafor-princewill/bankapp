'use client';
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#03305c] mb-4">Privacy Policy</h1>
            <div className="h-1 w-20 bg-[#e8742c]"></div>
          </div>

          <div className="space-y-6 text-gray-700">
            {/* Facts Section */}
            <section>
              <h2 className="text-2xl font-semibold text-[#03305c] mb-4">
                What does Amalgamated Bank do with your personal information?
              </h2>
              
              <div className="bg-[#03305c] text-white p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">Why?</h3>
                <p className="mb-4">
                  Financial companies choose how they share your personal information. Federal law gives consumers the right to limit some but not all sharing. Federal law also requires us to tell you how we collect, share and protect your personal information.
                </p>
                
                <h3 className="text-lg font-semibold mb-3">What?</h3>
                <p className="mb-4">
                  The types of personal information we collect and share depend on the product or service you have with us. This information includes:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Social Security number</li>
                  <li>Account balances</li>
                  <li>Payment history</li>
                  <li>Transaction history</li>
                  <li>Overdraft history</li>
                </ul>
                <p>When you are no longer our customer, we continue to share your information as described in this notice.</p>
              </div>
            </section>

            {/* Information Sharing Table */}
            <section>
              <h3 className="text-xl font-semibold text-[#03305c] mb-4">How we share your information</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-[#03305c] text-white">
                      <th className="border border-gray-300 p-3 text-left">Reasons we can share your personal information</th>
                      <th className="border border-gray-300 p-3 text-center">Does Amalgamated Bank share?</th>
                      <th className="border border-gray-300 p-3 text-center">Can you limit this sharing?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">For our everyday business purposes</td>
                      <td className="border border-gray-300 p-3 text-center">Yes</td>
                      <td className="border border-gray-300 p-3 text-center">No</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-3">For our marketing purposes</td>
                      <td className="border border-gray-300 p-3 text-center">Yes</td>
                      <td className="border border-gray-300 p-3 text-center">No</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">For joint marketing with other financial companies</td>
                      <td className="border border-gray-300 p-3 text-center">Yes</td>
                      <td className="border border-gray-300 p-3 text-center">No</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-3">For nonaffiliates to market to you</td>
                      <td className="border border-gray-300 p-3 text-center">No</td>
                      <td className="border border-gray-300 p-3 text-center">We don't share</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Protection Measures */}
            <section>
              <h3 className="text-xl font-semibold text-[#03305c] mb-4">How we protect your information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  To protect your personal information from unauthorized access and use, we use security measures that comply with federal law. These measures include computer safeguards, secured files and buildings, and procedural safeguards.
                </p>
              </div>
            </section>

            {/* Collection Methods */}
            <section>
              <h3 className="text-xl font-semibold text-[#03305c] mb-4">How we collect your information</h3>
              <p className="mb-3">We collect your personal information when you:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Open an account</li>
                <li>Apply for a loan</li>
                <li>Use your credit or debit card</li>
                <li>Make deposits or withdrawals</li>
                <li>Give us your contact information</li>
              </ul>
              <p>We also collect your personal information from others, such as credit bureaus or other companies.</p>
            </section>

            {/* Website Privacy */}
            <section>
              <h3 className="text-xl font-semibold text-[#03305c] mb-4">Website Privacy</h3>
              <div className="bg-[#e8742c] bg-opacity-10 p-4 rounded-lg">
                <p className="mb-3">
                  When visiting our website, you do so without revealing personal information. Online banking transactions are secured using encryption.
                </p>
                <p className="font-semibold text-[#e8742c]">
                  Important: Do not send confidential information via email. For secure communication, call us or visit a branch.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-[#03305c] text-white p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Questions?</h3>
                <p className="text-lg">Call toll-free: <span className="font-bold">1-800-662-0860</span></p>
                <p className="text-sm mt-2 opacity-90">© 2024 Amalgamated Bank. All rights reserved.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;