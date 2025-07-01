'use client';
import React, { useState, useEffect } from 'react';
import logo from '@/public/images/logo.svg';
import Image from 'next/image';
import { GiHamburgerMenu } from "react-icons/gi";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { ImCancelCircle } from 'react-icons/im';
import AuthModals from '../auth/AuthModals';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menubar, setMenubar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');

  const menuItems = [
    {
      title: 'Personal',
      links: ['Banking', 'Loans', 'Credit Cards', 'Investments']
    },
    {
      title: 'Small Business',
      links: ['Business Banking', 'Business Loans', 'Merchant Services']
    },
    {
      title: 'Commercial',
      links: ['Commercial Banking', 'Treasury Management', 'Commercial Lending']
    },
    {
      title: 'Institutional Investing',
      links: ['Wealth Management', 'Retirement Planning', 'Trust Services']
    },
    {
      title: 'About Us',
      links: ['Our Story', 'Leadership', 'Careers', 'Community Impact']
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenubar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header className='bg-white shadow-md'>
        <AuthModals
          showLogin={showAuthModal && authType === 'login'}
          showSignup={showAuthModal && authType === 'signup'}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authType}
        />
      {!isMobile && (
        <>
          <nav className='flex cursor-pointer relative items-center p-5 max-w-7xl mx-auto'>
            <div><Image src={logo} alt='logo' width={180} height={50} /></div>
            <div className='mx-[5rem]'>
              <ul className='flex space-x-6'>
                {['Contact us', 'Locations', 'Investor Relations', 'FAQs'].map((item, index) => (
                  <li key={index} className='text-[#03305c] font-bold hover:text-[#e8742c] text-sm 
                  '>{item}</li>
                ))}
                <div className='flex'>
                  <IoSearch size={24} />
                </div>
              </ul>
            </div>
            
            <div className='flex space-x-3 mr-5'>
              <button
                className='rounded-3xl px-4 py-1 bg-white text-[#03305c] border
               border-[#03305c] hover:border-[#e8742c] hover:text-[#e8742c] transition-colors 
               text-sm font-bold'
                onClick={() => {
                  setAuthType('login');
                  setShowAuthModal(true);
                }}
              >
                Login
              </button>
              <button className='rounded-3xl px-4 py-1 bg-white text-[#03305c] border
               border-[#03305c] hover:border-[#e8742c] hover:text-[#e8742c] transition-colors
                text-sm font-bold'>
                Enroll in online banking
              </button>
              <button
                className='rounded-2xl px-4 py-1 bg-[#03305c] hover:bg-[#e8742c]
               text-white transition-colors text-sm font-bold'
                onClick={() => {
                  setAuthType('signup');
                  setShowAuthModal(true);
                }}
              >
                Open an Account
              </button>
            </div>
          </nav>

          <div className="w-full">
            <div className="flex justify-center items-center px-6 py-3 max-w-7xl mx-auto">
              <ul className="flex space-x-8">
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    className='relative group'
                    onMouseEnter={() => !isMobile && setActiveDropdown(index)}
                    onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                  >
                    <button
                      className='font-bold text-xl hover:text-[#e8742c] text-[#03305c] flex items-center space-x-1 py-2'
                      onClick={() => toggleDropdown(index)}
                    >
                      <span>{item.title}</span>
                    </button>

                    {activeDropdown === index && (
                      <div className='absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-100'>
                        <div className='py-1'>
                          {item.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href="#"
                              className='block px-4 py-2 text-sm text-[#03305c] hover:bg-[#f5f5f5] hover:text-[#e8742c]'
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <nav className='flex justify-between items-center px-4 py-3'>
          <button onClick={() => setMenubar(!menubar)}>
            {menubar ? <ImCancelCircle className='text-2xl text-[#03305c]' /> : <GiHamburgerMenu className='text-2xl text-[#03305c]' />}
          </button>
          <div><Image src={logo} alt='logo' width={120} height={40} /></div>
          <button
            className='rounded-3xl px-3 py-1.5 bg-white text-[#03305c] border border-[#03305c] hover:border-[#e8742c] text-sm'
            onClick={() => {
              setAuthType('login');
              setShowAuthModal(true);
            }}
          >
            Login
          </button>
        </nav>
      )}

      {isMobile && menubar && (
        <div className='bg-white px-4 py-3 pt-[3rem] space-y-7 h-screen'>
          <button className='w-[70%] rounded-3xl py-3 bg-white text-[#03305c] border border-[#03305c] hover:border-[#e8742c] font-medium mb-2'>
            Open an Account
          </button>

          <ul className='space-y-2 pt-3'>
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className='w-full flex items-center justify-between font-bold text-lg hover:text-[#e8742c] text-[#03305c] py-2'
                  onClick={() => toggleDropdown(index)}
                >
                  <span>{item.title}</span>
                  {activeDropdown === index ? <FaAngleUp /> : <FaAngleDown />}
                </button>

                {activeDropdown === index && (
                  <ul className='pl-4 space-y-2 mt-2'>
                    {item.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href="#"
                          className='block py-1.5 text-[#03305c] hover:text-[#e8742c] text-sm'
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className='pt-8'>
            <ul className='space-y-5'>
              {['Contact us', 'Locations', 'Investor Relations', 'FAQs'].map((item, index) => (
                <li key={index} className='text-[#03305c] hover:text-[#e8742c] text-lg font-bold py-1'>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <IoSearch size={34} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
