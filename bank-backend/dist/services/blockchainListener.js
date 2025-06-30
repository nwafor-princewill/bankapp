"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBlockchainListener = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const BLOCKCHAIN_API = 'https://blockstream.info/api';
const BANK_BTC_ADDRESS = 'bc1quu924ms2860tv59es2sqmdwkdj6me3tvrf5nmq';
const POLL_INTERVAL = 60000; // 1 minute
let lastCheckedBlock = 0;
const startBlockchainListener = () => {
    setInterval(async () => {
        try {
            // 1. Get latest block height
            const { data: blockHeight } = await axios_1.default.get(`${BLOCKCHAIN_API}/blocks/tip/height`);
            // 2. Only check new blocks
            if (blockHeight <= lastCheckedBlock)
                return;
            // 3. Get address transactions
            const { data: txs } = await axios_1.default.get(`${BLOCKCHAIN_API}/address/${BANK_BTC_ADDRESS}/txs`);
            // 4. Process new transactions
            for (const tx of txs) {
                // Check if transaction is already processed
                const exists = await Transaction_1.default.exists({ txid: tx.txid });
                if (exists)
                    continue;
                // Find matching user
                const user = await User_1.default.findOne({
                    'cryptoWallets.walletAddress': BANK_BTC_ADDRESS
                });
                if (user) {
                    // Save transaction record
                    const newTx = new Transaction_1.default({
                        userId: user._id,
                        txid: tx.txid,
                        amount: tx.value / 100000000,
                        confirmations: tx.status.confirmed ? 6 : 0,
                        timestamp: new Date(tx.status.block_time * 1000),
                        status: 'pending'
                    });
                    await newTx.save();
                    // Update user balance
                    await User_1.default.updateOne({ _id: user._id }, { $inc: { 'cryptoWallets.$[elem].balance': tx.value / 100000000 } }, { arrayFilters: [{ 'elem.walletAddress': BANK_BTC_ADDRESS }] });
                }
            }
            lastCheckedBlock = blockHeight;
        }
        catch (error) {
            console.error('Blockchain listener error:', error);
        }
    }, POLL_INTERVAL);
};
exports.startBlockchainListener = startBlockchainListener;
const processTransaction = async (tx) => {
    // ... existing processing logic
    await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
    });
};
