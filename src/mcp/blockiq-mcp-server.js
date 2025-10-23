#!/usr/bin/env node

/**
 * BlockIQ MCP Server - Real MCP Implementation
 *
 * This is a proper MCP server that exposes BlockIQ's custom tools
 * following the Model Context Protocol specification.
 *
 * Tools provided:
 * - getWalletData: Fetch Stacks wallet information
 * - getTransactions: Fetch transaction history with pagination
 * - executeSpiderAnalysis: Run comprehensive Spider Mode analysis
 * - debugAndFixCode: Debug and fix JavaScript code
 * - preloadTransactionData: Background data preloading
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

// Global state for preloading
const preloadingState = new Map();

/**
 * BlockIQ MCP Server Class
 */
class BlockIQMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "blockiq-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[BlockIQ MCP Server] Error:", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "getWalletData",
            description: `Fetch comprehensive Stacks wallet data including balance and recent transactions.

RETURNS JSON STRUCTURE:
{
  "address": "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2",
  "balance": {
    "stx": {
      "balance": "9200000000000",
      "total_sent": "1500000000000",
      "total_received": "10700000000000"
    }
  },
  "transactions": [
    {
      "tx_id": "0x847bedd68f817501b24f7d7930a871bbcb4a5d3d833285c4cef6d11b5ecac69a",
      "tx_type": "token_transfer",
      "sender_address": "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2",
      "token_transfer": {
        "recipient_address": "ST38RMDQFVC462DSJ1CPEW5EYXEZKASQVC8XDGARN",
        "amount": "500000000",
        "memo": "0x666175636574"
      },
      "fee_rate": "180",
      "block_height": 4,
      "burn_block_time": 1735930199,
      "tx_status": "success"
    }
  ],
  "totalTransactions": 16413
}

Use this for getting wallet overview and recent transaction samples.`,
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Stacks wallet address to analyze",
                },
              },
              required: ["address"],
            },
          },
          {
            name: "getTransactions",
            description: `Retrieve transaction history with pagination. Perfect for getting specific transactions by number.

USAGE EXAMPLES:
- Get recent 50 transactions: getTransactions(address, 50, 0)
- Get transaction #156: getTransactions(address, 1, 155) // offset = transactionNumber - 1
- Get first ever transaction: getTransactions(address, 1, totalTransactions - 1)

RETURNS JSON STRUCTURE:
{
  "results": [
    {
      "tx_id": "0x847bedd68f817501b24f7d7930a871bbcb4a5d3d833285c4cef6d11b5ecac69a",
      "tx_type": "token_transfer",
      "sender_address": "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2",
      "token_transfer": {
        "recipient_address": "ST38RMDQFVC462DSJ1CPEW5EYXEZKASQVC8XDGARN",
        "amount": "500000000",
        "memo": "0x666175636574"
      },
      "fee_rate": "180",
      "block_height": 4,
      "burn_block_time": 1735930199,
      "tx_status": "success",
      "nonce": 0
    }
  ],
  "limit": 50,
  "offset": 0,
  "total": 16413
}

IMPORTANT: Use offset to get specific transaction numbers. Transaction #N is at offset N-1.`,
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Stacks wallet address",
                },
                limit: {
                  type: "number",
                  description: "Number of transactions to fetch (default: 50)",
                  default: 50,
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination (default: 0)",
                  default: 0,
                },
              },
              required: ["address"],
            },
          },
          {
            name: "executeSpiderAnalysis",
            description: `Execute comprehensive Spider Mode analysis with custom JavaScript code on ALL transaction data.

CRITICAL: This tool fetches ALL transactions and saves them to 'cache.tmp.json' file, then executes your JavaScript code.

SMART CACHING SYSTEM:
- code_status=false: Only fetch and cache data (no code execution) - for pre-fetching
- code_status=true (default): Check cache first, then execute code - for analysis
- Automatically checks if data is already cached for the address
- Shows detailed progress logging during data fetching

DATA STRUCTURE IN cache.tmp.json:
{
  "_metadata": {
    "address": "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2",
    "totalTransactions": 16413,
    "fetchedAt": "2025-01-21T18:53:16.123Z"
  },
  "data": [
    {
      "limit": 50,
      "offset": 0,
      "total": 16413,
      "results": [
        {
          "tx_id": "0x847bedd68f817501b24f7d7930a871bbcb4a5d3d833285c4cef6d11b5ecac69a",
          "tx_type": "token_transfer",
          "sender_address": "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2",
          "token_transfer": {
            "recipient_address": "ST38RMDQFVC462DSJ1CPEW5EYXEZKASQVC8XDGARN",
            "amount": "500000000",
            "memo": "0x666175636574"
          },
          "fee_rate": "180",
          "block_height": 4,
          "burn_block_time": 1735930199,
          "tx_status": "success",
          "nonce": 0
        }
      ]
    }
  ]
}

JAVASCRIPT CODE TEMPLATE (COPY THIS PATTERN):
const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
const data = fileData.data || fileData;
const allTransactions = data.flatMap(batch => batch.results || []);

// Your analysis logic here
const result = {
  // Your analysis results
};

console.log(JSON.stringify(result));

EXAMPLE CODES:

1. FIND FIRST TRANSACTION:
const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
const allTransactions = fileData.data.flatMap(batch => batch.results || []);
const sortedTxs = allTransactions.sort((a, b) => a.burn_block_time - b.burn_block_time);
const firstTx = sortedTxs[0];
console.log(JSON.stringify({
  transactionId: firstTx.tx_id,
  receiver: firstTx.token_transfer?.recipient_address,
  amount: firstTx.token_transfer?.amount,
  timestamp: new Date(firstTx.burn_block_time * 1000).toISOString()
}));

2. FIND TRANSACTION BY NUMBER:
const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
const allTransactions = fileData.data.flatMap(batch => batch.results || []);
const targetTx = allTransactions[1454]; // Transaction #1455 (0-based index)
console.log(JSON.stringify({
  transactionNumber: 1455,
  receiver: targetTx.token_transfer?.recipient_address,
  transactionId: targetTx.tx_id
}));

3. TOP RECIPIENTS ANALYSIS:
const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
const allTransactions = fileData.data.flatMap(batch => batch.results || []);
const recipients = {};
allTransactions.forEach(tx => {
  if (tx.token_transfer?.recipient_address) {
    const addr = tx.token_transfer.recipient_address;
    recipients[addr] = (recipients[addr] || 0) + 1;
  }
});
const topRecipients = Object.entries(recipients)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);
console.log(JSON.stringify({ topRecipients }));

4. MONTHLY STX AMOUNTS (FOR GRAPHS - CONVERT MICRO STX TO STX):
const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
const allTransactions = fileData.data.flatMap(batch => batch.results || []);
const monthlyAmounts = {};
allTransactions.forEach(tx => {
  if (tx.token_transfer?.amount && tx.sender_address === 'ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2') {
    const date = new Date(tx.burn_block_time * 1000);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    const microStxAmount = parseInt(tx.token_transfer.amount);
    const stxAmount = microStxAmount / 1000000; // CRITICAL: Convert micro STX to STX
    monthlyAmounts[monthKey] = (monthlyAmounts[monthKey] || 0) + stxAmount;
  }
});
console.log(JSON.stringify({ monthlyAmounts }));

IMPORTANT: Always use console.log(JSON.stringify(result)) at the end to output your results!

🚨 CRITICAL STX CONVERSION FOR GRAPHS:
- STX amounts in blockchain data are in MICRO STX (1 STX = 1,000,000 micro STX)
- For GRAPHS: ALWAYS divide by 1,000,000 to convert to regular STX
- Example: 1,524,630,000,000,000 micro STX → 1,524,630,000 STX
- This prevents huge unreadable numbers in charts

ERROR HANDLING FLOW:
1. If your code has errors, this tool will return error details
2. The AI should then call debugAndFixCode tool with the error information
3. debugAndFixCode will automatically fix common issues and re-execute the code
4. If debugAndFixCode still fails, it will provide suggestions for manual fixes

COMMON CODE ISSUES THAT GET AUTO-FIXED:
- Using 'return' instead of 'console.log(JSON.stringify())'
- Missing fs.readFileSync setup
- Wrong date field usage (block_time_iso vs burn_block_time)
- Syntax errors with || operators`,
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Wallet address to analyze",
                },
                code: {
                  type: "string",
                  description:
                    "JavaScript code to execute on aggregated transaction data. Must read from 'cache.tmp.json' and output results with console.log(JSON.stringify(result)). Optional when code_status=false.",
                },
                totalTransactions: {
                  type: "number",
                  description: "Total number of transactions to process",
                },
                code_status: {
                  type: "boolean",
                  description:
                    "Whether to execute code (true, default) or only fetch/cache data (false). Use false for pre-fetching.",
                  default: true,
                },
              },
              required: ["address", "totalTransactions"],
            },
          },
          {
            name: "debugAndFixCode",
            description: `Debug and fix JavaScript code that failed during Spider Mode execution.

COMMON ERRORS AND FIXES:
1. SyntaxError: Missing semicolons, brackets, or quotes
2. ReferenceError: Undefined variables or wrong property names
3. TypeError: Calling methods on undefined/null values
4. Logic errors: Wrong array indexing or data access

RETURNS: Fixed JavaScript code that should work with the transaction data structure.

This tool automatically analyzes the error and provides corrected code.`,
            inputSchema: {
              type: "object",
              properties: {
                originalCode: {
                  type: "string",
                  description: "The original JavaScript code that failed",
                },
                errorMessage: {
                  type: "string",
                  description: "Error message from failed execution",
                },
                stderr: {
                  type: "string",
                  description: "Standard error output",
                },
                attempt: {
                  type: "number",
                  description: "Current attempt number",
                },
              },
              required: ["originalCode", "errorMessage"],
            },
          },
          {
            name: "preloadTransactionData",
            description: `Start background preloading of transaction data for faster Spider Mode execution.

This tool fetches all transaction data in the background and caches it, making subsequent executeSpiderAnalysis calls much faster.

USAGE: Call this first when you know you'll need comprehensive analysis.
RETURNS: Status message about preloading progress.

Note: This is optional - executeSpiderAnalysis will fetch data automatically if not preloaded.`,
            inputSchema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "Wallet address to preload data for",
                },
                totalTransactions: {
                  type: "number",
                  description: "Total number of transactions to preload",
                },
              },
              required: ["address", "totalTransactions"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "getWalletData":
            return await this.handleGetWalletData(args);
          case "getTransactions":
            return await this.handleGetTransactions(args);
          case "executeSpiderAnalysis":
            return await this.handleExecuteSpiderAnalysis(args);
          case "debugAndFixCode":
            return await this.handleDebugAndFixCode(args);
          case "preloadTransactionData":
            return await this.handlePreloadTransactionData(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`[BlockIQ MCP Server] Error in ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  /**
   * Handle getWalletData tool call
   */
  async handleGetWalletData(args) {
    const { address } = args;
    console.log(`[BlockIQ MCP] 🔌 Fetching wallet data for: ${address}`);

    try {
      // Fetch both balance and transaction data
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
        ),
        fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=20`
        ),
      ]);

      if (!balanceResponse.ok) {
        throw new Error(
          `Balance API request failed: ${balanceResponse.status} ${balanceResponse.statusText}`
        );
      }

      if (!transactionsResponse.ok) {
        throw new Error(
          `Transactions API request failed: ${transactionsResponse.status} ${transactionsResponse.statusText}`
        );
      }

      const balance = await balanceResponse.json();
      const transactionData = await transactionsResponse.json();

      const result = {
        address,
        balance,
        transactions: transactionData.results || [],
        totalTransactions: transactionData.total || 0,
      };

      console.log(`[BlockIQ MCP] ✅ Wallet data fetched successfully`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[BlockIQ MCP] ❌ Error fetching wallet data:`, error);
      throw error;
    }
  }

  /**
   * Handle getTransactions tool call
   */
  async handleGetTransactions(args) {
    const { address, limit = 50, offset = 0 } = args;
    console.log(
      `[BlockIQ MCP] 🔌 Fetching transactions for: ${address} (limit: ${limit}, offset: ${offset})`
    );

    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(`[BlockIQ MCP] ✅ Transactions fetched successfully`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[BlockIQ MCP] ❌ Error fetching transactions:`, error);
      throw error;
    }
  }

  /**
   * Handle executeSpiderAnalysis tool call - Core Spider Mode functionality
   */
  async handleExecuteSpiderAnalysis(args) {
    const { address, code, totalTransactions, code_status = true } = args;

    if (code_status === false) {
      console.log(`[BlockIQ MCP] 🚀 Starting data pre-fetch for: ${address}`);
      console.log(
        `[BlockIQ MCP] 📊 Pre-fetching ${totalTransactions} transactions for caching`
      );
    } else {
      console.log(
        `[BlockIQ MCP] 🕷️ Executing Spider Mode analysis for: ${address}`
      );
      console.log(
        `[BlockIQ MCP] 📊 Processing ${totalTransactions} transactions with custom code`
      );
    }

    try {
      const result = await this.executeSpiderModeCore(
        address,
        code,
        totalTransactions,
        code_status
      );

      // Check if result indicates an error that needs debugging
      if (result.error && result.needsCodeFix) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: true,
                  message:
                    "JavaScript code execution failed. Use debugAndFixCode tool to automatically fix and retry.",
                  errorDetails: result.errorMessage,
                  stderr: result.stderr,
                  originalCode: result.originalCode,
                  suggestion:
                    "Call debugAndFixCode with the originalCode and errorMessage to automatically fix common issues.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[BlockIQ MCP] ❌ Spider Mode execution error:`, error);
      throw error;
    }
  }

  /**
   * Core Spider Mode execution logic (ported from spider-execution.ts)
   */
  async executeSpiderModeCore(
    address,
    code,
    totalTransactions,
    code_status = true
  ) {
    const baseUri = `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions`;
    const aggregatedFilePath = "cache.tmp.json";

    // Check if background preloading is in progress
    if (preloadingState.has(address)) {
      console.log(
        "[BlockIQ MCP] ⏳ Background preloading in progress, waiting..."
      );
      try {
        await preloadingState.get(address);
        console.log("[BlockIQ MCP] ✅ Background preloading completed");
      } catch (error) {
        console.log("[BlockIQ MCP] ⚠️ Background preloading failed:", error);
      }
    }

    // Check for existing cached data
    let useExistingData = false;
    let totalBatches = 0;

    try {
      const existingDataRaw = await fs.readFile(aggregatedFilePath, "utf8");
      const existingData = JSON.parse(existingDataRaw);

      if (existingData._metadata && existingData.data) {
        const metadata = existingData._metadata;
        if (
          metadata.address === address &&
          metadata.totalTransactions === totalTransactions
        ) {
          console.log(
            `[BlockIQ MCP] ✅ Found complete cached data for ${address}`
          );
          useExistingData = true;
          totalBatches = metadata.batches;
        }
      }
    } catch (error) {
      console.log(
        "[BlockIQ MCP] ⚠️ No cached data found, will fetch fresh data"
      );
    }

    // Fetch data if not cached
    if (!useExistingData) {
      console.log("[BlockIQ MCP] 🔄 Fetching ALL transactions...");

      const limit = 50;
      const maxConcurrent = 2; // Reduced from 5 to 2 to avoid rate limits
      let offset = 0;
      const allTransactionData = [];

      while (offset < totalTransactions) {
        const batch = [];
        for (
          let i = 0;
          i < maxConcurrent && offset + i * limit < totalTransactions;
          i++
        ) {
          const currentOffset = offset + i * limit;
          const url = `${baseUri}?limit=${limit}&offset=${currentOffset}`;

          batch.push(
            fetch(url)
              .then(async (response) => {
                if (!response.ok) {
                  if (response.status === 429) {
                    console.log(
                      `[BlockIQ MCP] ⏳ Rate limited at offset ${currentOffset}, waiting 2s...`
                    );
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    // Retry once
                    const retryResponse = await fetch(url);
                    if (!retryResponse.ok) {
                      throw new Error(
                        `API request failed: ${retryResponse.status} ${retryResponse.statusText}`
                      );
                    }
                    return await retryResponse.json();
                  }
                  throw new Error(
                    `API request failed: ${response.status} ${response.statusText}`
                  );
                }
                return await response.json();
              })
              .catch((error) => {
                console.error(
                  `[BlockIQ MCP] Error fetching offset ${currentOffset}:`,
                  error.message
                );
                return null;
              })
          );
        }

        const results = await Promise.all(batch);
        allTransactionData.push(...results.filter(Boolean));
        offset += maxConcurrent * limit;

        // Increased rate limiting delay
        if (offset < totalTransactions) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Increased from 200ms to 500ms
        }

        // Enhanced progress logging
        const progress = Math.min(100, (offset / totalTransactions) * 100);
        const fetchedSoFar = Math.min(offset, totalTransactions);
        console.log(
          `[BlockIQ MCP] 📊 Fetch progress: ${progress.toFixed(
            1
          )}% (${fetchedSoFar}/${totalTransactions} transactions)`
        );

        // Show batch completion
        const batchesCompleted = allTransactionData.length;
        console.log(
          `[BlockIQ MCP] 📦 Completed ${batchesCompleted} batches, ${
            results.filter(Boolean).length
          } successful in this batch`
        );
      }

      totalBatches = allTransactionData.length;

      // Save aggregated data with metadata
      const dataWithMetadata = {
        _metadata: {
          address,
          totalTransactions,
          fetchedAt: new Date().toISOString(),
          batches: allTransactionData.length,
        },
        data: allTransactionData,
      };

      await fs.writeFile(
        aggregatedFilePath,
        JSON.stringify(dataWithMetadata, null, 2)
      );
      console.log(
        `[BlockIQ MCP] 💾 Saved aggregated data to ${aggregatedFilePath}`
      );
    }

    // Execute the JavaScript code only if code_status is true
    if (code_status === false) {
      console.log("[BlockIQ MCP] ✅ Data pre-fetch completed successfully");
      console.log(
        `[BlockIQ MCP] 💾 Cached ${totalBatches} batches of transaction data`
      );
      return {
        success: true,
        prefetch: true,
        message: "Transaction data successfully pre-fetched and cached",
        totalBatches,
        fileName: aggregatedFilePath,
        address,
        totalTransactions,
      };
    }

    // Validate that code is provided when code_status is true
    if (!code || code.trim() === "") {
      return {
        error: true,
        errorMessage: "JavaScript code is required when code_status is true",
        totalBatches,
        fileName: aggregatedFilePath,
      };
    }

    console.log("[BlockIQ MCP] ⚡ Executing user code...");
    const scriptPath = "temp_spider_analysis_script.js";

    try {
      await fs.writeFile(scriptPath, code);
      const { stdout, stderr } = await execAsync(`node ${scriptPath}`);

      // Clean up temp script
      await fs.unlink(scriptPath).catch(() => {});

      let result;
      try {
        result = JSON.parse(stdout);
      } catch {
        result = stdout;
      }

      console.log("[BlockIQ MCP] ✅ Spider analysis completed successfully");
      return {
        success: true,
        result,
        totalBatches,
        fileName: aggregatedFilePath,
      };
    } catch (error) {
      // Clean up temp script on error
      await fs.unlink(scriptPath).catch(() => {});

      console.log("[BlockIQ MCP] ❌ Spider analysis failed:", error.message);

      // Return error details for AI to debug
      return {
        error: true,
        errorMessage: error.message,
        stderr: error.stderr || "",
        totalBatches,
        fileName: aggregatedFilePath,
        needsCodeFix: true,
        originalCode: code,
        debugSuggestion:
          "The JavaScript code has an error. Use debugAndFixCode tool to fix it and try again.",
      };
    }
  }

  /**
   * Handle debugAndFixCode tool call - Actually fixes and executes the code
   */
  async handleDebugAndFixCode(args) {
    const { originalCode, errorMessage, stderr, attempt = 1 } = args;
    console.log(
      `[BlockIQ MCP] 🐛 Auto-fixing and executing code - Attempt ${attempt}`
    );

    // Check if aggregated data exists
    const aggregatedFilePath = "cache.tmp.json";
    try {
      await fs.access(aggregatedFilePath);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: true,
              message:
                "No cached transaction data found. Run executeSpiderAnalysis first.",
            }),
          },
        ],
      };
    }

    // Auto-fix common code issues
    let fixedCode = originalCode;

    // Fix 1: Replace 'return' with console.log(JSON.stringify())
    if (fixedCode.includes("return ")) {
      fixedCode = fixedCode.replace(
        /return\s+(.+);?$/gm,
        "console.log(JSON.stringify($1));"
      );
      console.log(
        "[BlockIQ MCP] 🔧 Fixed: Replaced 'return' with 'console.log(JSON.stringify())'"
      );
    }

    // Fix 2: Add missing fs.readFileSync if not present
    if (!fixedCode.includes("fs.readFileSync")) {
      fixedCode = `const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('cache.tmp.json', 'utf8'));
${fixedCode}`;
      console.log("[BlockIQ MCP] 🔧 Fixed: Added missing fs.readFileSync");
    }

    // Fix 3: Fix common syntax issues
    fixedCode = fixedCode.replace(
      /fileData\.data\s+fileData/g,
      "fileData.data || fileData"
    );
    fixedCode = fixedCode.replace(
      /batch\.results\s+\[\]/g,
      "batch.results || []"
    );
    fixedCode = fixedCode.replace(/\(acc\s+0\)/g, "(acc || 0)");

    // Fix 4: Fix date field issues (burn_block_time vs block_time_iso)
    if (fixedCode.includes("block_time_iso")) {
      fixedCode = fixedCode.replace(/block_time_iso/g, "burn_block_time");
      fixedCode = fixedCode.replace(
        /new Date\(tx\.burn_block_time\)/g,
        "new Date(tx.burn_block_time * 1000)"
      );
      console.log("[BlockIQ MCP] 🔧 Fixed: Corrected date field usage");
    }

    // Fix 5: Ensure proper data extraction
    if (!fixedCode.includes("data.flatMap")) {
      fixedCode = fixedCode.replace(
        /const data = fileData\.data \|\| fileData;/,
        `const data = fileData.data || fileData;
const allTransactions = data.flatMap(batch => batch.results || []);`
      );
      console.log("[BlockIQ MCP] 🔧 Fixed: Added proper data extraction");
    }

    // Execute the fixed code
    const scriptPath = "temp_debug_script.js";
    try {
      await fs.writeFile(scriptPath, fixedCode);
      const { stdout, stderr: execStderr } = await execAsync(
        `node ${scriptPath}`
      );

      // Clean up temp script
      await fs.unlink(scriptPath).catch(() => {});

      let result;
      try {
        result = JSON.parse(stdout);
      } catch {
        result = stdout;
      }

      console.log("[BlockIQ MCP] ✅ Code fixed and executed successfully");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                result,
                fixedCode,
                fixesApplied: [
                  "Replaced 'return' with 'console.log(JSON.stringify())'",
                  "Added missing fs.readFileSync",
                  "Fixed syntax issues",
                  "Corrected date field usage",
                  "Added proper data extraction",
                ],
                attempt,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      // Clean up temp script on error
      await fs.unlink(scriptPath).catch(() => {});

      console.log(
        `[BlockIQ MCP] ❌ Code fix attempt ${attempt} failed:`,
        error.message
      );

      // If this is not the first attempt, return the error
      if (attempt >= 3) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: true,
                  message: `Code fix failed after ${attempt} attempts`,
                  lastError: error.message,
                  stderr: error.stderr || "",
                  fixedCode,
                  suggestion:
                    "The code has complex issues that require manual review.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Return error for AI to try again
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: true,
                needsMoreFixes: true,
                errorMessage: error.message,
                stderr: error.stderr || "",
                fixedCode,
                attempt,
                suggestion:
                  "The auto-fix didn't resolve all issues. Please provide a corrected version of the code.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }

  /**
   * Handle preloadTransactionData tool call
   */
  async handlePreloadTransactionData(args) {
    const { address, totalTransactions } = args;
    console.log(
      `[BlockIQ MCP] 🚀 Starting synchronous preload for: ${address}`
    );

    try {
      // Call executeSpiderModeCore with code_status=false to cache data
      const result = await this.executeSpiderModeCore(
        address,
        "",
        totalTransactions,
        false
      );

      console.log(
        `[BlockIQ MCP] ✅ Preload completed successfully for ${address}`
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "completed",
              message: "Transaction data successfully preloaded and cached",
              address,
              totalTransactions,
              result,
            }),
          },
        ],
      };
    } catch (error) {
      console.error(`[BlockIQ MCP] ❌ Preload failed for ${address}:`, error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "Failed to preload transaction data",
              error: error.message,
              address,
              totalTransactions,
            }),
          },
        ],
      };
    }
  }

  /**
   * Background preloading implementation
   */
  async backgroundPreload(address, totalTransactions) {
    const baseUri = `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions`;
    const aggregatedFilePath = "cache.tmp.json";

    console.log(
      `[BlockIQ MCP] 📡 Background fetching ALL transactions for ${address}...`
    );

    const limit = 50;
    const maxConcurrent = 2; // Reduced from 5 to 2 to avoid rate limits
    let offset = 0;
    const allTransactionData = [];

    while (offset < totalTransactions) {
      const batch = [];
      for (
        let i = 0;
        i < maxConcurrent && offset + i * limit < totalTransactions;
        i++
      ) {
        const currentOffset = offset + i * limit;
        const url = `${baseUri}?limit=${limit}&offset=${currentOffset}`;

        batch.push(
          fetch(url)
            .then(async (response) => {
              if (!response.ok) {
                if (response.status === 429) {
                  console.log(
                    `[BlockIQ MCP] ⏳ Background rate limited at offset ${currentOffset}, waiting 2s...`
                  );
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  // Retry once
                  const retryResponse = await fetch(url);
                  if (!retryResponse.ok) {
                    throw new Error(
                      `Background API request failed: ${retryResponse.status} ${retryResponse.statusText}`
                    );
                  }
                  return await retryResponse.json();
                }
                throw new Error(
                  `Background API request failed: ${response.status} ${response.statusText}`
                );
              }
              return await response.json();
            })
            .catch((error) => {
              console.error(
                `[BlockIQ MCP] Background fetch error at offset ${currentOffset}:`,
                error.message
              );
              return null;
            })
        );
      }

      const results = await Promise.all(batch);
      allTransactionData.push(...results.filter(Boolean));
      offset += maxConcurrent * limit;

      // Increased rate limiting delay
      if (offset < totalTransactions) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Increased from 200ms to 500ms
      }

      // Enhanced progress logging for background preload
      const progress = Math.min(100, (offset / totalTransactions) * 100);
      const fetchedSoFar = Math.min(offset, totalTransactions);
      console.log(
        `[BlockIQ MCP] 📊 Background preload progress: ${progress.toFixed(
          1
        )}% (${fetchedSoFar}/${totalTransactions} transactions)`
      );

      // Show batch completion
      const batchesCompleted = allTransactionData.length;
      console.log(
        `[BlockIQ MCP] 📦 Background completed ${batchesCompleted} batches, ${
          results.filter(Boolean).length
        } successful in this batch`
      );
    }

    // Save aggregated data with metadata
    const dataWithMetadata = {
      _metadata: {
        address,
        totalTransactions,
        fetchedAt: new Date().toISOString(),
        batches: allTransactionData.length,
      },
      data: allTransactionData,
    };

    await fs.writeFile(
      aggregatedFilePath,
      JSON.stringify(dataWithMetadata, null, 2)
    );
    console.log(
      `[BlockIQ MCP] 💾 Background preload saved to ${aggregatedFilePath}`
    );

    return {
      totalBatches: allTransactionData.length,
      totalTransactions,
      cached: false,
    };
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(
      "[BlockIQ MCP Server] 🚀 BlockIQ MCP Server started successfully"
    );
  }
}

// Start the server
const server = new BlockIQMCPServer();
server.start().catch((error) => {
  console.error("[BlockIQ MCP Server] Failed to start server:", error);
  process.exit(1);
});
