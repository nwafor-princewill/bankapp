'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiDollarSign, FiCreditCard, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    btcAddress: ''
  });
  const [creditForm, setCreditForm] = useState({
    userEmail: '',
    accountNumber: '',
    amount: '',
    description: 'Admin credit'
  });
  const [newBtcAddress, setNewBtcAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Try to access admin stats to verify admin access
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }

      if (response.status === 401) {
        toast.error('Please log in');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsAdmin(true);
      fetchAdminData();
    } catch (err) {
      console.error('Admin access check failed:', err);
      toast.error('Failed to verify admin access');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching admin data with token:', token ? 'Token exists' : 'No token');
      
      const [statsRes, usersRes] = await Promise.all([
        fetch('https://bank-backend-eagz.onrender.com/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://bank-backend-eagz.onrender.com/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      console.log('Stats response status:', statsRes.status);
      console.log('Users response status:', usersRes.status);
      
      if (!statsRes.ok) {
        console.error('Stats API error:', await statsRes.text());
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }
      
      if (!usersRes.ok) {
        console.error('Users API error:', await usersRes.text());
        throw new Error(`Users API failed: ${usersRes.status}`);
      }
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      console.log('Stats data:', statsData);
      console.log('Users data:', usersData);
      
      setStats({
        totalUsers: statsData.users,
        activeUsers: statsData.activeUsers,
        totalBalance: statsData.totalBalance || 0,
        btcAddress: statsData.btcAddress
      });
      setUsers(usersData);
      setNewBtcAddress(statsData.btcAddress); // Set current BTC address in form
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load admin data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/admin/credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(creditForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setCreditForm({
        userEmail: '',
        accountNumber: '',
        amount: '',
        description: 'Admin credit'
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credit failed');
    }
  };

  const handleBtcUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/admin/update-btc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newAddress: newBtcAddress })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchAdminData(); // Refresh to show updated BTC address
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'BTC address update failed');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <FiUsers className="text-blue-500 mr-2" size={20} />
            <span className="font-medium">Total Users</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <FiUsers className="text-green-500 mr-2" size={20} />
            <span className="font-medium">Active Users</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.activeUsers}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <FiDollarSign className="text-yellow-500 mr-2" size={20} />
            <span className="font-medium">Total Balance</span>
          </div>
          <p className="text-2xl font-bold mt-2">${stats.totalBalance.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <FiCreditCard className="text-purple-500 mr-2" size={20} />
            <span className="font-medium">BTC Address</span>
          </div>
          <p className="text-sm mt-2 break-all">{stats.btcAddress}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded ${
            activeTab === 'users' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-4 py-2 rounded ${
            activeTab === 'credit' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Credit Account
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded ${
            activeTab === 'settings' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FiSettings className="inline mr-1" />
          Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Account Numbers</th>
                  <th className="text-left p-2">Total Balance</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{user.firstName} {user.lastName}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {user.accounts?.length > 0 ? (
                        <div className="space-y-1">
                          {user.accounts.map((acc: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {acc.accountNumber}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No accounts</span>
                      )}
                    </td>
                    <td className="p-2">
                      {user.accounts?.length > 0 ? (
                        <div className="space-y-1">
                          {user.accounts.map((acc: any, idx: number) => (
                            <div key={idx} className="text-sm font-medium">
                              ${acc.balance?.toLocaleString() || '0'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">$0</span>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isAdmin 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'credit' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Credit User Account</h2>
          <form onSubmit={handleCreditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User Email</label>
              <input
                type="email"
                value={creditForm.userEmail}
                onChange={(e) => setCreditForm({...creditForm, userEmail: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={creditForm.accountNumber}
                onChange={(e) => setCreditForm({...creditForm, accountNumber: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="1234567890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={creditForm.amount}
                onChange={(e) => setCreditForm({...creditForm, amount: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={creditForm.description}
                onChange={(e) => setCreditForm({...creditForm, description: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Admin credit adjustment"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Credit Account
            </button>
          </form>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Bitcoin Address Management</h3>
              <form onSubmit={handleBtcUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current BTC Address
                  </label>
                  <p className="text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded break-all">
                    {stats.btcAddress}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New BTC Address
                  </label>
                  <input
                    type="text"
                    value={newBtcAddress}
                    onChange={(e) => setNewBtcAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="bc1q..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This address will be shown to users for Bitcoin deposits
                  </p>
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Update BTC Address
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}