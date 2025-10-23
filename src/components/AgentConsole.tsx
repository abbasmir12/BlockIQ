'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'mcp' | 'reasoning' | 'error' | 'info' | 'success' | 'warning';
  message: string;
  details?: Record<string, unknown>;
  source?: string;
}

interface AgentConsoleProps {
  isVisible: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function AgentConsole({ isVisible, onToggle, className = '' }: AgentConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filter, setFilter] = useState<LogEntry['type'] | 'all'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Add log entry function
  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    
    setLogs(prev => {
      const updated = [...prev.slice(-199), newEntry]; // Keep last 200 entries
      return updated;
    });
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAutoScroll(isAtBottom);
    }
  }, []);

  // Clear logs function
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Filter logs based on selected filter
  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  // Get log styling based on type
  const getLogStyling = (type: LogEntry['type']) => {
    switch (type) {
      case 'mcp':
        return {
          color: 'text-cyan-400',
          icon: '🔌',
          bgColor: 'hover:bg-cyan-500/5'
        };
      case 'reasoning':
        return {
          color: 'text-green-400',
          icon: '🧠',
          bgColor: 'hover:bg-green-500/5'
        };
      case 'error':
        return {
          color: 'text-red-400',
          icon: '❌',
          bgColor: 'hover:bg-red-500/5'
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          icon: '⚠️',
          bgColor: 'hover:bg-yellow-500/5'
        };
      case 'success':
        return {
          color: 'text-emerald-400',
          icon: '✅',
          bgColor: 'hover:bg-emerald-500/5'
        };
      default:
        return {
          color: 'text-gray-300',
          icon: 'ℹ️',
          bgColor: 'hover:bg-gray-500/5'
        };
    }
  };

  // Demo function to add sample logs
  const addSampleLogs = useCallback(() => {
    const sampleLogs = [
      { type: 'info' as const, message: 'ADK Agent initialized successfully', source: 'BlockIQ Agent' },
      { type: 'mcp' as const, message: 'MCP Server connected: BlockIQ-Stacks-MCP', source: 'MCP' },
      { type: 'reasoning' as const, message: 'Analyzing wallet address: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', source: 'Agent' },
      { type: 'mcp' as const, message: 'Fetching wallet data via getWalletData tool', source: 'MCP' },
      { type: 'success' as const, message: 'Retrieved 47 transactions for analysis', source: 'Stacks API' },
      { type: 'reasoning' as const, message: 'Processing transaction patterns and recipient analysis', source: 'Agent' },
      { type: 'info' as const, message: 'Generated visualization data for 6 chart types', source: 'Graph Protocol' }
    ];

    sampleLogs.forEach((log, index) => {
      setTimeout(() => addLog(log), index * 500);
    });
  }, [addLog]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={consoleRef}
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className={`card overflow-hidden ${className}`}
        >
          {/* Console Header */}
          <div className="bg-blue-600 px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Terminal Dots */}
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                <span className="text-white font-mono text-sm font-semibold ml-4">
                  🤖 ADK Agent Console
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Filter Dropdown */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as LogEntry['type'] | 'all')}
                  className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 font-mono"
                >
                  <option value="all">All</option>
                  <option value="mcp">MCP</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="error">Errors</option>
                  <option value="info">Info</option>
                </select>

                {/* Action Buttons */}
                <button
                  onClick={addSampleLogs}
                  className="text-white text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  title="Add sample logs"
                >
                  Demo
                </button>
                
                <button
                  onClick={clearLogs}
                  className="text-white text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  title="Clear logs"
                >
                  Clear
                </button>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <div className="status-dot status-online"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Console Content */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-80 overflow-y-auto p-6 font-mono text-sm space-y-2 bg-gradient-to-b from-black/50 to-black/80"
          >
            <AnimatePresence mode="popLayout">
              {filteredLogs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-500 text-center py-16"
                >
                  <div className="text-4xl mb-4">🤖</div>
                  <div className="text-lg font-medium mb-2">Agent Console Ready</div>
                  <div className="text-sm">
                    {filter === 'all' 
                      ? 'Waiting for ADK agent activity...' 
                      : `No ${filter} logs found. Try changing the filter.`
                    }
                  </div>
                  <button
                    onClick={addSampleLogs}
                    className="mt-4 btn-primary px-4 py-2"
                  >
                    Add Demo Logs
                  </button>
                </motion.div>
              ) : (
                filteredLogs.map((log, index) => {
                  const styling = getLogStyling(log.type);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{ 
                        delay: Math.min(index * 0.02, 0.3),
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.4
                      }}
                      className={`flex items-start gap-3 group ${styling.bgColor} rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-white/10`}
                    >
                      {/* Timestamp */}
                      <span className="text-gray-500 shrink-0 text-xs font-mono">
                        [{log.timestamp}]
                      </span>
                      
                      {/* Icon */}
                      <span className="text-base shrink-0">
                        {styling.icon}
                      </span>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`${styling.color} break-words leading-relaxed`}>
                          {log.message}
                        </div>
                        {log.source && (
                          <div className="text-xs text-gray-500 mt-1">
                            Source: {log.source}
                          </div>
                        )}
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                              View Details
                            </summary>
                            <pre className="text-xs text-gray-400 mt-1 p-2 bg-black/30 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            
            {/* Auto-scroll indicator */}
            {!isAutoScroll && logs.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setIsAutoScroll(true);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                  }
                }}
                className="fixed bottom-4 right-4 px-3 py-2 glass-card text-cyan-400 text-xs rounded-lg border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors z-10"
              >
                ↓ Scroll to bottom
              </motion.button>
            )}
            
            {/* Typing Indicator */}
            {logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-gray-400 text-xs py-2"
              >
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span>Agent processing...</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export the addLog function type for external use
export type AddLogFunction = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;