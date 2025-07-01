import React from 'react';
import Image from 'next/image';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-[#03305c] text-[#fff]">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-gray-300">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Image
              src="/images/amalg-logo.jpg"
              alt="Amalgamated Bank Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <div className="w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-2">Stay updated</h3>
            <p className="text-sm mb-4">
              Get Amalgamated Bank to your inbox. Unsubscribe any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03305c] text-black"
              />
              <button className="bg-[#e8742c] text-white px-6 py-2 rounded-md hover:bg-[#d66425] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bank Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <Image
              src="/images/amalg-logo.jpg"
              alt="Amalgamated Bank Logo"
              width={120}
              height={40}
              className="h-10 w-auto mb-2"
            />
            <p className="text-sm">
              Member FDIC | Equal Housing and Equal Opportunity Lender
            </p>
            <p className="text-sm">Amalgamated Bank NMLS ID# 898791</p>
          </div>
          <div className="text-sm">
            <p>
              If you are using a screen reader and having problems using this website, please call{' '}
              <a href="tel:8006620860" className="text-[#e8742c] hover:underline">
                (800) 662-0860
              </a>{' '}
              for assistance or{' '}
              <a href="#" className="text-[#e8742c] hover:underline">
                click here
              </a>{' '}
              to communicate with our Contact Center via instant text message chat.
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Startup</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Security Center</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Privacy Policy</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Your Privacy Rights</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Online Privacy Policy</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Consumer Account Opening Disclosure</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Small Business Account Opening Disclosure</h4>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#e8742c]">Terms of Use</h4>
          </div>
        </div>

        {/* Copyright and Social */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-300">
          <div className="mb-4 md:mb-0">
            <Image
              src="/images/amalg-logo.jpg"
              alt="Amalgamated Bank Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <p className="text-xs mt-1">© {new Date().getFullYear()} Amalgamated Bank. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-[#e8742c] transition-colors">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#e8742c] transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#e8742c] transition-colors">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#e8742c] transition-colors">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;