'use client';
import React, { useEffect, useState } from 'react';
import { FaBitcoin, FaExchangeAlt, FaCheck, FaClock } from 'react-icons/fa';

interface Transaction {
  _id: string; // Add _id for a unique key, as txid might not be unique across different chains/tests
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: string;
  status: 'pending' | 'completed';
}

const CryptoTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // **FIX 1: Get the token from localStorage**
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        // **FIX 2: Send the token in the Authorization header**
        const res = await fetch('/api/crypto/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // **FIX 3: Check if the response was successful**
        if (!res.ok) {
          const errorData = await res.json();
          // Throw an error with the message from the API
          throw new Error(errorData.message || `Error: ${res.status}`);
        }
        
        const data = await res.json();

        // **FIX 4: Final safety check to ensure data is an array**
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          // This prevents the .map() error if the API unexpectedly returns a non-array
          console.error('API did not return an array for transactions:', data);
          throw new Error('Received invalid data format from server.');
        }

      } catch (err) {
        // Set the error state to display a message to the user
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []); // The empty array ensures this effect runs only once

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-[#03305c] mb-4 flex items-center">
        <FaExchangeAlt className="mr-2" />
        Bitcoin Transaction History
      </h3>
      
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading transactions...</div>
      ) : error ? (
        // Display the error message if something went wrong
        <div className="text-center py-4 text-red-500 bg-red-50 p-3 rounded-md">{error}</div>
      ) : transactions.length === 0 ? (
        <p className="text-center py-4 text-gray-500">No transactions found</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            // Use tx._id as the key for guaranteed uniqueness
            <div key={tx._id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <FaBitcoin className={`mr-2 ${
                    tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">
                      {tx.amount > 0 ? 'Received' : 'Sent'} BTC
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(8)}
                  </p>
                  <div className="flex items-center justify-end text-xs mt-1">
                    {tx.confirmations >= 6 ? (
                      <span className="text-green-500 flex items-center">
                        <FaCheck className="mr-1" /> Confirmed
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center">
                        <FaClock className="mr-1" /> Pending ({tx.confirmations}/6)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-400 truncate mt-1">
                TXID: {tx.txid}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoTransactions;
