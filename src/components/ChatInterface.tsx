'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap, Database, Code, Bug } from 'lucide-react'
import { ChatMessage, GraphData } from '@/types/stacks'
import { cn } from '@/lib/utils'
import GraphRenderer from './GraphRenderer'

// Simple markdown renderer for chat messages
const renderChatMessage = (content: string) => {
  // Clean up the content and split into lines
  const lines = content.split('\n').filter(line => line.trim())
  
  return lines.map((line, index) => {
    // Handle headers (### or ##)
    if (line.startsWith('### ')) {
      return (
        <h4 key={index} className="font-semibold text-white mb-2 text-sm">
          {line.replace('### ', '')}
        </h4>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={index} className="font-bold text-white mb-2">
          {line.replace('## ', '')}
        </h3>
      )
    }
    
    // Handle bullet points
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={index} className="flex items-start space-x-2 mb-1">
          <span className="text-blue-400 mt-1 text-xs">•</span>
          <span className="text-sm">{line.replace(/^[•-]\s/, '')}</span>
        </div>
      )
    }
    
    // Handle bold text (**text**)
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/)
      return (
        <p key={index} className="mb-2 text-sm leading-relaxed">
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIndex} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              )
            }
            return part
          })}
        </p>
      )
    }
    
    // Handle table-like content (clean it up)
    if (line.includes('|')) {
      const cleanLine = line.replace(/\|+/g, ' • ').replace(/---+/g, '').trim()
      if (cleanLine) {
        return (
          <p key={index} className="mb-2 text-sm leading-relaxed">
            {cleanLine}
          </p>
        )
      }
      return null
    }
    
    // Regular text
    return (
      <p key={index} className="mb-2 text-sm leading-relaxed">
        {line}
      </p>
    )
  }).filter(Boolean)
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>
  disabled?: boolean
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  onGraphExpand?: (graphData: GraphData) => void
}

export default function ChatInterface({ onSendMessage, disabled, messages, setMessages, onGraphExpand }: ChatInterfaceProps) {
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m BlockIQ, your intelligent Web3 analytics assistant. I automatically choose the best analysis mode for your questions - from quick answers to comprehensive Spider Mode analysis. Ask me anything about this wallet!',
        timestamp: Date.now()
      }])
    }
  }, [messages.length, setMessages])
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState<'normal' | 'spider' | null>(null)
  const [mcpFunction, setMcpFunction] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // AI decides everything - no manual detection needed
  // Start with thinking state, AI will determine actual mode

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || disabled) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    const queryText = input.trim()
    setInput('')
    setLoading(true)

    // Start with thinking state - AI will determine actual mode
    setCurrentMode(null)
    setMcpFunction(null)

    try {
      const response = await onSendMessage(queryText)

      console.log('=== CHAT INTERFACE DEBUG ===')
      console.log('Response:', response)
      console.log('Contains "graph":', response.includes('"graph"'))
      console.log('Contains "x_axis_data":', response.includes('"x_axis_data"'))
      console.log('============================')

      // Detect mode from AI response for loading state updates
      const lowerResponse = response.toLowerCase()
      if (lowerResponse.includes('spider') || lowerResponse.includes('comprehensive') || lowerResponse.includes('graph')) {
        setCurrentMode('spider')
        setMcpFunction('executeSpiderAnalysis')
      } else {
        setCurrentMode('normal')
        setMcpFunction('getWalletData')
      }
      
      // Check if response is a graph protocol
      if (response.includes('"graph"') && response.includes('"x_axis_data"')) {
        console.log('Graph response detected:', response)
        try {
          const graphData = JSON.parse(response.trim())
          console.log('Parsed graph data:', graphData)
          
          // Validate that it's a proper graph object
          if (graphData.graph && graphData.x_axis_data && graphData.y_axis_data && graphData.title) {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: graphData.text || 'Analysis complete with visualization',
              timestamp: Date.now(),
              graphData: graphData
            }
            setMessages(prev => [...prev, assistantMessage])
            console.log('Graph message added to chat')
          } else {
            console.log('Invalid graph data structure:', graphData)
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response,
              timestamp: Date.now()
            }
            setMessages(prev => [...prev, assistantMessage])
          }
        } catch (error) {
          console.error('Graph parsing error:', error)
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: Date.now()
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setCurrentMode(null)
      setMcpFunction(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800/50 overflow-hidden"
    >
      {/* Chat Header - Minimal */}
      <div className="px-5 py-4 border-b border-gray-800/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">BlockIQ Assistant</h3>
              <p className="text-xs text-gray-400">AI-powered Web3 analytics</p>
            </div>
          </div>

          {/* Status Indicator - Minimal */}
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 space-y-3 min-h-0 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex space-x-2 w-full",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[85%] break-words overflow-hidden",
                message.role === 'user'
                  ? "px-4 py-2.5 rounded-2xl rounded-tr-sm bg-blue-600 text-white text-sm"
                  : message.graphData
                    ? "w-full max-w-none"
                    : "px-4 py-2.5 rounded-2xl rounded-tl-sm bg-gray-800/60 text-gray-100 border border-gray-700/30 text-sm"
              )}>
                {message.graphData ? (
                  <div>
                    <GraphRenderer 
                      data={message.graphData} 
                      isCompact={true}
                      onClick={() => message.graphData && onGraphExpand?.(message.graphData)}
                    />
                    {message.graphData.text && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-gray-800/80 text-gray-100 border border-gray-700/30">
                        <div className="text-xs leading-relaxed">
                          {renderChatMessage(message.graphData.text)}
                        </div>
                        <p className="text-[10px] opacity-60 mt-1.5 text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-sm leading-relaxed">
                      {message.role === 'assistant' ? renderChatMessage(message.content) : message.content}
                    </div>
                    <p className="text-[10px] opacity-60 mt-1.5">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-2"
          >
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800/60 border border-gray-700/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex items-center space-x-2">
                {currentMode === 'spider' ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                    <span className="text-xs text-orange-400 font-medium">
                      Spider Mode — Deep analysis...
                    </span>
                  </>
                ) : currentMode === 'normal' ? (
                  <>
                    <Database className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                    <span className="text-xs text-blue-400">
                      Processing...
                    </span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">
                      Thinking...
                    </span>
                  </>
                )}
              </div>
              
              {/* MCP Function Indicator */}
              {mcpFunction && (
                <div className="flex items-center space-x-1.5 mt-1.5 pt-1.5 border-t border-gray-700/50">
                  {mcpFunction === 'executeSpiderAnalysis' ? (
                    <>
                      <Code className="w-3 h-3 text-orange-300/70" />
                      <span className="text-[10px] text-orange-300/70">
                        Comprehensive analysis
                      </span>
                    </>
                  ) : mcpFunction === 'getWalletData' ? (
                    <>
                      <Database className="w-3 h-3 text-blue-300/70" />
                      <span className="text-[10px] text-blue-300/70">
                        Fetching data
                      </span>
                    </>
                  ) : mcpFunction === 'debugAndFixCode' ? (
                    <>
                      <Bug className="w-3 h-3 text-yellow-300/70" />
                      <span className="text-[10px] text-yellow-300/70">
                        Auto-debugging
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400">
                        {mcpFunction}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800/50 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Load a wallet first..." : "Ask about this wallet..."}
            disabled={disabled || loading}
            className="flex-1 px-4 py-2.5 bg-gray-800/40 border border-gray-700/40 rounded-xl text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || disabled}
            className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}