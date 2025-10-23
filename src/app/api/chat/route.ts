import { NextRequest, NextResponse } from 'next/server'
// ADK Framework Integration will be imported dynamically to avoid client-side issues

export async function POST(request: NextRequest) {
  try {
    const { question, walletData, apiKey, modelName, providerSettings } = await request.json()

    if (!question || !walletData) {
      return NextResponse.json(
        { error: 'Question and wallet data are required' },
        { status: 400 }
      )
    }

    console.log(`[API] 🔧 Provider settings:`, providerSettings);

    console.log(`[API] 🤖 Processing BlockIQ intelligent query: "${question}"`);
    
    try {
      // Use the new ADK Framework integration with configuration-based MCP
      const { ADKFrameworkIntegration } = await import('@/lib/adk-framework-integration');
      
      console.log(`[API] 🚀 Using ADK Framework with automatic MCP tool discovery`);
      const answer = await ADKFrameworkIntegration.processQuery(question, walletData, providerSettings);
      
      console.log(`[API] ✅ ADK Framework processing completed successfully`);
      return NextResponse.json({ answer });
      
    } catch (error) {
      console.error(`[API] ❌ BlockIQ processing failed:`, error);
      
      // Return error message instead of fallback
      console.log(`[API] ❌ BlockIQ processing failed, no fallback available`);
      
      return NextResponse.json({ 
        error: 'BlockIQ Agent is currently unavailable. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('[API] ❌ Chat API Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}