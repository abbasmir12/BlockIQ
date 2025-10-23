import { NextRequest, NextResponse } from 'next/server'

// Pre-fetch transaction data when user clicks "Analyze"
export async function POST(request: NextRequest) {
  try {
    const { address, totalTransactions } = await request.json()

    if (!address || !totalTransactions) {
      return NextResponse.json(
        { error: 'Address and totalTransactions are required' },
        { status: 400 }
      )
    }

    console.log(`[Prefetch API] 🚀 Starting data pre-fetch for: ${address}`);
    console.log(`[Prefetch API] 📊 Pre-fetching ${totalTransactions} transactions`);

    try {
      const { ADKFrameworkIntegration } = await import('@/lib/adk-framework-integration');
      
      // Initialize the agent to get access to MCP tools
      await ADKFrameworkIntegration.initialize();
      
      // Call executeSpiderAnalysis with code_status=false to only fetch and cache data
      const prefetchQuery = `Pre-fetch all transaction data for analysis. Use executeSpiderAnalysis with code_status=false to cache data for address ${address}.`;
      
      const result = await ADKFrameworkIntegration.processQuery(
        prefetchQuery, 
        { 
          address, 
          totalTransactions,
          balance: { stx: { balance: '0', total_sent: '0', total_received: '0', lock_tx_id: '', locked: '0', lock_height: 0, burnchain_lock_height: 0, burnchain_unlock_height: 0 }, fungible_tokens: {}, non_fungible_tokens: {} },
          transactions: []
        }, 
        { adkProvider: 'google', adkModel: 'gemini-2.5-flash' }
      );
      
      console.log(`[Prefetch API] ✅ Pre-fetch completed successfully`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transaction data pre-fetched and cached successfully',
        address,
        totalTransactions,
        details: result
      })
    } catch (error) {
      console.error('[Prefetch API] ❌ Pre-fetch failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to pre-fetch transaction data',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Prefetch API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process pre-fetch request' },
      { status: 500 }
    )
  }
}