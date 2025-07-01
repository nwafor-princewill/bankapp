'use client';
import { useState } from 'react';
import { FaPiggyBank, FaHandHoldingUsd, FaChartLine } from 'react-icons/fa';
import ApplicationForm from './ApplicationForm';

interface Product {
  _id: string;
  name: string;
  type: 'loan' | 'investment' | 'service';
  description: string;
  interestRate?: number;
  minAmount: number;
  maxAmount: number;
  term: string;
  features: string[];
}

export default function ProductCard({ product }: { product: Product }) {
  const [showForm, setShowForm] = useState(false);
  
  const getIcon = () => {
    switch(product.type) {
      case 'loan': return <FaHandHoldingUsd className="text-blue-500" />;
      case 'investment': return <FaChartLine className="text-green-500" />;
      default: return <FaPiggyBank className="text-purple-500" />;
    }
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getIcon()}</div>
          <h3 className="text-xl font-bold">{product.name}</h3>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
          {product.type}
        </span>
      </div>
      
      <p className="my-3 text-gray-600">{product.description}</p>
      
      {product.interestRate && (
        <div className="flex gap-4 my-2">
          <span className="text-sm">
            <strong>Rate:</strong> {product.interestRate}%
          </span>
          <span className="text-sm">
            <strong>Term:</strong> {product.term}
          </span>
        </div>
      )}
      
      <div className="mt-4">
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-2 px-4 bg-[#03305c] text-white rounded hover:bg-[#e8742c]"
        >
          Apply Now
        </button>
      </div>

      {showForm && (
        <ApplicationForm 
          product={product} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}