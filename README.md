# Escrow.com API Test Suite

A comprehensive Node.js test suite for testing Escrow.com API endpoints. This project provides a complete implementation of the Escrow API with authentication, error handling, and automated testing capabilities.

## 🚀 Features

- **Complete API Coverage**: Tests all major Escrow.com API endpoints
- **Environment-Based Configuration**: Secure credential management via `.env` file
- **Sandbox Support**: Test in Escrow's sandbox environment
- **Comprehensive Error Handling**: Robust error handling and logging
- **Modular Architecture**: Clean, organized code structure
- **Automated Testing**: Run comprehensive endpoint tests with a single command

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- An Escrow.com account with API access
- API credentials (email and password)

## 🛠️ Installation

1. **Clone or set up the project:**

   ```bash
   cd escrow_test
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env` file and update it with your Escrow.com credentials:
   ```bash
   # Edit the .env file with your actual credentials
   ESCROW_EMAIL=your-actual-email@example.com
   ESCROW_PASSWORD=your-actual-password
   ESCROW_SANDBOX=true  # Set to false for production
   ```

## 🔧 Configuration

### Environment Variables

| Variable          | Description                      | Required | Default |
| ----------------- | -------------------------------- | -------- | ------- |
| `ESCROW_EMAIL`    | Your Escrow.com account email    | Yes      | -       |
| `ESCROW_PASSWORD` | Your Escrow.com account password | Yes      | -       |
| `ESCROW_SANDBOX`  | Use sandbox environment          | No       | `true`  |

### Getting API Credentials

1. Sign up for an Escrow.com account at [https://www.escrow.com](https://www.escrow.com)
2. Enable API access in your account settings
3. Use your account email and password for authentication
4. Start with sandbox mode (`ESCROW_SANDBOX=true`) for testing
5. For production, create a separate account or use production credentials

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Demo Function

```bash
npm run demo
```

### Direct Execution

```bash
node test-runner.js
```

## 📚 API Endpoints Tested

### Customer Management

- ✅ Get customer profile
- ✅ Get API keys
- ✅ Get disbursement methods
- ✅ Get webhooks
- ✅ Create webhooks
- ✅ Create API keys

### Transaction Management

- ✅ List transactions
- ✅ Get transaction details
- ✅ Create transactions
- ✅ Get transaction timeline
- ✅ Perform transaction actions (agree, ship, accept, etc.)

### Payment Methods

- ✅ Get payment methods
- ✅ Select payment methods
- ✅ Get wire transfer details
- ✅ Get PayPal URLs

### Disbursement Management

- ✅ Get disbursement methods
- ✅ Set disbursement methods

### Milestone Items

- ✅ Perform item actions
- ✅ Get item web links

### Partner Endpoints

- ✅ List partner transactions
- ✅ List partner customers
- ✅ Generate reports
- ✅ Download reports

## 🏗️ Project Structure

```
escrow_test/
├── escrowService.js      # Main API client implementation
├── test-runner.js        # Comprehensive test suite
├── api.js               # Additional API utilities (empty)
├── .env                 # Environment configuration (template)
├── .gitignore          # Git ignore rules
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## 💻 Usage Examples

### Basic Usage

```javascript
const { EscrowClient } = require("./escrowService");

// Initialize client
const escrow = new EscrowClient(
  process.env.ESCROW_EMAIL,
  process.env.ESCROW_PASSWORD,
  false // false = sandbox, true = production
);

// Get your profile
const profile = await escrow.customers.getMyProfile();
console.log("Profile:", profile);

// List transactions
const transactions = await escrow.transactions.listTransactions({
  per_page: 10,
  page: 1,
});
console.log("Transactions:", transactions);
```

### Creating a Transaction

```javascript
// Create a basic transaction
const transaction = await escrow.createBasicTransaction(
  "buyer@example.com",
  "seller@example.com",
  "Vintage Camera",
  "A rare vintage camera in excellent condition",
  500.0
);

console.log("Created transaction:", transaction.id);
```

### Transaction Actions

```javascript
// Agree to a transaction
await escrow.agreeToTransaction(transactionId);

// Ship an item
await escrow.shipItem(transactionId, "UPS", "1Z999AA1234567890");

// Accept an item
await escrow.acceptItem(transactionId);
```

## 🔒 Security Best Practices

1. **Never commit credentials**: The `.env` file is gitignored
2. **Use sandbox first**: Always test in sandbox before production
3. **Environment separation**: Use different credentials for sandbox/production
4. **Rate limiting**: Implement appropriate delays between API calls
5. **Error handling**: Always handle API errors gracefully

## 🚨 Error Handling

The API client includes comprehensive error handling:

```javascript
try {
  const result = await escrow.customers.getMyProfile();
  console.log("Success:", result);
} catch (error) {
  console.error("API Error:", error.message);
  console.error("Status Code:", error.statusCode);
}
```

## 📖 API Documentation

For complete API documentation, visit:

- [Escrow.com API Documentation](https://www.escrow.com/api/docs)
- [API Basics](https://www.escrow.com/api/docs#api-basics)
- [API Reference](https://www.escrow.com/api/docs#api-reference)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter issues:

1. Check the [Escrow.com API Documentation](https://www.escrow.com/api/docs)
2. Verify your credentials in the `.env` file
3. Ensure you're using the correct environment (sandbox vs production)
4. Check the console output for detailed error messages

## 🔄 Recent Updates

- ✅ Updated authentication to use email/password with Basic Auth
- ✅ Added comprehensive environment variable support
- ✅ Created automated test runner
- ✅ Added proper error handling and logging
- ✅ Updated to use correct Escrow sandbox/production URLs

---

**Note**: This is a testing suite for the Escrow.com API. Always review Escrow's terms of service and API usage guidelines before implementing in production.
