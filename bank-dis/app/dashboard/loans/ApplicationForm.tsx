'use client';
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface ApplicationFormProps {
  product: {
    _id: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    term?: string;
  };
  onClose: () => void;
}

export default function ApplicationForm({ product, onClose }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    amount: product.minAmount,
    term: product.term || '12 months',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Application failed');

      toast.success('Your loan application has been received! It will be ready in 2 weeks.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Application failed', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>

        <h3 className="text-xl font-bold mb-2">Apply for {product.name}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (${product.minAmount} - ${product.maxAmount})
            </label>
            <input
              type="number"
              min={product.minAmount}
              max={product.maxAmount}
              value={formData.amount}
              onChange={(e) => setFormData({
                ...formData,
                amount: parseFloat(e.target.value)
              })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {product.term && (
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({...formData, term: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="12 months">12 months</option>
                <option value="24 months">24 months</option>
                <option value="36 months">36 months</option>
                <option value="60 months">60 months</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white ${
              loading ? 'bg-gray-400' : 'bg-[#03305c] hover:bg-[#e8742c]'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}