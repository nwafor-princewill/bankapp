'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const requestTypes = [
  'Account Freeze',
  'Account Unfreeze',
  'Update Personal Info',
  'Report Issue',
  'Other'
];

export default function MaintenanceForm() {
  const [formData, setFormData] = useState({
    accountNumber: '',
    requestType: requestTypes[0],
    details: ''
  });
  const [accounts, setAccounts] = useState<Array<{accountNumber: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/accounts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/account-maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Request submitted successfully!');
      setFormData({
        accountNumber: '',
        requestType: requestTypes[0],
        details: ''
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Account Maintenance Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Account</label>
          <select
            value={formData.accountNumber}
            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.accountNumber} value={account.accountNumber}>
                ••••{account.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Request Type</label>
          <select
            value={formData.requestType}
            onChange={(e) => setFormData({...formData, requestType: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            {requestTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <textarea
            value={formData.details}
            onChange={(e) => setFormData({...formData, details: e.target.value})}
            className="w-full p-2 border rounded min-h-[120px]"
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
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}