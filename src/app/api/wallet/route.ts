import { NextRequest, NextResponse } from 'next/server'
import { fetchWalletData } from '@/lib/stacks-api'

export async function POST(request: NextRequest) {
  try {
    const { address, adkProvider, adkModel, adkApiKey } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Fetch wallet data from Stacks API
    const walletData = await fetchWalletData(address)
    
    // Generate AI summary using ADK Framework with correct provider settings
    try {
      const { ADKFrameworkIntegration } = await import('@/lib/adk-framework-integration');
      const providerSettings = {
        adkProvider: adkProvider || 'google',
        adkModel: adkModel || 'gemini-2.5-flash',
        adkApiKey: adkApiKey
      };
      
      const aiSummary = await ADKFrameworkIntegration.processQuery(
        "Provide a brief summary of this wallet's activity and key metrics", 
        walletData, 
        providerSettings
      );

      return NextResponse.json({
        walletData,
        aiSummary
      })
    } catch (error) {
      console.error('AI Summary Error:', error)
      // Return wallet data without AI summary if AI fails
      return NextResponse.json({
        walletData,
        aiSummary: 'AI summary temporarily unavailable'
      })
    }
  } catch (error) {
    console.error('Wallet API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}