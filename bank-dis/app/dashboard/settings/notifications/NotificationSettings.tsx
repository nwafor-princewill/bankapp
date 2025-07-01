'use client';
import { useState, useEffect } from 'react';
import { FiMail, FiBell, FiAlertCircle, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface NotificationPrefs {
  accountActivity: boolean;
  promotions: boolean;
  securityAlerts: boolean;
}

export default function NotificationSettings() {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    accountActivity: true,
    promotions: false,
    securityAlerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/settings/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmail(data.email);
      setPreferences(data.preferences);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      toast.success('Notification settings saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
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
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiBell className="mr-2" /> Notification Preferences
      </h1>

      <div className="space-y-6">
        <div>
          <p className="font-medium flex items-center mb-1">
            <FiMail className="mr-2" /> Notification Email
          </p>
          <p className="p-2 bg-gray-100 rounded">{email}</p>
          <p className="text-sm text-gray-500 mt-1">
            This is the email we'll send notifications to
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Email Notifications</h3>
          
          <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div>
              <p className="font-medium">Account Activity</p>
              <p className="text-sm text-gray-500">Transfers, payments, etc.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.accountActivity}
                onChange={() => setPreferences({
                  ...preferences,
                  accountActivity: !preferences.accountActivity
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03305c]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-gray-500">Login attempts, password changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.securityAlerts}
                onChange={() => setPreferences({
                  ...preferences,
                  securityAlerts: !preferences.securityAlerts
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03305c]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div>
              <p className="font-medium">Promotions</p>
              <p className="text-sm text-gray-500">Special offers, new features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.promotions}
                onChange={() => setPreferences({
                  ...preferences,
                  promotions: !preferences.promotions
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03305c]"></div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-[#03305c] text-white rounded hover:bg-[#e8742c]"
        >
          <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}