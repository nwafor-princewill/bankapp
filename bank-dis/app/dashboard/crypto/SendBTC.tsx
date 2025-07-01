'use client';
import React from 'react';
import { FaBitcoin, FaCopy } from 'react-icons/fa';

export default function SendBTC() {
  const bankAddress = 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq'; // Your address

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold flex items-center mb-4">
        <FaBitcoin className="mr-2 text-orange-500" />
        Deposit Bitcoin
      </h3>
      <div className="space-y-3">
        <p className="text-sm">
          Send BTC to this bank-managed address:
        </p>
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="font-mono text-sm break-all">{bankAddress}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(bankAddress);
              alert('Address copied!');
            }}
            className="text-xs text-blue-500 hover:text-blue-700 mt-2 flex items-center"
          >
            <FaCopy className="mr-1" /> Copy Address
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Transactions typically appear after 3-6 confirmations (~30 mins)
        </p>
      </div>
    </div>
  );
}