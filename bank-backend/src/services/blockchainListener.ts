import axios from 'axios';
import User from '../models/User';
import Transaction from '../models/Transaction';

const BLOCKCHAIN_API = 'https://blockstream.info/api';
const BANK_BTC_ADDRESS = 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
const POLL_INTERVAL = 60000; // 1 minute

let lastCheckedBlock = 0;

export const startBlockchainListener = () => {
  setInterval(async () => {
    try {
      // 1. Get latest block height
      const { data: blockHeight } = await axios.get(`${BLOCKCHAIN_API}/blocks/tip/height`);
      
      // 2. Only check new blocks
      if (blockHeight <= lastCheckedBlock) return;
      
      // 3. Get address transactions
      const { data: txs } = await axios.get(
        `${BLOCKCHAIN_API}/address/${BANK_BTC_ADDRESS}/txs`
      );

      // 4. Process new transactions
      for (const tx of txs) {
        // Check if transaction is already processed
        const exists = await Transaction.exists({ txid: tx.txid });
        if (exists) continue;

        // Find matching user
        const user = await User.findOne({
          'cryptoWallets.walletAddress': BANK_BTC_ADDRESS
        });

        if (user) {
          // Save transaction record
          const newTx = new Transaction({
            userId: user._id,
            txid: tx.txid,
            amount: tx.value / 100000000, // Convert satoshis to BTC
            confirmations: tx.status.confirmed ? 6 : 0,
            timestamp: new Date(tx.status.block_time * 1000),
            status: 'pending'
          });
          await newTx.save();

          // Update user balance
          await User.updateOne(
            { _id: user._id },
            { $inc: { 'cryptoWallets.$[elem].balance': tx.value / 100000000 } },
            { arrayFilters: [{ 'elem.walletAddress': BANK_BTC_ADDRESS }] }
          );
        }
      }

      lastCheckedBlock = blockHeight;
    } catch (error) {
      console.error('Blockchain listener error:', error);
    }
  }, POLL_INTERVAL);
};

const processTransaction = async (tx: { // Inline type definition
  txid: string;
  address: string; 
  amount: number;
  confirmations: number;
  timestamp: Date;
}) => {
  // ... existing processing logic
    await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
};