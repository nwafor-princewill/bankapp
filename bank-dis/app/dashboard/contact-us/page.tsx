'use client';
import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiMessageCircle } from 'react-icons/fi';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset form (static behavior as requested)
    setFormData({
      topic: '',
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    // Page will reload due to form reset
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#03305c] text-white p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
            <p className="text-lg opacity-90">We're here to help you with all your banking needs</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Let's Talk Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h2 className="text-2xl font-bold text-[#03305c] mb-6">Let's Talk</h2>
                
                {/* Chat Support */}
                <div className="bg-[#e8742c] bg-opacity-10 p-6 rounded-lg mb-6">
                  <div className="flex items-center mb-3">
                    <FiMessageCircle className="text-[#e8742c] mr-3" size={24} />
                    <h3 className="text-xl font-semibold text-[#03305c]">Chat with a representative</h3>
                  </div>
                  <p className="text-gray-700 mb-2">Click the chat box on the page to begin</p>
                  <p className="text-sm text-gray-600">Monday - Friday, 9 AM - 5 PM ET</p>
                </div>

                {/* Phone Support */}
                <div className="bg-[#03305c] bg-opacity-5 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <FiPhone className="text-[#03305c] mr-3" size={24} />
                    <h3 className="text-xl font-semibold text-[#03305c]">Have questions?</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#e8742c] mb-2">800-662-0860</p>
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2" size={16} />
                    <span>In person: Find a location</span>
                  </div>
                </div>
              </div>

              {/* Contact Numbers */}
              <div>
                <h2 className="text-2xl font-bold text-[#03305c] mb-6">Call Us</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-[#e8742c] pl-4">
                    <h4 className="font-semibold text-[#03305c]">Personal Banking</h4>
                    <p className="text-gray-600 text-sm">Mon. - Fri. 8 AM - 8 PM & Sat. 9 AM - 2 PM ET</p>
                    <p className="font-bold text-[#03305c]">800-662-0860</p>
                  </div>

                  <div className="border-l-4 border-[#e8742c] pl-4">
                    <h4 className="font-semibold text-[#03305c]">Lost or Stolen Card</h4>
                    <p className="text-gray-600 text-sm">24 hours / 7 days a week</p>
                    <p className="font-bold text-[#03305c]">800-500-1044</p>
                  </div>

                  <div className="border-l-4 border-[#e8742c] pl-4">
                    <h4 className="font-semibold text-[#03305c]">Online Banking / Password Resets</h4>
                    <p className="text-gray-600 text-sm">24 hours / 7 days a week</p>
                    <p className="font-bold text-[#03305c]">800-662-0860 (option 2)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h5 className="font-medium text-[#03305c]">Fraud Help Line</h5>
                      <p className="text-sm font-bold">800-662-0860</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-[#03305c]">Consumer Credit Card</h5>
                      <p className="text-sm font-bold">888-295-5540</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-[#03305c]">Business Credit Card</h5>
                      <p className="text-sm font-bold">800-819-4249</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-[#03305c]">Political Banking</h5>
                      <p className="text-sm font-bold">202-721-0770</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-[#03305c] mb-2">Commercial and Organization Banking</h4>
                <p className="text-sm text-gray-600 mb-1">Mon. - Fri. 8 AM - 5 PM ET</p>
                <p className="font-bold text-[#03305c]">866-542-8788</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-[#03305c] mb-2">Investment Management</h4>
                <p className="text-sm text-gray-600 mb-1">Mon. - Fri. 9 AM - 5 PM ET</p>
                <p className="font-bold text-[#03305c]">888-404-8058</p>
              </div>
            </div>

            {/* Email Form */}
            <div className="bg-[#03305c] bg-opacity-5 p-6 md:p-8 rounded-lg">
              <div className="flex items-center mb-6">
                <FiMail className="text-[#e8742c] mr-3" size={24} />
                <h2 className="text-2xl font-bold text-[#03305c]">Email Us</h2>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Please do not include</strong> any Personal Identifying Information like account numbers, social security numbers, usernames or passwords in your message. This form is for general inquiries only.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-[#03305c] mb-2">
                      Topic *
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:border-transparent"
                    >
                      <option value="">Select a topic</option>
                      <option value="personal-banking">Personal Banking</option>
                      <option value="organization-banking">Organization Banking</option>
                      <option value="political-banking">Political Banking</option>
                      <option value="commercial-banking">Commercial Banking</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#03305c] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#03305c] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#03305c] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#03305c] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="bg-[#e8742c] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#d16429] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#e8742c] focus:ring-offset-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;