'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
};

const securityQuestions = [
  "What was your first pet's name?",
  "What city were you born in?",
  "What was your first school name?",
  "What's your mother's maiden name?"
];

export default function SecurityForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [activeTab, setActiveTab] = useState<'password' | 'security'>('password');
  const [updating, setUpdating] = useState(false);

  const onSubmit = async (data: FormData) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'password' 
        ? '/api/settings/security/password' 
        : '/api/settings/security/question';

      const response = await fetch(`https://bank-backend-eagz.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activeTab === 'password' ? {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        } : {
          question: data.securityQuestion,
          answer: data.securityAnswer
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Update failed');

      toast.success('Security settings updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'password' ? 'text-[#03305c] border-b-2 border-[#03305c]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'security' ? 'text-[#03305c] border-b-2 border-[#03305c]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          Security Question
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {activeTab === 'password' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                {...register('currentPassword', { required: 'Current password is required' })}
                className="w-full p-2 border rounded"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full p-2 border rounded"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  validate: value => 
                    value === watch('newPassword') || 'Passwords do not match'
                })}
                className="w-full p-2 border rounded"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Security Question</label>
              <select
                {...register('securityQuestion', { required: 'Question is required' })}
                className="w-full p-2 border rounded"
              >
                {securityQuestions.map((q, i) => (
                  <option key={i} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <input
                type="text"
                {...register('securityAnswer', { required: 'Answer is required' })}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={updating}
          className={`w-full py-2 px-4 rounded text-white ${
            updating ? 'bg-gray-400' : 'bg-[#03305c] hover:bg-[#e8742c]'
          }`}
        >
          {updating ? 'Updating...' : 'Update Security Settings'}
        </button>
      </form>
    </div>
  );
}