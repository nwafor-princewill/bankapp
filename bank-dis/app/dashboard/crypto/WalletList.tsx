'use client';
import React, { useEffect, useState } from 'react';
import { FaBitcoin, FaCopy, FaTrash } from 'react-icons/fa';

interface Wallet {
  _id: string;
  walletAddress: string;
  currency: string;
  balance: number;
  label?: string;
}

const WalletList = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://bank-backend-eagz.onrender.com/api/crypto/wallets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setWallets(data);
      } catch (err) {
        console.error('Error fetching wallets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm('Are you sure you want to remove this wallet?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://bank-backend-eagz.onrender.com/api/crypto/wallets/${walletId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setWallets(wallets.filter(w => w._id !== walletId));
      }
    } catch (err) {
      console.error('Error deleting wallet:', err);
    }
  };

  if (loading) return <div className="text-center py-4">Loading wallets...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-[#03305c] mb-4">
        Your Bitcoin Wallets
      </h3>
      
      {wallets.length === 0 ? (
        <p className="text-gray-500">No wallets added yet</p>
      ) : (
        <div className="space-y-4">
          {wallets.filter(w => w.currency === 'BTC').map(wallet => (
            <div key={wallet._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <FaBitcoin className="text-orange-500 mr-2" />
                    <h4 className="font-medium">{wallet.label || 'Bitcoin Wallet'}</h4>
                  </div>
                  <div className="flex items-center mt-2">
                    <p className="text-sm font-mono bg-gray-100 p-1 rounded">
                      {wallet.walletAddress}
                    </p>
                    <button 
                      onClick={() => handleCopy(wallet.walletAddress)}
                      className="ml-2 text-gray-500 hover:text-[#03305c]"
                      title="Copy address"
                    >
                      <FaCopy />
                    </button>
                    {copied === wallet.walletAddress && (
                      <span className="ml-2 text-xs text-green-500">Copied!</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{wallet.balance} BTC</p>
                  <button 
                    onClick={() => handleDelete(wallet._id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletList;