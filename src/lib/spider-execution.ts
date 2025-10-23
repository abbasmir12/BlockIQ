/**
 * Spider Mode Execution Engine for BlockIQ
 *
 * Ports existing Pro Agent Mode logic from ai-service.ts to work with MCP
 * Provides comprehensive transaction data fetching, aggregation, and JavaScript code execution
 * with automatic error recovery and debugging capabilities.
 */

import { WalletData } from "@/types/stacks";

// Spider Mode response types
interface SpiderModeMetadata {
  success?: boolean;
  error?: boolean;
  errorMessage?: string;
  stderr?: string;
  result?: unknown;
  totalBatches: number;
  fileName: string;
  needsCodeFix?: boolean;
  originalCode?: string;
  attempt?: number;
  maxRetries?: number;
  dataStructure?: {
    format: string;
    batchStructure: string;
    transactionStructure: string;
    example: string;
  };
}

interface SpiderModeResponse {
  _spiderMode: SpiderModeMetadata;
  [key: string]: unknown;
}

// Global preloading state to sync background and Spider Mode requests
const preloadingState = new Map<
  string,
  Promise<{ totalBatches: number; totalTransactions: number; cached: boolean }>
>();

/**
 * Background transaction data preloading for Spider Mode
 * Ported from ai-service.ts preloadTransactionData function
 */
export async function preloadTransactionData(walletData: WalletData): Promise<{
  totalBatches: number;
  totalTransactions: number;
  cached: boolean;
}> {
  const address = walletData.address;

  // Check if preloading is already in progress for this address
  if (preloadingState.has(address)) {
    console.log(
      "[Spider Mode] 🔄 Preloading already in progress for:",
      address
    );
    return await preloadingState.get(address)!;
  }

  console.log(
    "[Spider Mode] 🚀 Starting background transaction preload for:",
    address
  );

  // Create and store the preloading promise
  const preloadPromise = (async () => {
    const baseUri = `https://api.testnet.hiro.so/extended/v1/address/${walletData.address}/transactions`;
    const totalTransactions = walletData.totalTransactions || 1000;

    const fs = await import("fs");
    const aggregatedFilePath = "aggregated_transactions.json";

    // Check if we already have complete data for this address
    if (fs.existsSync(aggregatedFilePath)) {
      try {
        const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
        const existingData = JSON.parse(existingDataRaw);

        // Check if data has metadata (new format) or is legacy format
        if (existingData._metadata && existingData.data) {
          // New format with metadata
          const metadata = existingData._metadata;
          if (
            metadata.address === walletData.address &&
            metadata.totalTransactions === totalTransactions
          ) {
            console.log(
              `[Spider Mode] ✅ Complete cached data already exists for ${walletData.address}`
            );
            return {
              totalBatches: metadata.batches,
              totalTransactions: metadata.totalTransactions,
              cached: true,
            };
          }
        }
      } catch (error) {
        console.log(
          "[Spider Mode] ⚠️ Error reading existing data, will fetch fresh:",
          error
        );
      }
    }

    // Fetch all transactions in background
    console.log("[Spider Mode] 📡 Background fetching ALL transactions...");

    const limit = 50;
    const maxConcurrent = 5;
    let offset = 0;
    const allTransactionData: unknown[] = [];

    // Fetch all transactions in batches
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
            .then((response) => response.json())
            .then((data) => data)
            .catch((error) => {
              console.error(
                `[Spider Mode] Error fetching offset ${currentOffset}:`,
                error
              );
              return null;
            })
        );
      }

      const results = await Promise.all(batch);
      allTransactionData.push(...results.filter(Boolean));

      offset += maxConcurrent * limit;

      // Add small delay to avoid overwhelming the API
      if (offset < totalTransactions) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay to avoid rate limits
      }

      // Log progress
      const progress = Math.min(100, (offset / totalTransactions) * 100);
      console.log(
        `[Spider Mode] 📊 Background preload progress: ${progress.toFixed(
          1
        )}% (${offset}/${totalTransactions})`
      );
    }

    console.log(
      `[Spider Mode] ✅ Background preload complete: ${allTransactionData.length} batches`
    );

    // Save aggregated data with metadata
    const dataWithMetadata = {
      _metadata: {
        address: walletData.address,
        totalTransactions: totalTransactions,
        fetchedAt: new Date().toISOString(),
        batches: allTransactionData.length,
      },
      data: allTransactionData,
    };

    // Clean the file first
    if (fs.existsSync(aggregatedFilePath)) {
      fs.unlinkSync(aggregatedFilePath);
    }

    // Write aggregated data
    fs.writeFileSync(
      aggregatedFilePath,
      JSON.stringify(dataWithMetadata, null, 2)
    );
    console.log(
      `[Spider Mode] 💾 Background preload saved to ${aggregatedFilePath}`
    );

    return {
      totalBatches: allTransactionData.length,
      totalTransactions: totalTransactions,
      cached: false,
    };
  })();

  // Store the promise in global state
  preloadingState.set(address, preloadPromise);

  try {
    const result = await preloadPromise;
    return result;
  } finally {
    // Clean up the promise from global state when done
    preloadingState.delete(address);
  }
}

/**
 * Core Spider Mode execution function
 * Ported from ai-service.ts executeProAgentMode function
 */
async function executeSpiderModeCore(
  baseUri: string,
  code: string,
  totalTransactions: number,
  maxRetries: number = 10,
  currentAttempt: number = 1
): Promise<unknown> {
  console.log("[Spider Mode] 🔥 Starting Spider Mode execution...");

  const fs = await import("fs");
  const aggregatedFilePath = "aggregated_transactions.json";

  // Extract address from URI for cache validation
  const addressMatch = baseUri.match(/address\/([A-Z0-9]+)\//);
  const currentAddress = addressMatch ? addressMatch[1] : null;

  // Check if background preloading is in progress for this address
  if (currentAddress && preloadingState.has(currentAddress)) {
    console.log(
      "[Spider Mode] ⏳ Background preloading in progress, waiting for completion..."
    );
    try {
      await preloadingState.get(currentAddress);
      console.log(
        "[Spider Mode] ✅ Background preloading completed, using cached data"
      );

      // After background preload completes, we should have the data cached
      // Skip the manual fetching and go straight to code execution
      let totalBatches = 0;
      try {
        const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
        const existingData = JSON.parse(existingDataRaw);

        if (existingData._metadata && existingData.data) {
          totalBatches = existingData._metadata.batches;
        } else if (Array.isArray(existingData)) {
          totalBatches = existingData.length;
        }

        console.log(
          "[Spider Mode] 🚀 Using background preloaded data, skipping fetch"
        );

        // Execute the provided code directly
        console.log("[Spider Mode] ⚡ Executing user code...");
        const { exec } = await import("child_process");

        const scriptPath = "temp_spider_analysis_script.js";
        fs.writeFileSync(scriptPath, code);

        return new Promise((resolve) => {
          exec(
            `node ${scriptPath}`,
            (error: Error | null, stdout: string, stderr: string) => {
              if (fs.existsSync(scriptPath)) {
                fs.unlinkSync(scriptPath);
              }

              if (error) {
                console.error(
                  `[Spider Mode] Code execution error (attempt ${currentAttempt}/${maxRetries}):`,
                  error
                );

                if (currentAttempt < maxRetries) {
                  console.log(
                    "[Spider Mode] 🔄 Attempting to fix code with AI..."
                  );
                  resolve({
                    _spiderMode: {
                      needsCodeFix: true,
                      error: true,
                      errorMessage: error.message,
                      stderr: stderr,
                      originalCode: code,
                      attempt: currentAttempt,
                      maxRetries: maxRetries,
                      totalBatches: totalBatches,
                      fileName: aggregatedFilePath,
                      dataStructure: {
                        format:
                          "New format: {_metadata: {address, totalTransactions, fetchedAt, batches}, data: [batch objects]}",
                        batchStructure:
                          "Each batch: {limit: 50, offset: 0, total: 15595, results: [transactions...]}",
                        transactionStructure:
                          "Each transaction: {tx_id, tx_type, sender_address, token_transfer?: {recipient_address, amount, memo}, ...}",
                        example:
                          "const data = fileData.data || fileData; const allTransactions = data.flatMap(batch => batch.results || []);",
                      },
                    },
                  });
                } else {
                  resolve({
                    _spiderMode: {
                      error: true,
                      errorMessage: `Max retries (${maxRetries}) reached. Final error: ${error.message}`,
                      stderr: stderr,
                      totalBatches: totalBatches,
                      fileName: aggregatedFilePath,
                    },
                  });
                }
              } else {
                console.log("[Spider Mode] ✅ Code executed successfully");
                let result;
                try {
                  result = JSON.parse(stdout);
                } catch {
                  result = stdout;
                }

                resolve({
                  _spiderMode: {
                    success: true,
                    result: result,
                    totalBatches: totalBatches,
                    fileName: aggregatedFilePath,
                  },
                });
              }
            }
          );
        });
      } catch (fileError) {
        console.log(
          "[Spider Mode] ⚠️ Could not read cached data after background preload:",
          fileError
        );
      }
    } catch (error) {
      console.log(
        "[Spider Mode] ⚠️ Background preloading failed, will fetch fresh data:",
        error
      );
    }
  }

  // Check if we already have complete data for this address
  let useExistingData = false;

  // If background preloading was in progress, we should now have cached data
  if (fs.existsSync(aggregatedFilePath) && currentAddress) {
    try {
      const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
      const existingData = JSON.parse(existingDataRaw);

      // Check if data has metadata (new format) or is legacy format
      if (existingData._metadata && existingData.data) {
        // New format with metadata
        const metadata = existingData._metadata;
        if (
          metadata.address === currentAddress &&
          metadata.totalTransactions === totalTransactions
        ) {
          console.log(
            `[Spider Mode] ✅ Found complete cached data for address ${currentAddress}`
          );
          console.log(
            `[Spider Mode] 📊 Cached: ${metadata.batches} batches, ${metadata.totalTransactions} transactions`
          );
          console.log(`[Spider Mode] 🕒 Cached at: ${metadata.fetchedAt}`);
          useExistingData = true;
        } else {
          console.log(
            `[Spider Mode] ⚠️ Cached data is for different address or transaction count`
          );
          console.log(
            `[Spider Mode]    Cached: ${metadata.address} (${metadata.totalTransactions} txs)`
          );
          console.log(
            `[Spider Mode]    Current: ${currentAddress} (${totalTransactions} txs)`
          );
        }
      } else if (Array.isArray(existingData) && existingData.length > 0) {
        // Legacy format - check if data is complete
        const firstBatch = existingData[0];
        const lastBatch = existingData[existingData.length - 1];

        if (firstBatch?.total && lastBatch?.offset !== undefined) {
          const totalInFile = firstBatch.total;
          const lastOffset = lastBatch.offset;
          const lastBatchSize = lastBatch.results?.length || 0;
          const totalFetched = lastOffset + lastBatchSize;

          // Check if we have complete data for the same address
          if (
            totalInFile === totalTransactions &&
            totalFetched >= totalTransactions
          ) {
            console.log(
              `[Spider Mode] ✅ Found complete cached data (legacy format)`
            );
            console.log(
              `[Spider Mode] 📊 Cached: ${totalFetched}/${totalTransactions} transactions`
            );
            useExistingData = true;
          } else {
            console.log(
              `[Spider Mode] ⚠️ Cached data incomplete: ${totalFetched}/${totalTransactions} transactions`
            );
          }
        }
      }
    } catch (error) {
      console.log(
        "[Spider Mode] ⚠️ Error reading existing data, will re-fetch:",
        error
      );
    }
  }

  let totalBatches = 0;

  // If we don't have complete data, fetch it (but only if background preload isn't handling it)
  if (!useExistingData) {
    // Double-check if background preload is still running
    if (currentAddress && preloadingState.has(currentAddress)) {
      console.log(
        "[Spider Mode] 🛑 Background preload still in progress, aborting Spider Mode fetch to avoid conflicts"
      );
      return {
        _spiderMode: {
          error: true,
          errorMessage:
            "Background preload in progress, please wait and try again",
          totalBatches: 0,
          fileName: aggregatedFilePath,
        },
      };
    }

    console.log("[Spider Mode] 🔄 Fetching ALL transactions...");

    const limit = 50;
    const maxConcurrent = 5;
    let offset = 0;
    const allTransactionData: unknown[] = [];

    // Fetch all transactions in batches
    while (offset < totalTransactions) {
      const batch = [];
      for (
        let i = 0;
        i < maxConcurrent && offset + i * limit < totalTransactions;
        i++
      ) {
        const currentOffset = offset + i * limit;
        const url = `${baseUri}?limit=${limit}&offset=${currentOffset}`;

        console.log(`[Spider Mode] 📡 Fetching batch: ${url}`);

        batch.push(
          fetch(url)
            .then((response) => response.json())
            .then((data) => data)
            .catch((error) => {
              console.error(
                `[Spider Mode] Error fetching offset ${currentOffset}:`,
                error
              );
              return null;
            })
        );
      }

      const results = await Promise.all(batch);
      allTransactionData.push(...results.filter(Boolean));

      offset += maxConcurrent * limit;

      // Add small delay to avoid overwhelming the API
      if (offset < totalTransactions) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay to avoid rate limits
      }
    }

    console.log(
      `[Spider Mode] 📊 Aggregated ${allTransactionData.length} transaction batches`
    );
    totalBatches = allTransactionData.length;

    // Clean the file first
    if (fs.existsSync(aggregatedFilePath)) {
      fs.unlinkSync(aggregatedFilePath);
    }

    // Write aggregated data with metadata
    const dataWithMetadata = {
      _metadata: {
        address: currentAddress,
        totalTransactions: totalTransactions,
        fetchedAt: new Date().toISOString(),
        batches: allTransactionData.length,
      },
      data: allTransactionData,
    };
    fs.writeFileSync(
      aggregatedFilePath,
      JSON.stringify(dataWithMetadata, null, 2)
    );
    console.log(
      `[Spider Mode] 💾 Saved aggregated data to ${aggregatedFilePath}`
    );
  } else {
    console.log(
      `[Spider Mode] 🚀 Using cached data from ${aggregatedFilePath}`
    );
    // Count batches from existing file
    try {
      const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
      const existingData = JSON.parse(existingDataRaw);

      if (existingData._metadata && existingData.data) {
        // New format with metadata
        totalBatches = existingData._metadata.batches;
      } else if (Array.isArray(existingData)) {
        // Legacy format
        totalBatches = existingData.length;
      } else {
        totalBatches = 0;
      }
    } catch {
      totalBatches = 0;
    }
  }

  try {
    // Execute the provided code (works for both cached and fresh data)
    console.log("[Spider Mode] ⚡ Executing user code...");
    const { exec } = await import("child_process");

    // Create a temporary script file
    const scriptPath = "temp_spider_analysis_script.js";
    fs.writeFileSync(scriptPath, code);

    return new Promise((resolve) => {
      exec(
        `node ${scriptPath}`,
        (error: Error | null, stdout: string, stderr: string) => {
          // Clean up temp script
          if (fs.existsSync(scriptPath)) {
            fs.unlinkSync(scriptPath);
          }

          if (error) {
            console.error(
              `[Spider Mode] Code execution error (attempt ${currentAttempt}/${maxRetries}):`,
              error
            );

            // If we have retries left, ask AI to fix the code
            if (currentAttempt < maxRetries) {
              console.log("[Spider Mode] 🔄 Attempting to fix code with AI...");
              resolve({
                _spiderMode: {
                  needsCodeFix: true,
                  error: true,
                  errorMessage: error.message,
                  stderr: stderr,
                  originalCode: code,
                  attempt: currentAttempt,
                  maxRetries: maxRetries,
                  totalBatches: totalBatches,
                  fileName: aggregatedFilePath,
                  dataStructure: {
                    format:
                      "New format: {_metadata: {address, totalTransactions, fetchedAt, batches}, data: [batch objects]}",
                    batchStructure:
                      "Each batch: {limit: 50, offset: 0, total: 15595, results: [transactions...]}",
                    transactionStructure:
                      "Each transaction: {tx_id, tx_type, sender_address, token_transfer?: {recipient_address, amount, memo}, ...}",
                    example:
                      "const data = fileData.data || fileData; const allTransactions = data.flatMap(batch => batch.results || []);",
                  },
                },
              });
            } else {
              // Max retries reached
              resolve({
                _spiderMode: {
                  error: true,
                  errorMessage: `Max retries (${maxRetries}) reached. Final error: ${error.message}`,
                  stderr: stderr,
                  totalBatches: totalBatches,
                  fileName: aggregatedFilePath,
                },
              });
            }
          } else {
            console.log("[Spider Mode] ✅ Code executed successfully");
            let result;
            try {
              result = JSON.parse(stdout);
            } catch {
              result = stdout;
            }

            resolve({
              _spiderMode: {
                success: true,
                result: result,
                totalBatches: totalBatches,
                fileName: aggregatedFilePath,
              },
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("[Spider Mode] Spider Mode execution error:", error);
    return {
      _spiderMode: {
        error: true,
        errorMessage: (error as Error).message,
        totalBatches: totalBatches,
        fileName: aggregatedFilePath,
      },
    };
  }
}

/**
 * Main Spider Mode execution function with automatic retry and code fixing
 * Ported from ai-service.ts executeProAgentWithRetry function
 */
export async function executeSpiderMode(
  address: string,
  code: string,
  totalTransactions: number,
  debugCodeFunction?: (
    originalCode: string,
    errorMessage: string,
    stderr: string,
    attempt: number
  ) => Promise<string>
): Promise<unknown> {
  const baseUri = `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions`;
  let currentCode = code;
  let attempt = 1;
  const maxRetries = 10;

  console.log(`[Spider Mode] 🕷️ Starting Spider Mode execution for ${address}`);
  console.log(
    `[Spider Mode] 📊 Processing ${totalTransactions} total transactions`
  );

  while (attempt <= maxRetries) {
    console.log(
      `[Spider Mode] 🔥 Spider Mode attempt ${attempt}/${maxRetries}`
    );

    const result = await executeSpiderModeCore(
      baseUri,
      currentCode,
      totalTransactions,
      maxRetries,
      attempt
    );
    const spiderResult = result as SpiderModeResponse;

    // If successful, return result
    if (spiderResult._spiderMode?.success) {
      console.log(
        `[Spider Mode] ✅ Spider Mode execution successful on attempt ${attempt}`
      );
      return result;
    }

    // If needs code fix and we have retries left
    if (
      spiderResult._spiderMode?.needsCodeFix &&
      attempt < maxRetries &&
      debugCodeFunction
    ) {
      console.log("[Spider Mode] 🤖 Asking AI to fix the code...");

      try {
        const fixedCode = await debugCodeFunction(
          spiderResult._spiderMode.originalCode || currentCode,
          spiderResult._spiderMode.errorMessage || "Unknown error",
          spiderResult._spiderMode.stderr || "",
          attempt
        );

        if (fixedCode && fixedCode.trim()) {
          console.log(
            "[Spider Mode] ✅ AI provided fixed code:",
            fixedCode.substring(0, 100) + "..."
          );
          currentCode = fixedCode;
          attempt++;
        } else {
          console.log("[Spider Mode] ❌ AI did not provide valid fixed code");
          break;
        }
      } catch (fixError) {
        console.error(
          "[Spider Mode] Failed to get code fix from AI:",
          fixError
        );
        return {
          _spiderMode: {
            error: true,
            errorMessage: `Failed to fix code automatically: ${fixError}`,
            totalBatches: spiderResult._spiderMode?.totalBatches || 0,
            fileName:
              spiderResult._spiderMode?.fileName ||
              "aggregated_transactions.json",
          },
        };
      }
    } else {
      // No more retries or not fixable
      console.log(
        `[Spider Mode] ❌ Spider Mode execution failed after ${attempt} attempts`
      );
      return result;
    }
  }

  console.log(
    "[Spider Mode] ❌ Max retries reached without successful execution"
  );
  return {
    _spiderMode: {
      error: true,
      errorMessage: "Max retries reached without successful execution",
      totalBatches: 0,
      fileName: "aggregated_transactions.json",
    },
  };
}

/**
 * Utility function to check if Spider Mode data is available for an address
 */
export async function isSpiderModeDataAvailable(
  address: string,
  totalTransactions: number
): Promise<boolean> {
  try {
    const fs = await import("fs");
    const aggregatedFilePath = "aggregated_transactions.json";

    if (!fs.existsSync(aggregatedFilePath)) {
      return false;
    }

    const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
    const existingData = JSON.parse(existingDataRaw);

    // Check if data has metadata (new format)
    if (existingData._metadata && existingData.data) {
      const metadata = existingData._metadata;
      return (
        metadata.address === address &&
        metadata.totalTransactions === totalTransactions
      );
    }

    return false;
  } catch (error) {
    console.error("[Spider Mode] Error checking data availability:", error);
    return false;
  }
}

/**
 * Utility function to get Spider Mode data statistics
 */
export async function getSpiderModeDataStats(address: string): Promise<{
  available: boolean;
  address?: string;
  totalTransactions?: number;
  batches?: number;
  fetchedAt?: string;
} | null> {
  try {
    const fs = await import("fs");
    const aggregatedFilePath = "aggregated_transactions.json";

    if (!fs.existsSync(aggregatedFilePath)) {
      return { available: false };
    }

    const existingDataRaw = fs.readFileSync(aggregatedFilePath, "utf8");
    const existingData = JSON.parse(existingDataRaw);

    // Check if data has metadata (new format)
    if (existingData._metadata && existingData.data) {
      const metadata = existingData._metadata;
      return {
        available: true,
        address: metadata.address,
        totalTransactions: metadata.totalTransactions,
        batches: metadata.batches,
        fetchedAt: metadata.fetchedAt,
      };
    }

    return { available: false };
  } catch (error) {
    console.error("[Spider Mode] Error getting data stats:", error);
    return null;
  }
}
