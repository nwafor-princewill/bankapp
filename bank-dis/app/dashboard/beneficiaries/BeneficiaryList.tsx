'use client';
import { useState, useEffect } from 'react';
import { FiTrash2, FiEdit, FiPlus } from 'react-icons/fi';
import AddBeneficiaryForm from './AddBeneficiaryForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Beneficiary {
  _id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  email?: string;
  phone?: string;
  nickname?: string;
}

export default function BeneficiaryList() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchBeneficiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/beneficiaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBeneficiaries(data);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/beneficiaries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBeneficiaries();
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Beneficiary Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#03305c] text-white px-4 py-2 rounded hover:bg-[#e8742c]"
        >
          <FiPlus /> Add Beneficiary
        </button>
      </div>

      {showForm && (
        <AddBeneficiaryForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchBeneficiaries();
          }} 
        />
      )}

      <div className="space-y-4">
        {beneficiaries.length === 0 ? (
          <p className="text-gray-500">No beneficiaries added yet</p>
        ) : (
          beneficiaries.map(beneficiary => (
            <div key={beneficiary._id} className="border p-4 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{beneficiary.name}</h3>
                  <p className="text-sm text-gray-600">{beneficiary.bankName}</p>
                  <p className="text-sm font-mono">{beneficiary.accountNumber}</p>
                  {beneficiary.nickname && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {beneficiary.nickname}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-500 hover:text-blue-500">
                    <FiEdit />
                  </button>
                  <button 
                    onClick={() => deleteBeneficiary(beneficiary._id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}