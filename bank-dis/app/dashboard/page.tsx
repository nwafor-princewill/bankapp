'use client'; 

import React, { useEffect, useState } from 'react';
import AccountSummary from './AccountSummary';
import QuickActions from './QuickActions';
// import RecentTransactions from './RecentTransactions';
import AccountCard from './AccountCard';
import CryptoTransactions from './crypto/CryptoTransactions';
import CryptoSummary from './crypto/CryptoSummary';
import SendBTC from './crypto/SendBTC';
import TransactionHistory from './TransactionHistory';

interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accounts: {
    accountNumber: string;
    accountName: string;
    accountType: string;
    balance: number;
    currency: string;
    iban?: string;
    routingNumber?: string;
    openingDate: string;
  }[];
}

const DashboardPage = () => {
  const [accountData, setAccountData] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('https://bank-backend-eagz.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        
        // **FIXED LINE:** The API returns { user: {...} }, so we need to extract the 'user' object.
        const data = await response.json();
        setAccountData(data.user); 

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03305c]"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  // Default fallback data
  const defaultAccount = {
    accountNumber: '0000000000',
    accountName: 'TEST ACCOUNT',
    accountType: 'Checking',
    balance: 1000.00,
    currency: 'USD',
    iban: 'US00AMAL0010000000000',
    routingNumber: '021000021',
    openingDate: new Date().toISOString().split('T')[0]
  };

  // This line will now work correctly because accountData is the user object.
  const primaryAccount = (accountData?.accounts && accountData.accounts.length > 0) 
    ? accountData.accounts[0] 
    : defaultAccount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#03305c]">
        Welcome back, {accountData?.firstName} {accountData?.lastName}!
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <AccountCard 
            accountNumber={primaryAccount.accountNumber}
            accountName={primaryAccount.accountName}
            accountType={primaryAccount.accountType}
            balance={primaryAccount.balance}
            currency={primaryAccount.currency}
            iban={primaryAccount.iban}
            routingNumber={primaryAccount.routingNumber}
            openingDate={primaryAccount.openingDate}
          />
          <CryptoSummary />
          <SendBTC />
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccountSummary accountNumber={primaryAccount.accountNumber} />
            <QuickActions accountNumber={primaryAccount.accountNumber} />
              <TransactionHistory accountNumber={primaryAccount.accountNumber} />
            
          </div>
          
          <CryptoTransactions />
          {/* <RecentTransactions accountNumber={primaryAccount.accountNumber} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
