// bank-backend/src/routes/cryptoRoutes.ts

import { Router } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
// Import the real CryptoTransaction model
import CryptoTransaction from '../models/CryptoTransaction';

const router = Router();

// --- GET ROUTES (for reading data) ---

// @route   GET /api/crypto/wallets
router.get('/wallets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('cryptoWallets');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.cryptoWallets || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/crypto/transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await CryptoTransaction.find({ userId: req.user?.id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching crypto transactions:", error);
        res.status(500).json({ message: "Server error fetching transactions" });
    }
});

// @route   GET /api/crypto/summary
router.get('/summary', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const btcBalance = user.cryptoWallets
            .filter(w => w.currency === 'BTC')
            .reduce((total, wallet) => total + wallet.balance, 0);
        const primaryWallet = user.cryptoWallets.find(w => w.currency === 'BTC');
        res.json({
            btcBalance: btcBalance,
            btcAddress: primaryWallet ? primaryWallet.walletAddress : 'No BTC wallet found'
        });
    } catch (error) {
        console.error("Error fetching crypto summary:", error);
        res.status(500).json({ message: "Server error fetching summary" });
    }
});


// --- POST ROUTES (for writing data) ---

// @route   POST /api/crypto/wallets
router.post('/wallets', auth, async (req, res) => {
    try {
        const { walletAddress, currency, label } = req.body;
        if (!walletAddress || !currency) {
            return res.status(400).json({ message: 'Wallet address and currency are required.' });
        }
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const walletExists = user.cryptoWallets.some(w => w.walletAddress === walletAddress);
        if (walletExists) {
            return res.status(400).json({ message: 'This wallet address has already been added.' });
        }
        user.cryptoWallets.push({ walletAddress, currency, label, balance: 0, isBankManaged: false });
        await user.save();
        res.status(201).json(user.cryptoWallets);
    } catch (error) {
        console.error("Error adding wallet:", error);
        res.status(500).json({ message: "Server error while adding wallet" });
    }
});

// **NEW PRODUCTION-READY ROUTE**
// @route   POST /api/crypto/transactions
// @desc    Manually add a crypto transaction (e.g., for tracking external transfers)
router.post('/transactions', auth, async (req, res) => {
    try {
        const { walletAddress, txid, amount, type, timestamp } = req.body;

        // Basic validation
        if (!walletAddress || !txid || !amount || !type || !timestamp) {
            return res.status(400).json({ message: 'Missing required transaction fields.' });
        }

        // Check if a transaction with this txid already exists to prevent duplicates
        const txExists = await CryptoTransaction.findOne({ txid });
        if (txExists) {
            return res.status(400).json({ message: 'Transaction with this TXID already exists.' });
        }

        // Use the new model to create a document in the database
        const newTransaction = await CryptoTransaction.create({
            userId: req.user?.id,
            walletAddress,
            txid,
            amount: Number(amount),
            type,
            timestamp: new Date(timestamp),
            confirmations: 0, // Assume it's unconfirmed initially
            status: 'pending'
        });

        res.status(201).json(newTransaction);

    } catch (error) {
        console.error("Error creating crypto transaction:", error);
        res.status(500).json({ message: "Server error while creating transaction" });
    }
});


export default router;
