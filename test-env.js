#!/usr/bin/env node

// Quick test to check environment variables
require("dotenv").config();

console.log("Environment Variables Test:");
console.log("===========================");
console.log("ESCROW_EMAIL:", process.env.ESCROW_EMAIL || "NOT SET");
console.log(
  "ESCROW_PASSWORD:",
  process.env.ESCROW_PASSWORD ? "***SET***" : "NOT SET"
);
console.log("ESCROW_SANDBOX:", process.env.ESCROW_SANDBOX || "NOT SET");
console.log("TEST_BUYER_EMAIL:", process.env.TEST_BUYER_EMAIL || "NOT SET");
console.log("TEST_SELLER_EMAIL:", process.env.TEST_SELLER_EMAIL || "NOT SET");

console.log("\nFile content check:");
const fs = require("fs");
try {
  const content = fs.readFileSync(".env", "utf8");
  console.log("File exists and is readable");
  console.log("Lines:", content.split("\n").length);
} catch (error) {
  console.log("Error reading .env file:", error.message);
}
