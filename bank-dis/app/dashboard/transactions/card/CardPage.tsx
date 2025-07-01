'use client';
import { useState, useEffect } from 'react';
import { FiCreditCard, FiLock, FiEye, FiEyeOff, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Card {
  cardId: string;
  lastFour: string;
  cardType: string;
  expiry: string;
  status: 'active' | 'locked' | 'lost';
  showDetails?: boolean;
}

export default function CardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bank-backend-eagz.onrender.com/api/cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCards(data.map((card: Card) => ({ ...card, showDetails: false })));
    } catch (err) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = async (action: string, cardId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'lock') {
        const response = await fetch(`https://bank-backend-eagz.onrender.com/api/cards/${cardId}/lock`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setCards(cards.map(card => 
            card.cardId === cardId 
              ? { ...card, status: result.status } 
              : card
          ));
          toast.success(`Card ${result.status}`);
        }
      } else {
        // Implement other actions as needed
        toast.info(`${action} action sent`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <FiRefreshCw className="animate-spin text-2xl text-[#03305c]" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiCreditCard className="mr-2" /> Card Management
      </h1>

      <div className="space-y-4">
        {cards.length === 0 ? (
          <p className="text-gray-500">No cards found</p>
        ) : (
          cards.map(card => (
            <div key={card.cardId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium flex items-center">
                    {card.cardType} •••• {card.lastFour}
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      card.status === 'active' ? 'bg-green-100 text-green-800' :
                      card.status === 'locked' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {card.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                </div>
                <button 
                  onClick={() => setCards(cards.map(c => 
                    c.cardId === card.cardId 
                      ? { ...c, showDetails: !c.showDetails } 
                      : c
                  ))}
                  className="text-[#03305c] hover:text-[#e8742c]"
                >
                  {card.showDetails ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {card.showDetails && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <FiLock className="mr-2" />
                    <span>Click actions below to manage</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleCardAction('lock', card.cardId)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      {card.status === 'active' ? 'Lock Card' : 'Unlock Card'}
                    </button>
                    <button
                      onClick={() => handleCardAction('replace', card.cardId)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      Replace Card
                    </button>
                    {card.status !== 'lost' && (
                      <button
                        onClick={() => handleCardAction('report', card.cardId)}
                        className="px-3 py-1 text-sm border rounded hover:bg-red-100 text-red-600 flex items-center"
                      >
                        <FiAlertTriangle className="mr-1" /> Report Lost
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        <button 
          className="mt-6 px-4 py-2 bg-[#03305c] text-white rounded hover:bg-[#e8742c]"
          onClick={() => toast.info('Card request submitted')}
        >
          + Request New Card
        </button>
      </div>
    </div>
  );
}