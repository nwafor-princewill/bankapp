import React, { useEffect, useState } from 'react';

interface AccountSummaryData {
  currentBalance: number;
  availableBalance: number;
  currency: string;
  monthlyStats: {
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
  };
  lastTransactionDate: string;
}

interface AccountSummaryProps {
  accountNumber: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AccountSummary: React.FC<AccountSummaryProps> = ({ accountNumber }) => {
  const [summary, setSummary] = useState<AccountSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${API_URL}/api/accounts/summary?accountNumber=${encodeURIComponent(accountNumber)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Check for HTML response (like 404 pages)
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Server returned: ${text.substring(0, 100)}`);
        }

        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch account summary');
        }

        setSummary(result.data);
        setError(null);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // Fallback data
        setSummary({
          currentBalance: 1000,
          availableBalance: 1000,
          currency: 'USD',
          monthlyStats: {
            totalDeposits: 2500,
            totalWithdrawals: 1500,
            netChange: 1000
          },
          lastTransactionDate: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [accountNumber]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

    if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
        <div className="text-red-500">
          Error: {error}
          {summary && (
            <div className="text-yellow-600 mt-2">
              Showing fallback data
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
      
      {summary ? (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Primary Account</h3>
                <p className="text-sm text-gray-500">{accountNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {summary.currency} {summary.availableBalance.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
                <p className={`text-sm ${
                  summary.monthlyStats.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.monthlyStats.netChange >= 0 ? '+' : ''}
                  {summary.monthlyStats.netChange.toFixed(2)} this month
                </p>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="text-sm bg-[#03305c] text-white px-3 py-1 rounded hover:bg-[#e8742c] transition-colors">
                Transfer
              </button>
              <button className="text-sm border border-[#03305c] text-[#03305c] px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                Details
              </button>
            </div>
          </div>

          {/* Additional summary details */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Deposits</p>
              <p className="font-medium text-green-600">
                +{summary.currency} {summary.monthlyStats.totalDeposits.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Withdrawals</p>
              <p className="font-medium text-red-600">
                -{summary.currency} {summary.monthlyStats.totalWithdrawals.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Last Activity</p>
              <p className="font-medium">
                {new Date(summary.lastTransactionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-red-500">Failed to load account summary</div>
      )}
    </div>
  );
};

export default AccountSummary;