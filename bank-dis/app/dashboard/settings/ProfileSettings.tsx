'use client';
import { useState, useEffect } from 'react';
import { FiUser, FiSave, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  accounts?: {
    accountNumber: string;
    accountName: string;
  }[];
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/settings/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#03305c]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUser className="mr-2" /> Account Settings
        </h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-3 py-1 border rounded text-[#03305c] hover:bg-gray-100"
          >
            <FiEdit className="mr-1" /> Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-3 py-1 bg-[#03305c] text-white rounded hover:bg-[#e8742c]"
          >
            <FiSave className="mr-1" /> {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            className="w-full p-2 border rounded"
            disabled={!editing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            className="w-full p-2 border rounded"
            disabled={!editing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full p-2 border rounded"
            disabled={!editing}
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Linked Accounts</h3>
          <div className="space-y-2">
            {profile.accounts?.map(account => (
              <div key={account.accountNumber} className="flex items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium">{account.accountName}</p>
                  <p className="text-sm text-gray-500">{account.accountNumber}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}