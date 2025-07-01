'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSettings, FiHelpCircle, FiShield, FiExternalLink, FiMenu, FiX } from 'react-icons/fi';
import { MdAccountBalance, MdPayment, MdReceipt, MdPeople, MdBuild, MdCreditCard } from 'react-icons/md';
import { FaMoneyBillWave, FaPiggyBank } from 'react-icons/fa';
import { MdSettingsApplications } from 'react-icons/md';

const menuItems = [
  { id: 'accounts', label: 'Accounts', icon: <MdAccountBalance size={20} /> },
  { id: 'transfers', label: 'Transfers', icon: <MdPayment size={20} /> },
  { id: 'bill-payments', label: 'Bill Payments', icon: <MdReceipt size={20} /> },
  { id: 'redeem-funds', label: 'Redeem Funds', icon: <FaMoneyBillWave size={20} /> },
  { id: 'beneficiaries', label: 'Beneficiary Management', icon: <MdPeople size={20} /> },
  { id: 'loans', label: 'Loans and Investments', icon: <FaPiggyBank size={20} /> },
  { id: 'service-requests', label: 'Service Requests', icon: <MdBuild size={20} /> },
  { id: 'card-management', label: 'Card Management', icon: <MdCreditCard size={20} /> },
];

const settingsItems = [
  { id: 'settings/login-security', label: 'Login & Security', icon: <FiShield size={18} /> },
  { id: 'settings/notifications', label: 'Notifications & Alerts', icon: <FiSettings size={18} /> },
  // { id: 'money-movement', label: 'Money Movement Settings', icon: <FiSettings size={18} /> },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    settings: true,
    accountManagement: true,
    help: true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <>
      {/* Mobile Menu Button - Repositioned */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-20 right-4 z-50 bg-[#03305c] text-white p-3 rounded-full shadow-lg hover:bg-[#1e4770] transition-colors duration-200"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-[#03305c] text-white flex flex-col
        lg:relative lg:translate-x-0
        fixed inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-center border-b border-[#1e4770] h-16">
          <h1 className="text-xl font-bold">Amalgamated Bank</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Menu - Updated with proper links */}
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map(item => (
                <li key={item.id}>
                  <Link
                    href={
                      item.id === 'transfers' ? '/dashboard/transactions/transfer' :
                      item.id === 'bill-payments' ? '/dashboard/transactions/bills' :
                      item.id === 'card-management' ? '/dashboard/transactions/card' :
                      item.id === 'redeem-funds' ? '/dashboard/transactions/redeem' :
                      `/dashboard/${item.id}`
                    }
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive(item.id) ? 'bg-[#e8742c]' : 'hover:bg-[#1e4770]'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account Management Section */}
          <div className="border-t border-[#1e4770] p-4">
            <button
              onClick={() => toggleSection('accountManagement')}
              className="flex items-center justify-between w-full py-2 text-left hover:text-[#e8742c] transition-colors duration-200"
            >
              <h3 className="font-medium">ACCOUNT MANAGEMENT</h3>
              <span className="text-lg font-bold">{expandedSections.accountManagement ? '−' : '+'}</span>
            </button>
            {expandedSections.accountManagement && (
              <ul className="mt-2 space-y-1">
                <li>
                  <Link 
                    href="/dashboard/account-management/maintenance" 
                    className="flex items-center px-3 py-2 rounded-md hover:bg-[#1e4770] transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <MdSettingsApplications className="mr-3" size={18} />
                    Account Maintenance
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Settings Section */}
          <div className="border-t border-[#1e4770] p-4">
            <button
              onClick={() => toggleSection('settings')}
              className="flex items-center justify-between w-full py-2 text-left hover:text-[#e8742c] transition-colors duration-200"
            >
              <h3 className="font-medium">SETTINGS</h3>
              <span className="text-lg font-bold">{expandedSections.settings ? '−' : '+'}</span>
            </button>
            {expandedSections.settings && (
              <ul className="mt-2 space-y-1">
                {settingsItems.map(item => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/${item.id}`}
                      className="flex items-center px-3 py-2 rounded-md hover:bg-[#1e4770] transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Help & Support Section */}
          <div className="border-t border-[#1e4770] p-4">
            <button
              onClick={() => toggleSection('help')}
              className="flex items-center justify-between w-full py-2 text-left hover:text-[#e8742c] transition-colors duration-200"
            >
              <h3 className="font-medium">HELP & SUPPORT</h3>
              <span className="text-lg font-bold">{expandedSections.help ? '−' : '+'}</span>
            </button>
            {expandedSections.help && (
              <ul className="mt-2 space-y-1">
                <li>
                  <Link 
                    href="/dashboard/contact-us" 
                    className="flex items-center px-3 py-2 rounded-md hover:bg-[#1e4770] transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <FiHelpCircle className="mr-3" size={18} />
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/privacy-policy" 
                    className="flex items-center px-3 py-2 rounded-md hover:bg-[#1e4770] transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <FiShield className="mr-3" size={18} />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* External Links */}
 
      </div>
    </>
  );
};

export default DashboardSidebar;