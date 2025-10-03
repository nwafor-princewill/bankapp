# ZenaTrust Bank - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A robust banking API backend built with Node.js, Express, TypeScript, and MongoDB. Features include user authentication, account management, transfers, crypto wallets, and comprehensive security measures.

![ZenaTrust Backend Architecture](https://via.placeholder.com/800x400/03305c/ffffff?text=ZenaTrust+Backend+API)

## Features

**Authentication & Authorization**
- JWT-based authentication
- Email verification with OTP
- Password reset functionality
- Secure session management

**User Management**
- Complete user profiles
- ID document verification (Passport, National ID, Driver's License)
- Profile picture upload
- Security questions for account recovery

**Banking Operations**
- Multi-currency account support (20+ currencies)
- Internal and external transfers
- Transaction history with search and filtering
- Transfer PIN protection
- OTP verification for sensitive operations

**Crypto Integration**
- Cryptocurrency wallet management
- Buy/sell crypto operations
- Multi-wallet support

**Cards**
- Virtual card management
- Card status control (active/locked/lost)

**Loan System**
- Loan application processing
- Email notifications to administrators

**Admin Features**
- User management (block/unblock users)
- Credit user accounts
- Debit user accounts
- Delete user accounts
- Transaction oversight
- Account balance adjustments
- System-wide analytics
- View all transactions
- User activity monitoring

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn
- Resend API key for email services

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nwafor-princewill/bankapp.git
   cd bankapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/bankapp

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_secure_jwt_secret_key

   # Server
   PORT=5000

   # Admin Credentials
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure_admin_password

   # Crypto Wallet
   BTC_ADDRESS=your_bitcoin_address

   # URLs
   BASE_URL=http://localhost:5000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Email Service (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=onboarding@resend.dev
   ```

4. **Create upload directories**
   ```bash
   mkdir -p uploads/ids
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

## Project Structure

```
bankapp/
├── src/
│   ├── models/          # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   └── EmailVerification.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── transferRoutes.ts
│   │   ├── cryptoRoutes.ts
│   │   ├── cardRoutes.ts
│   │   ├── loanRoutes.ts
│   │   └── adminRoutes.ts
│   ├── middleware/      # Custom middleware
│   │   └── auth.ts
│   ├── utils/           # Utility functions
│   │   ├── accountUtils.ts
│   │   └── emailService.ts
│   └── index.ts         # Server entry point
├── uploads/             # File uploads (gitignored)
├── .env                 # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send email verification OTP
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/profile-picture` - Upload profile picture
- `DELETE /api/users/:userId/profile-picture` - Delete profile picture

### Transfers
- `POST /api/transfers/send-otp` - Send transfer OTP
- `POST /api/transfers` - Execute transfer
- `GET /api/transfers/:userId` - Get user transactions
- `POST /api/transfers/set-pin` - Set transfer PIN
- `POST /api/transfers/verify-pin` - Verify transfer PIN

### Crypto
- `GET /api/crypto/:userId/wallets` - Get user wallets
- `POST /api/crypto/:userId/wallets` - Add new wallet
- `POST /api/crypto/:userId/buy` - Buy cryptocurrency
- `POST /api/crypto/:userId/sell` - Sell cryptocurrency

### Cards
- `GET /api/cards/:userId` - Get user cards
- `POST /api/cards/:userId` - Request new card
- `PUT /api/cards/:userId/:cardId/status` - Update card status

### Loans
- `POST /api/loans/apply` - Submit loan application

### Admin (Protected)
- `GET /api/admin/users` - Get all users with pagination
- `GET /api/admin/transactions` - Get all transactions
- `POST /api/admin/users/:userId/block` - Block user account
- `POST /api/admin/users/:userId/unblock` - Unblock user account
- `POST /api/admin/users/:userId/credit` - Credit user account
- `POST /api/admin/users/:userId/debit` - Debit user account
- `DELETE /api/admin/users/:userId` - Delete user account
- `POST /api/admin/users/:userId/adjust-balance` - Adjust account balance
- `GET /api/admin/stats` - Get system statistics

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management with 30-day expiry
- **OTP Verification**: Time-limited OTPs for sensitive operations
- **Transfer PIN**: Additional layer for transaction security
- **File Validation**: Content validation for ID documents
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: Protection against injection attacks
- **Admin Authentication**: Role-based access control

## Email Notifications

Uses Resend API for:
- Email verification OTPs
- Transfer verification OTPs
- Password reset links
- Loan application notifications
- Account activity alerts
- Admin notifications

## Database Schema

### User Model
- Personal information (name, email, phone, address)
- Authentication (password, security questions)
- Accounts (multi-currency support)
- Crypto wallets
- Cards
- ID verification documents
- Status (active/blocked)
- Admin flag

### Transaction Model
- Transfer details (sender, recipient, amount)
- Transaction type (internal/external/crypto)
- Status tracking
- Timestamps

### EmailVerification Model
- Email address
- OTP code
- Expiration timestamp
- Auto-deletion via TTL index

## Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add all environment variables from `.env`
5. Deploy

### Important Notes
- Render free tier blocks SMTP ports (25, 465, 587)
- Use Resend or similar API-based email service
- Create `uploads/ids` directory on server startup
- MongoDB connection string must be properly configured
- JWT_SECRET should be a strong random string

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Scripts

```bash
npm run dev       # Start development server with nodemon
npm run build     # Compile TypeScript to JavaScript
npm start         # Start production server
npm run lint      # Run ESLint (when configured)
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb+srv://...` |
| JWT_SECRET | Secret key for JWT tokens | Random 64-char string |
| PORT | Server port | `5000` |
| ADMIN_EMAIL | Admin user email | `admin@example.com` |
| ADMIN_PASSWORD | Admin user password | Strong password |
| BTC_ADDRESS | Bitcoin wallet address | `bc1q...` |
| BASE_URL | Backend URL | `https://api.example.com` |
| NEXT_PUBLIC_BASE_URL | Frontend URL | `https://example.com` |
| RESEND_API_KEY | Resend API key | `re_...` |
| EMAIL_FROM | Sender email address | `onboarding@resend.dev` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Prince Nwafor**
- GitHub: [@nwafor-princewill](https://github.com/nwafor-princewill)
- Website: [zenatrust.com](https://www.zenatrust.com)

## Acknowledgments

- Express.js for the robust web framework
- MongoDB for the flexible database
- Resend for reliable email delivery
- The Node.js community

## Support

For support, email support@zenatrust.com or open an issue on GitHub.

## Related Links

- [Frontend Repository](https://github.com/nwafor-princewill/bankapp-fixed)
- [Live Demo](https://www.zenatrust.com)


---

Built with ❤️ by Prince Nwafor
