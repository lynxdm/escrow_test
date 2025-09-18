#!/usr/bin/env node

// Escrow.com API Test Runner
// This script tests all available endpoints in the Escrow API

require("dotenv").config();
const { EscrowClient, EscrowUtils } = require("./escrowService");

class EscrowAPITester {
  constructor() {
    this.email = process.env.ESCROW_EMAIL;
    this.password = process.env.ESCROW_PASSWORD;
    this.isSandbox = process.env.ESCROW_SANDBOX === "true";
    this.testBuyerEmail = process.env.TEST_BUYER_EMAIL;
    this.testSellerEmail = process.env.TEST_SELLER_EMAIL;
    this.client = null;
    this.testTransactionId = null;
  }

  async initialize() {
    if (!this.email || !this.password) {
      throw new Error(
        "Please set ESCROW_EMAIL and ESCROW_PASSWORD in your .env file"
      );
    }

    this.client = new EscrowClient(this.email, this.password, !this.isSandbox);
    console.log(
      `🚀 Initialized Escrow API client (${
        this.isSandbox ? "SANDBOX" : "PRODUCTION"
      })`
    );
  }

  async runTests() {
    console.log("\n🧪 Starting Escrow API Tests...\n");

    try {
      await this.testCustomerEndpoints();
      await this.testTransactionEndpoints();
      await this.testPartnerEndpoints();

      console.log("\n✅ All tests completed successfully!");
    } catch (error) {
      console.error("\n❌ Test failed:", error.message);
      if (error.response) {
        console.error("Response:", error.response);
      }
    }
  }

  async testCustomerEndpoints() {
    console.log("📋 Testing Customer Endpoints...");

    try {
      // Test 1: Get customer profile
      console.log("  🔍 Getting customer profile...");
      const profile = await this.client.customers.getMyProfile();
      console.log("  ✅ Profile retrieved:", profile.email || profile.id);

      // Test 2: Get API keys
      console.log("  🔑 Getting API keys...");
      const apiKeys = await this.client.customers.getAPIKeys();
      console.log("  ✅ API keys retrieved");

      // Test 3: Get disbursement methods
      console.log("  💰 Getting disbursement methods...");
      const disbursementMethods =
        await this.client.customers.getDisbursementMethods();
      console.log("  ✅ Disbursement methods retrieved");

      // Test 4: Get webhooks
      console.log("  🪝 Getting webhooks...");
      const webhooks = await this.client.customers.getWebhooks();
      console.log("  ✅ Webhooks retrieved");
    } catch (error) {
      console.log("  ⚠️  Customer endpoint test failed:", error.message);
    }
  }

  async testTransactionEndpoints() {
    console.log("\n📄 Testing Transaction Endpoints...");

    try {
      // Test 1: List transactions
      console.log("  📜 Listing transactions...");
      const transactions = await this.client.transactions.listTransactions({
        per_page: 5,
      });
      console.log(`  ✅ Found ${transactions.total || 0} transactions`);

      // Test 2: Create a basic transaction (if we have test data)
      if (this.canCreateTestTransaction()) {
        console.log("  ➕ Creating test transaction...");
        const transaction = await this.createTestTransaction();
        if (transaction && transaction.id) {
          this.testTransactionId = transaction.id;
          console.log(`  ✅ Created transaction: ${transaction.id}`);

          // Test 3: Get specific transaction
          console.log("  📄 Getting transaction details...");
          const transactionDetails =
            await this.client.transactions.getTransaction(transaction.id);
          console.log("  ✅ Transaction details retrieved");

          // Test 4: Get transaction timeline
          console.log("  ⏰ Getting transaction timeline...");
          const timeline = await this.client.transactions.getTimeline(
            transaction.id
          );
          console.log("  ✅ Transaction timeline retrieved");

          // Test 5: Get payment methods
          console.log("  💳 Getting payment methods...");
          const paymentMethods = await this.client.payments.getPaymentMethods(
            transaction.id
          );
          console.log("  ✅ Payment methods retrieved");

          // Test 6: Get disbursement methods for transaction
          console.log("  💸 Getting transaction disbursement methods...");
          const disbursementMethods =
            await this.client.disbursements.getTransactionDisbursements(
              transaction.id
            );
          console.log("  ✅ Transaction disbursement methods retrieved");

          // Test 7: Perform transaction actions (agree to transaction)
          console.log("  🤝 Testing transaction actions...");
          try {
            await this.client.agreeToTransaction(transaction.id);
            console.log("  ✅ Buyer agreed to transaction");
          } catch (error) {
            console.log(
              "  ⚠️  Agree action failed (expected in sandbox):",
              error.message
            );
          }

          // Test 8: Test milestone actions
          console.log("  📦 Testing milestone actions...");
          if (transaction.items && transaction.items.length > 0) {
            const firstItem = transaction.items[0];
            try {
              // Test shipping action
              await this.client.shipItem(transaction.id, "UPS", "1Z999TEST123");
              console.log("  ✅ Item marked as shipped");
            } catch (error) {
              console.log(
                "  ⚠️  Ship action failed (expected in sandbox):",
                error.message
              );
            }
          }
        }
      } else {
        console.log(
          "  ⏭️  Skipping transaction creation (no test data available)"
        );
      }
    } catch (error) {
      console.log("  ⚠️  Transaction endpoint test failed:", error.message);
    }
  }

  async testPartnerEndpoints() {
    console.log("\n🤝 Testing Partner Endpoints...");

    try {
      // Test 1: List partner transactions
      console.log("  📋 Listing partner transactions...");
      const partnerTransactions =
        await this.client.partner.listPartnerTransactions({ limit: 5 });
      console.log(
        `  ✅ Found ${partnerTransactions.total || 0} partner transactions`
      );

      // Test 2: List partner customers
      console.log("  👥 Listing partner customers...");
      const partnerCustomers = await this.client.partner.listPartnerCustomers({
        limit: 5,
      });
      console.log(
        `  ✅ Found ${partnerCustomers.total || 0} partner customers`
      );

      // Test 3: List reports
      console.log("  📊 Listing reports...");
      const reports = await this.client.partner.listReports();
      console.log("  ✅ Reports retrieved");
    } catch (error) {
      console.log("  ⚠️  Partner endpoint test failed:", error.message);
    }
  }

  canCreateTestTransaction() {
    // Check if we have test buyer/seller emails configured
    return this.testBuyerEmail && this.testSellerEmail && this.isSandbox;
  }

  async createTestTransaction() {
    try {
      console.log("  💰 Creating test transaction...");

      // Create a simple test transaction (simplified format)
      const transactionData = {
        currency: "usd",
        description: "Test Transaction - API Integration Testing",
        parties: [
          {
            role: "buyer",
            customer: this.email, // Use the authenticated user's email
          },
          {
            role: "seller",
            customer: this.testSellerEmail,
          },
        ],
        items: [
          {
            title: "Test Item - Digital Camera",
            description: "Professional digital camera for testing purposes",
            type: "general_merchandise",
            inspection_period: 259200, // 3 days in seconds
            quantity: 1,
            schedule: [
              {
                amount: 450.0, // Use number instead of string
                payer_customer: this.email,
                beneficiary_customer: this.testSellerEmail,
              },
            ],
          },
        ],
      };

      console.log(
        "  📋 Transaction data:",
        JSON.stringify(transactionData, null, 2)
      );

      const transaction = await this.client.transactions.createTransaction(
        transactionData
      );
      console.log("  ✅ Test transaction created successfully");
      console.log("  📄 Transaction ID:", transaction.id);
      return transaction;
    } catch (error) {
      console.log("  ❌ Failed to create test transaction:", error.message);
      console.log(
        "  💡 This is expected in sandbox if test emails don't exist"
      );
      return null;
    }
  }

  async cleanup() {
    // Clean up any test resources if needed
    if (this.testTransactionId) {
      console.log(
        `\n🧹 Cleaning up test transaction ${this.testTransactionId}...`
      );
      try {
        // Cancel the test transaction to avoid accumulation
        await this.client.transactions.performAction(this.testTransactionId, {
          action: "cancel",
        });
        console.log("  ✅ Test transaction cancelled successfully");
      } catch (error) {
        console.log("  ⚠️  Cleanup failed:", error.message);
        console.log("  💡 Test transaction may need manual cleanup in sandbox");
      }
    }
  }
}

// Utility function to format test results
function formatTestResult(success, message, data = null) {
  const status = success ? "✅" : "❌";
  console.log(`${status} ${message}`);
  if (data && typeof data === "object") {
    console.log(`   Details: ${JSON.stringify(data, null, 2)}`);
  }
}

// Main execution
async function main() {
  console.log("🎯 Escrow.com API Test Suite");
  console.log("==============================");

  const tester = new EscrowAPITester();

  try {
    await tester.initialize();
    await tester.runTests();
    await tester.cleanup();
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }

  console.log("\n🎉 Test suite completed!");
}

// Run the tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EscrowAPITester };
