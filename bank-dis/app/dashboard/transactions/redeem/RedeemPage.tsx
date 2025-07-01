'use client';
import { useState, useEffect } from 'react';
import { FiGift, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const rewards = [
  { id: 'gift50', name: '$50 Gift Card', points: 500 },
  { id: 'cash20', name: '$20 Cash Credit', points: 250 },
  { id: 'fee-waiver', name: 'Account Fee Waiver', points: 300 },
];

export default function RedeemPage() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/redeem/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      toast.error('Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string, points: number) => {
    setRedeeming(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: points,
          reward: rewards.find(r => r.id === rewardId)?.name
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(`Success! ${data.message}`);
      setBalance(data.newBalance);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiGift className="mr-2" /> Redemption Center
      </h1>

      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-medium flex items-center">
          <FiDollarSign className="mr-2" />
          Your Points: {loading ? 'Loading...' : balance}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
            <p className="text-gray-600 mb-4">{reward.points} points</p>
            <button
              onClick={() => handleRedeem(reward.id, reward.points)}
              disabled={loading || redeeming || balance < reward.points}
              className={`w-full py-2 px-4 rounded flex items-center justify-center ${
                balance < reward.points 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#03305c] hover:bg-[#e8742c] text-white'
              }`}
            >
              {redeeming ? 'Processing...' : (
                <>
                  <FiCheckCircle className="mr-2" />
                  Redeem
                </>
              )}
            </button>
            {balance < reward.points && (
              <p className="text-red-500 text-sm mt-2">Not enough points</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}