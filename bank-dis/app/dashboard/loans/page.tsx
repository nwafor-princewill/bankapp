'use client';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Product {
  _id: string;
  name: string;
  type: 'loan' | 'investment' | 'service'; // Make this match exactly
  description: string;
  interestRate?: number;
  minAmount: number;
  maxAmount: number;
  term: string;
  features: string[];
}

export default function LoansInvestmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'loan' | 'investment' | 'service'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/loans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.type === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Services, Loans & Investments</h1>
      
      <div className="flex gap-2 mb-6">
        {['all', 'loan', 'investment', 'service'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === type 
                ? 'bg-[#03305c] text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}