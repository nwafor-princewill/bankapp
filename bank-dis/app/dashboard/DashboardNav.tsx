'use client';
import React, { useEffect, useState } from 'react';
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

const DashboardNav = () => {
  // **FIX:** Moved the hooks inside the component function.
  const [userName, setUserName] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // This code now runs correctly within the component's lifecycle.
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.firstName) {
        setUserName(`${user.firstName} ${user.lastName}`);
      }
    }
  }, []); // Empty dependency array means this runs once when the component mounts.

  const currentPage = pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800 capitalize">
          {currentPage}
        </h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-[#03305c]">
            <FiSearch size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-[#03305c] relative">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#03305c] flex items-center justify-center text-white">
              <FiUser size={18} />
            </div>
            <span className="text-sm font-medium">{userName || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;

// By moving the hooks inside the component, you are following the Rules of Hooks, and the error will be resolved. Your `layout.tsx` file is perfectly fine and does not need any chang