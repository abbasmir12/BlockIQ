import { NextRequest, NextResponse } from 'next/server'

// Background transaction preloading using MCP server
export async function POST(request: NextRequest) {
  try {
    const { walletData } = await request.json()

    if (!walletData || !walletData.address) {
      return NextResponse.json(
        { error: 'Wallet data is required' },
        { status: 400 }
      )
    }

    console.log(`[Preload API] 🚀 Starting background preload for: ${walletData.address}`);

    // Smart incremental caching system
    try {
      console.log(`[Preload API] 🧠 Starting smart incremental caching...`);
      
      const address = walletData.address;
      const aggregatedFilePath = "cache.tmp.json";
      const fs = await import('fs/promises');
      
      let existingCache = null;
      let needsUpdate = true;
      let newTransactionsCount = 0;
      let currentTotalTransactions = 0;
      
      // Step 1: Get the current total transaction count from API (lightweight call)
      console.log(`[Preload API] 🔍 Fetching current transaction count for ${address}...`);
      try {
        const countResponse = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=1&offset=0`);
        if (!countResponse.ok) {
          throw new Error(`Failed to fetch transaction count: ${countResponse.status}`);
        }
        const countData = await countResponse.json();
        currentTotalTransactions = countData.total || 0;
        console.log(`[Preload API] 📊 Current total transactions: ${currentTotalTransactions}`);
      } catch (error) {
        console.error(`[Preload API] ❌ Failed to fetch transaction count:`, error);
        // Fallback to provided count
        currentTotalTransactions = walletData.totalTransactions || 16423;
        console.log(`[Preload API] 🔄 Using fallback count: ${currentTotalTransactions}`);
      }
      
      // Step 2: Check if cache exists and analyze it
      try {
        const existingDataRaw = await fs.readFile(aggregatedFilePath, "utf8");
        existingCache = JSON.parse(existingDataRaw);
        
        if (existingCache._metadata) {
          const cachedAddress = existingCache._metadata.address;
          const cachedTransactionCount = existingCache._metadata.totalTransactions;
          
          console.log(`[Preload API] 📋 Cache Analysis:`);
          console.log(`  - Cached Address: ${cachedAddress}`);
          console.log(`  - Cached Count: ${cachedTransactionCount}`);
          console.log(`  - Current Address: ${address}`);
          console.log(`  - Current Count: ${currentTotalTransactions}`);
          
          if (cachedAddress === address) {
            // Same address - check if we need new transactions
            if (cachedTransactionCount === currentTotalTransactions) {
              console.log(`[Preload API] ✅ Cache is up-to-date! No new transactions detected.`);
              needsUpdate = false;
            } else if (cachedTransactionCount < currentTotalTransactions) {
              // New transactions detected!
              newTransactionsCount = currentTotalTransactions - cachedTransactionCount;
              console.log(`[Preload API] 🆕 Detected ${newTransactionsCount} new transactions! Fetching incrementally...`);
            } else {
              // Cache has more transactions than current count - this can happen due to API inconsistencies
              // Instead of rebuilding, let's check if the difference is small (< 10) and keep the cache
              const difference = cachedTransactionCount - currentTotalTransactions;
              if (difference <= 10) {
                console.log(`[Preload API] ⚠️ Cache has ${difference} more transactions than current count. Keeping cache as API counts can vary slightly.`);
                needsUpdate = false;
              } else {
                console.log(`[Preload API] ⚠️ Cache has ${difference} more transactions than current count. Significant difference - rebuilding cache...`);
                // Reset cache for rebuild
                existingCache = null;
              }
            }
          } else {
            // Different address - remove old cache and fetch new
            console.log(`[Preload API] 🔄 Different address detected. Removing old cache for ${cachedAddress}...`);
            await fs.unlink(aggregatedFilePath).catch(() => {}); // Ignore errors if file doesn't exist
            existingCache = null;
          }
        }
      } catch (error) {
        console.log(`[Preload API] 📝 No existing cache found. Creating new cache...`);
        existingCache = null;
      }
      
      if (!needsUpdate) {
        return NextResponse.json({ 
          success: true, 
          message: 'Cache is already up-to-date. No fetching needed.',
          address: walletData.address,
          totalTransactions: currentTotalTransactions,
          cached: true,
          cacheFile: aggregatedFilePath
        });
      }
      
      // Step 3: Determine what to fetch
      let allTransactionData = [];
      let newBatches = [];
      
      if (existingCache && newTransactionsCount > 0) {
        // Smart incremental update - fetch only new transactions with single API call
        console.log(`[Preload API] 📡 Fetching ${newTransactionsCount} new transactions with smart approach...`);
        
        try {
          const url = `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=${newTransactionsCount}&offset=0`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Create a single batch with the new transactions
          newBatches = [{
            offset: 0,
            limit: newTransactionsCount,
            total: data.total,
            results: data.results || []
          }];
          
          console.log(`[Preload API] ✅ Successfully fetched ${data.results?.length || 0} new transactions`);
          
          // Prepend new transactions to existing cache (newest first)
          allTransactionData = [...newBatches, ...(existingCache.data || [])];
          console.log(`[Preload API] 🔗 Merged ${newBatches.length} new batches with ${existingCache.data?.length || 0} existing batches`);
          
        } catch (error) {
          console.error(`[Preload API] ❌ Failed to fetch new transactions:`, error);
          // Fallback to existing cache
          allTransactionData = existingCache.data || [];
          newBatches = [];
        }
        
      } else if (!existingCache) {
        // Full fetch - new address or no cache (use batched approach for large datasets)
        console.log(`[Preload API] 📡 Fetching all ${currentTotalTransactions} transactions for ${address}...`);
        
        const limit = 50;
        const maxConcurrent = 2;
        let currentOffset = 0;
        
        while (currentOffset < currentTotalTransactions) {
          const batch = [];
          for (let i = 0; i < maxConcurrent && currentOffset + i * limit < currentTotalTransactions; i++) {
            const batchOffset = currentOffset + i * limit;
            const url = `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=${limit}&offset=${batchOffset}`;
            
            batch.push(
              fetch(url)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                  }
                  return response.json();
                })
                .then(data => ({ offset: batchOffset, limit: limit, total: data.total, results: data.results || [] }))
                .catch(error => {
                  console.error(`[Preload API] Error fetching offset ${batchOffset}:`, error);
                  return { offset: batchOffset, limit: limit, results: [], error: error.message };
                })
            );
          }
          
          const batchResults = await Promise.all(batch);
          newBatches.push(...batchResults);
          currentOffset += maxConcurrent * limit;
          
          // Add delay to avoid rate limiting
          if (currentOffset < currentTotalTransactions) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log(`[Preload API] 📊 Progress: ${Math.min(currentOffset, currentTotalTransactions)}/${currentTotalTransactions} transactions`);
        }
        
        allTransactionData = newBatches;
      } else {
        // No update needed - use existing cache
        allTransactionData = existingCache.data || [];
      }
      
      // Save updated cache
      const dataWithMetadata = {
        _metadata: {
          address,
          totalTransactions: currentTotalTransactions,
          batches: allTransactionData.length,
          timestamp: new Date().toISOString(),
          lastUpdate: existingCache ? existingCache._metadata.timestamp : new Date().toISOString(),
          incrementalUpdate: newTransactionsCount > 0,
          newTransactionsFetched: newTransactionsCount
        },
        data: allTransactionData,
      };
      
      await fs.writeFile(aggregatedFilePath, JSON.stringify(dataWithMetadata, null, 2));
      
      const message = newTransactionsCount > 0 
        ? `Incremental update completed! Fetched ${newTransactionsCount} new transactions.`
        : 'Full cache created successfully.';
        
      console.log(`[Preload API] 💾 ${message} Total batches: ${allTransactionData.length}`);
      
      return NextResponse.json({ 
        success: true, 
        message,
        address: walletData.address,
        totalTransactions: currentTotalTransactions,
        batches: allTransactionData.length,
        newTransactionsFetched: newTransactionsCount,
        incrementalUpdate: newTransactionsCount > 0,
        cacheFile: aggregatedFilePath
      })
    } catch (error) {
      console.error('[Preload API] ❌ MCP preload failed:', error);
      return NextResponse.json(
        { error: 'Failed to initiate background preloading' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Preload API Error:', error)
    return NextResponse.json(
      { error: 'Failed to preload transaction data' },
      { status: 500 }
    )
  }
}