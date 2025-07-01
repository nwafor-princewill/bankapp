import React from 'react';

const ForexRates = () => {
  const rates = [
    { currency: 'USD', buy: 1.0, sell: 1.0 },
    { currency: 'EUR', buy: 0.85, sell: 0.83 },
    { currency: 'GBP', buy: 0.72, sell: 0.70 },
    { currency: 'JPY', buy: 110.5, sell: 108.5 },
    { currency: 'AUD', buy: 1.35, sell: 1.32 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Foreign Exchange Rates</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buy Rate</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sell Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rates.map((rate, index) => (
              <tr key={index}>
                <td className="px-4 py-2 whitespace-nowrap">{rate.currency}</td>
                <td className="px-4 py-2 whitespace-nowrap">{rate.buy}</td>
                <td className="px-4 py-2 whitespace-nowrap">{rate.sell}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-4 text-sm text-[#03305c] hover:text-[#e8742c]">
        View All Rates
      </button>
    </div>
  );
};

export default ForexRates;