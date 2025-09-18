// Escrow.com API with JavaScript - Complete Implementation Guide

// ================================
// 1. CONFIGURATION & SETUP
// ================================

// Load environment variables
require("dotenv").config();

class EscrowAPI {
  constructor(email, password, isProduction = false) {
    this.email = email;
    this.password = password;
    this.baseURL = isProduction
      ? "https://api.escrow.com"
      : "https://api.escrow-sandbox.com";
    this.version = "2017-09-01";
    this.authHeader = `Basic ${Buffer.from(`${email}:${password}`).toString(
      "base64"
    )}`;
  }

  // Base request method
  async makeRequest(endpoint, method = "GET", data = null) {
    const url = `${this.baseURL}/${this.version}${endpoint}`;

    const options = {
      method,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (data && (method === "POST" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      console.log(`API Call: ${method} ${url} - Status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} - ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = `API Error: ${response.status} - ${errorData.error}`;
          }
        } catch (jsonError) {
          // If response is not JSON, use the status text
          console.log(`Response is not JSON: ${jsonError.message}`);
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const text = await response.text();
        console.log(`Non-JSON response: ${text}`);
        return { message: text };
      }
    } catch (error) {
      console.error("API Request failed:", error.message);
      throw error;
    }
  }
}

// ================================
// 2. CUSTOMER MANAGEMENT
// ================================

class EscrowCustomer extends EscrowAPI {
  // Get current customer details
  async getMyProfile() {
    return await this.makeRequest("/customer/me");
  }

  // Get customer by ID
  async getCustomer(customerId) {
    return await this.makeRequest(`/customer/${customerId}`);
  }

  // Get API keys
  async getAPIKeys() {
    return await this.makeRequest("/customer/me/api_key");
  }

  // Create new API key
  async createAPIKey(name) {
    return await this.makeRequest("/customer/me/api_key", "POST", { name });
  }

  // Get disbursement methods
  async getDisbursementMethods() {
    return await this.makeRequest("/customer/me/disbursement_methods");
  }

  // Get webhooks
  async getWebhooks() {
    return await this.makeRequest("/customer/me/webhook");
  }

  // Create webhook
  async createWebhook(url) {
    return await this.makeRequest("/customer/me/webhook", "POST", { url });
  }
}

// ================================
// 3. TRANSACTION MANAGEMENT
// ================================

class EscrowTransaction extends EscrowAPI {
  // List transactions with filtering
  async listTransactions(options = {}) {
    const {
      page = 1,
      per_page = 10,
      sort_by = "id",
      sort_direction = "desc",
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      sort_by,
      sort_direction,
    });

    return await this.makeRequest(`/transaction?${params}`);
  }

  // Get specific transaction
  async getTransaction(transactionId) {
    return await this.makeRequest(`/transaction/${transactionId}`);
  }

  // Get transaction by reference
  async getTransactionByReference(reference) {
    return await this.makeRequest(`/transaction/reference/${reference}`);
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    return await this.makeRequest("/transaction", "POST", transactionData);
  }

  // Perform action on transaction
  async performAction(transactionId, action) {
    return await this.makeRequest(
      `/transaction/${transactionId}`,
      "PATCH",
      action
    );
  }

  // Get transaction timeline
  async getTimeline(transactionId) {
    return await this.makeRequest(
      `/transaction/${transactionId}/timeline-entries`
    );
  }
}

// ================================
// 4. PAYMENT METHODS
// ================================

class EscrowPayments extends EscrowAPI {
  // Get available payment methods for transaction
  async getPaymentMethods(transactionId) {
    return await this.makeRequest(
      `/transaction/${transactionId}/payment_methods`
    );
  }

  // Select payment method
  async selectPaymentMethod(transactionId, paymentMethod, options = {}) {
    return await this.makeRequest(
      `/transaction/${transactionId}/payment_methods/${paymentMethod}`,
      "POST",
      options
    );
  }

  // Get wire transfer details
  async getWireDetails(transactionId) {
    return await this.makeRequest(
      `/transaction/${transactionId}/payment_methods/wire_transfer`
    );
  }

  // Get PayPal landing URL
  async getPayPalURL(transactionId, returnUrl, redirectType = "manual") {
    const params = new URLSearchParams({
      return_url: returnUrl,
      redirect_type: redirectType,
    });

    return await this.makeRequest(
      `/transaction/${transactionId}/payment_methods/paypal?${params}`
    );
  }
}

// ================================
// 5. DISBURSEMENT MANAGEMENT
// ================================

class EscrowDisbursement extends EscrowAPI {
  // Get disbursement methods for transaction
  async getTransactionDisbursements(transactionId) {
    return await this.makeRequest(
      `/transaction/${transactionId}/disbursement_methods`
    );
  }

  // Set disbursement method
  async setDisbursementMethod(transactionId, disbursementData) {
    return await this.makeRequest(
      `/transaction/${transactionId}/disbursement_methods`,
      "PATCH",
      disbursementData
    );
  }
}

// ================================
// 6. MILESTONE ITEMS
// ================================

class EscrowMilestones extends EscrowAPI {
  // Perform action on milestone item
  async performItemAction(transactionId, itemId, action) {
    return await this.makeRequest(
      `/transaction/${transactionId}/item/${itemId}`,
      "PATCH",
      action
    );
  }

  // Get web link for milestone action
  async getItemWebLink(transactionId, itemId, action) {
    return await this.makeRequest(
      `/transaction/${transactionId}/item/${itemId}/web_link/${action}`
    );
  }
}

// ================================
// 7. PARTNER ENDPOINTS (for brokers/partners)
// ================================

class EscrowPartner extends EscrowAPI {
  // List partner transactions with advanced filtering
  async listPartnerTransactions(filters = {}) {
    const {
      limit = 10,
      next_cursor = 1,
      sort_by = "id",
      sort_direction = "desc",
      status,
      customer_ids,
      min_amount,
      max_amount,
      initiation_start_date,
      initiation_end_date,
    } = filters;

    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("next_cursor", next_cursor.toString());
    params.append("sort_by", sort_by);
    params.append("sort_direction", sort_direction);

    if (status) params.append("status", status);
    if (customer_ids)
      customer_ids.forEach((id) => params.append("customer_ids", id));
    if (min_amount) params.append("min_amount", min_amount.toString());
    if (max_amount) params.append("max_amount", max_amount.toString());
    if (initiation_start_date)
      params.append("initiation_start_date", initiation_start_date);
    if (initiation_end_date)
      params.append("initiation_end_date", initiation_end_date);

    return await this.makeRequest(`/partner/transactions?${params}`);
  }

  // List partner customers
  async listPartnerCustomers(options = {}) {
    const {
      limit = 10,
      next_cursor = 1,
      sort_by = "id",
      sort_direction = "desc",
    } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      next_cursor: next_cursor.toString(),
      sort_by,
      sort_direction,
    });

    return await this.makeRequest(`/partner/customers?${params}`);
  }

  // Generate report
  async generateReport(reportData) {
    return await this.makeRequest("/partner/reports", "POST", reportData);
  }

  // List reports
  async listReports() {
    return await this.makeRequest("/partner/reports");
  }

  // Download report
  async downloadReport(taskId, asJson = false) {
    const params = asJson ? "?as_json=true" : "";
    return await this.makeRequest(
      `/partner/reports/${taskId}/download${params}`
    );
  }
}

// ================================
// 8. COMPLETE ESCROW CLIENT
// ================================

class EscrowClient extends EscrowAPI {
  constructor(email, password, isProduction = false) {
    super(email, password, isProduction);

    // Initialize all service classes
    this.customers = new EscrowCustomer(email, password, isProduction);
    this.transactions = new EscrowTransaction(email, password, isProduction);
    this.payments = new EscrowPayments(email, password, isProduction);
    this.disbursements = new EscrowDisbursement(email, password, isProduction);
    this.milestones = new EscrowMilestones(email, password, isProduction);
    this.partner = new EscrowPartner(email, password, isProduction);
  }

  // Helper method to create a basic transaction
  async createBasicTransaction(
    buyerEmail,
    sellerEmail,
    itemTitle,
    itemDescription,
    amount,
    currency = "usd"
  ) {
    const transactionData = {
      description: `Sale of ${itemTitle}`,
      currency: currency,
      parties: [
        {
          customer: buyerEmail,
          role: "buyer",
        },
        {
          customer: sellerEmail,
          role: "seller",
        },
      ],
      items: [
        {
          title: itemTitle,
          description: itemDescription,
          type: "general_merchandise",
          inspection_period: 259200, // 3 days in seconds
          quantity: 1,
          schedule: [
            {
              amount: amount.toString(),
              payer_customer: buyerEmail,
              beneficiary_customer: sellerEmail,
            },
          ],
          fees: [
            {
              type: "escrow",
              payer_customer: buyerEmail,
              split: "0.5",
            },
            {
              type: "escrow",
              payer_customer: sellerEmail,
              split: "0.5",
            },
          ],
        },
      ],
    };

    return await this.transactions.createTransaction(transactionData);
  }

  // Helper method for common transaction actions
  async agreeToTransaction(transactionId) {
    return await this.transactions.performAction(transactionId, {
      action: "agree",
    });
  }

  async shipItem(transactionId, carrier, trackingId) {
    return await this.transactions.performAction(transactionId, {
      action: "ship",
      shipping_information: {
        tracking_information: {
          carrier: carrier,
          tracking_id: trackingId,
        },
      },
    });
  }

  async acceptItem(transactionId) {
    return await this.transactions.performAction(transactionId, {
      action: "accept",
    });
  }

  async rejectItem(transactionId, reason) {
    return await this.transactions.performAction(transactionId, {
      action: "reject",
      rejection_information: {
        rejection_reason: reason,
      },
    });
  }
}

// ================================
// 9. USAGE EXAMPLES
// ================================

// Example usage
async function demonstrateEscrowAPI() {
  // Initialize the client using environment variables
  const email = process.env.ESCROW_EMAIL;
  const password = process.env.ESCROW_PASSWORD;
  const isSandbox = process.env.ESCROW_SANDBOX === "true";

  if (!email || !password) {
    console.error(
      "Please set ESCROW_EMAIL and ESCROW_PASSWORD in your .env file"
    );
    return;
  }

  const escrow = new EscrowClient(email, password, !isSandbox); // false = sandbox

  try {
    // 1. Get your profile
    console.log("=== Getting Profile ===");
    const profile = await escrow.customers.getMyProfile();
    console.log("Profile:", profile);

    // 2. Create a transaction
    console.log("=== Creating Transaction ===");
    const transaction = await escrow.createBasicTransaction(
      "buyer@example.com",
      "seller@example.com",
      "Vintage Camera",
      "A rare vintage camera in excellent condition",
      500.0
    );
    console.log("Created transaction:", transaction);

    // 3. List transactions
    console.log("=== Listing Transactions ===");
    const transactions = await escrow.transactions.listTransactions({
      page: 1,
      per_page: 5,
    });
    console.log("Transactions:", transactions);

    // 4. Get payment methods
    if (transaction.id) {
      console.log("=== Getting Payment Methods ===");
      const paymentMethods = await escrow.payments.getPaymentMethods(
        transaction.id
      );
      console.log("Payment methods:", paymentMethods);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// ================================
// 10. ERROR HANDLING & UTILITIES
// ================================

class EscrowError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = "EscrowError";
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Utility functions
const EscrowUtils = {
  // Format amount to string with 2 decimal places
  formatAmount(amount) {
    return Number(amount).toFixed(2);
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Calculate inspection period in seconds
  daysToSeconds(days) {
    return days * 24 * 60 * 60;
  },

  // Transaction status helpers
  getTransactionStatus(transaction) {
    if (transaction.is_cancelled) return "cancelled";
    if (transaction.is_draft) return "draft";

    // Check if all parties agreed
    const allAgreed = transaction.parties.every((party) => party.agreed);
    if (!allAgreed) return "pending_agreement";

    // Check payment status
    const hasSecuredPayment = transaction.items.some((item) =>
      item.schedule.some((schedule) => schedule.status?.secured)
    );
    if (!hasSecuredPayment) return "pending_payment";

    // Check shipping status
    const hasShipped = transaction.items.some((item) => item.status?.shipped);
    if (!hasShipped) return "pending_shipment";

    // Check acceptance status
    const hasAccepted = transaction.items.some((item) => item.status?.accepted);
    if (!hasAccepted) return "pending_acceptance";

    return "completed";
  },
};

// Export for use in Node.js or modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    EscrowClient,
    EscrowUtils,
    EscrowError,
  };
}

// Example: Initialize and use
// const escrow = new EscrowClient(process.env.ESCROW_EMAIL, process.env.ESCROW_PASSWORD, false);
// demonstrateEscrowAPI();
