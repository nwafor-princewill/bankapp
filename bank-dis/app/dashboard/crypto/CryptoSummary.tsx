'use client';
import React, { useEffect, useState } from 'react';
import { FaBitcoin } from 'react-icons/fa';

export default function CryptoSummary() {
  const [data, setData] = useState<{
    btcBalance: number;
    btcAddress: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/crypto/summary');
      setData(await res.json());
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold flex items-center">
        <FaBitcoin className="mr-2 text-orange-500" /> 
        Bitcoin Summary
      </h3>
      {data ? (
        <div className="mt-2">
          <p>Balance: <span className="font-mono">{data.btcBalance} BTC</span></p>
          <p className="text-sm text-gray-500 truncate">
            Address: {data.btcAddress}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}