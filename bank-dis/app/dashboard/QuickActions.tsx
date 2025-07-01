import React from 'react';
import { useRouter } from 'next/navigation';
import { FaExchangeAlt, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { MdPayment, MdReceipt } from 'react-icons/md';

interface QuickActionsProps {
  accountNumber: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ accountNumber }) => {
  const router = useRouter();

  const actions = [
    { 
      icon: <FaExchangeAlt size={20} />, 
      label: 'Transfer',
      color: 'bg-blue-100 text-blue-600',
      onClick: () => router.push('/dashboard/transactions/transfer')
    },
    { 
      icon: <MdPayment size={20} />, 
      label: 'Pay Bills',
      color: 'bg-green-100 text-green-600',
      onClick: () => router.push('/dashboard/transactions/bills')
    },
    { 
      icon: <FaMoneyBillWave size={20} />, 
      label: 'Redeem',
      color: 'bg-purple-100 text-purple-600',
      onClick: () => router.push('/dashboard/transactions/redeem')
    },
    { 
      icon: <FaCreditCard size={20} />, 
      label: 'Card',
      color: 'bg-yellow-100 text-yellow-600',
      onClick: () => router.push('/dashboard/transactions/card')
    },
    { 
      icon: <MdReceipt size={20} />, 
      label: 'Statements',
      color: 'bg-red-100 text-red-600',
      onClick: () => router.push('/dashboard/statements')
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-[#03305c] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} hover:opacity-90 transition-opacity`}
            onClick={action.onClick}
          >
            <span className="mb-2">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;