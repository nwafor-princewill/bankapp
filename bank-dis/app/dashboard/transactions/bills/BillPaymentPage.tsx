'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Biller {
  id: string;
  name: string;
  category: string;
  accountNumber: string;
}

interface Account {
  accountNumber: string;
  balance: number;
  type: string;
}

export default function BillPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    billerId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: `BILL-${Date.now()}`
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch accounts
        const accountsRes = await fetch(`${API_URL}/api/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const accountsData = await accountsRes.json();
        if (accountsRes.ok) setAccounts(accountsData.accounts);

        // Fetch billers
        const billersRes = await fetch(`${API_URL}/api/billers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const billersData = await billersRes.json();
        if (billersRes.ok) setBillers(billersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bill-payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');

      toast.success(`Bill payment of $${formData.amount} processed!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Pay Bills</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">From Account</label>
          <select
            name="fromAccount"
            value={formData.fromAccount}
            onChange={(e) => setFormData({...formData, fromAccount: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.accountNumber} value={account.accountNumber}>
                {account.type} ••••{account.accountNumber.slice(-4)} (${account.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Biller</label>
          <select
            name="billerId"
            value={formData.billerId}
            onChange={(e) => setFormData({...formData, billerId: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Biller</option>
            {billers.map((biller) => (
              <option key={biller.id} value={biller.id}>
                {biller.name} ({biller.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount (USD)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-2 border rounded"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-[#03305c] hover:bg-[#e8742c]'
          }`}
        >
          {loading ? 'Processing...' : 'Pay Bill'}
        </button>
      </form>
    </div>
  );
}