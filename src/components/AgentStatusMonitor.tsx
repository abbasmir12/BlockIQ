'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Dynamic imports to avoid client-side bundling issues

interface AgentStatus {
  isReady: boolean;
  lastActivity: string;
  availableModes: string[];
  mcpToolsCount: number;
  health: {
    status: 'healthy' | 'unhealthy' | 'initializing';
    message: string;
    timestamp: string;
  };
  performance: {
    responseTime: number;
    successRate: number;
    totalRequests: number;
  };
}

interface AgentStatusMonitorProps {
  compact?: boolean;
  showDetails?: boolean;
  onStatusChange?: (status: AgentStatus) => void;
}

export default function AgentStatusMonitor({ 
  compact = false, 
  showDetails = false,
  onStatusChange 
}: AgentStatusMonitorProps) {
  const [status, setStatus] = useState<AgentStatus>({
    isReady: false,
    lastActivity: new Date().toISOString(),
    availableModes: [],
    mcpToolsCount: 0,
    health: {
      status: 'initializing',
      message: 'Initializing agent...',
      timestamp: new Date().toISOString()
    },
    performance: {
      responseTime: 0,
      successRate: 100,
      totalRequests: 0
    }
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    requests: 0,
    successes: 0,
    totalResponseTime: 0
  });

  // Update agent status
  const updateStatus = async () => {
    try {
      console.log('[Agent Monitor] 🔍 Checking agent status...');
      
      const startTime = Date.now();
      
      // Call server-side API endpoint instead of direct imports
      const response = await fetch('/api/agent-status');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const agentStatus = data.status;
      
      const responseTime = Date.now() - startTime;
      
      // Update performance metrics
      setPerformanceMetrics(prev => {
        const newRequests = prev.requests + 1;
        const newSuccesses = prev.successes + (agentStatus.isReady ? 1 : 0);
        const newTotalResponseTime = prev.totalResponseTime + responseTime;
        
        return {
          requests: newRequests,
          successes: newSuccesses,
          totalResponseTime: newTotalResponseTime
        };
      });

      const newStatus: AgentStatus = {
        isReady: agentStatus.isReady,
        lastActivity: agentStatus.lastActivity,
        availableModes: agentStatus.availableModes,
        mcpToolsCount: agentStatus.mcpToolsCount,
        health: agentStatus.health,
        performance: {
          responseTime,
          successRate: performanceMetrics.requests > 0 
            ? (performanceMetrics.successes / performanceMetrics.requests) * 100 
            : 100,
          totalRequests: performanceMetrics.requests + 1
        }
      };

      setStatus(newStatus);
      setLastUpdate(Date.now());
      
      // Notify parent component
      onStatusChange?.(newStatus);
      
      console.log('[Agent Monitor] ✅ Status updated successfully');
    } catch (error) {
      console.error('[Agent Monitor] ❌ Failed to update status:', error);
      
      const errorStatus: AgentStatus = {
        ...status,
        isReady: false,
        health: {
          status: 'unhealthy',
          message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      };
      
      setStatus(errorStatus);
      onStatusChange?.(errorStatus);
    }
  };

  // Auto-refresh status - completely disabled to prevent spam
  useEffect(() => {
    // Only do initial check when component mounts and is expanded
    if (typeof window !== 'undefined' && (isExpanded || showDetails)) {
      updateStatus(); // Single initial check only
    }
    // No interval - manual refresh only
  }, [isExpanded, showDetails]); // Removed updateStatus from dependencies

  // Manual refresh
  const handleRefresh = () => {
    updateStatus();
  };

  // Get status color
  const getStatusColor = () => {
    if (!status.isReady) return 'text-red-400';
    if (status.health.status === 'healthy') return 'text-green-400';
    if (status.health.status === 'initializing') return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get status dot color
  const getStatusDotColor = () => {
    if (!status.isReady) return 'bg-red-400';
    if (status.health.status === 'healthy') return 'bg-green-400';
    if (status.health.status === 'initializing') return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Get status text
  const getStatusText = () => {
    if (!status.isReady) return 'Offline';
    if (status.health.status === 'healthy') return 'Online';
    if (status.health.status === 'initializing') return 'Starting';
    return 'Error';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusDotColor()} animate-pulse`} />
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-cyan-500/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusDotColor()} animate-pulse`} />
            <div>
              <div className="text-sm font-medium text-white">ADK Agent Status</div>
              <div className={`text-xs ${getStatusColor()}`}>
                {getStatusText()} • {status.mcpToolsCount} MCP Tools
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="p-1 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              Refresh
            </button>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400 text-xs"
            >
              Details
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {(isExpanded || showDetails) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Health Status */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">Health Status</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor()}`} />
                  <span className={`text-sm ${getStatusColor()}`}>
                    {status.health.message}
                  </span>
                </div>
              </div>

              {/* Available Modes */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">Available Modes</div>
                <div className="flex flex-wrap gap-2">
                  {status.availableModes.map((mode) => (
                    <span
                      key={mode}
                      className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400"
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">Performance</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500">Response Time</div>
                    <div className="text-white font-medium">
                      {status.performance.responseTime}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Success Rate</div>
                    <div className="text-white font-medium">
                      {status.performance.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Requests</div>
                    <div className="text-white font-medium">
                      {status.performance.totalRequests}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">MCP Tools</div>
                    <div className="text-white font-medium">
                      {status.mcpToolsCount}/3
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Update */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                Last updated: {new Date(status.lastActivity).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export types for use in other components
export type { AgentStatus };