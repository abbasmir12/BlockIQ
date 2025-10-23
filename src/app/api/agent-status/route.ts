import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[Agent Status API] 🔍 Checking agent status...');
    
    const startTime = Date.now();
    
    // Dynamic import to avoid client-side bundling issues
    const { ADKFrameworkIntegration } = await import('@/lib/adk-framework-integration');
    
    // Get agent health using ADK Framework
    const healthCheck = await ADKFrameworkIntegration.getAgentHealth();
    
    const responseTime = Date.now() - startTime;
    
    const status = {
      isReady: healthCheck.status === 'healthy',
      lastActivity: healthCheck.lastCheck,
      availableModes: ['normal', 'spider'], // ADK Framework supports both modes
      mcpToolsCount: healthCheck.toolsAvailable,
      health: {
        status: healthCheck.status,
        message: healthCheck.mcpConnected ? 'MCP tools connected' : 'MCP connection issues',
        timestamp: healthCheck.lastCheck
      },
      performance: {
        responseTime,
        successRate: 100, // Will be calculated client-side based on history
        totalRequests: 1 // Will be tracked client-side
      }
    };
    
    console.log('[Agent Status API] ✅ Status retrieved successfully');
    return NextResponse.json({ status });
    
  } catch (error) {
    console.error('[Agent Status API] ❌ Failed to get status:', error);
    
    const errorStatus = {
      isReady: false,
      lastActivity: new Date().toISOString(),
      availableModes: [],
      mcpToolsCount: 0,
      health: {
        status: 'unhealthy' as const,
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      },
      performance: {
        responseTime: 0,
        successRate: 0,
        totalRequests: 0
      }
    };
    
    return NextResponse.json({ status: errorStatus });
  }
}