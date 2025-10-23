'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Github, ExternalLink, Settings } from 'lucide-react'
import WalletInput from '@/components/WalletInput'
import ExpandedGraphViewer from '@/components/ExpandedGraphViewer'
import HeroSection from '@/components/HeroSection'
import ModernDashboard from '@/components/ModernDashboard'
import SettingsModal from '@/components/SettingsModal'
import { fixModelName } from '@/lib/model-name-fix'
import { WalletData, GraphData } from '@/types/stacks'

export default function Home() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: number}>>([])
  const [expandedGraph, setExpandedGraph] = useState<GraphData | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Listen for settings event from HeroSection
  useEffect(() => {
    const handleSettingsEvent = () => {
      setShowSettings(true);
    };

    window.addEventListener('openSettings', handleSettingsEvent);
    return () => {
      window.removeEventListener('openSettings', handleSettingsEvent);
    };
  }, []);

  const handleWalletSubmit = async (address: string) => {
    setLoading(true)
    setError('')

    try {
      // Get ADK provider settings from localStorage
      const adkProvider = localStorage.getItem('adk_provider') || 'google'
      const adkModel = localStorage.getItem('adk_model') || 'gemini-2.5-flash'
      const adkApiKey = localStorage.getItem(`${adkProvider}_api_key`)

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address, 
          adkProvider, 
          adkModel, 
          adkApiKey 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch wallet data')
      }

      const data = await response.json()
      setWalletData(data.walletData)
      setAiSummary(data.aiSummary)
      
      // Start background transaction preloading for Spider Mode
      startBackgroundPreload(data.walletData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const startBackgroundPreload = async (walletData: WalletData) => {
    if (!walletData) return
    
    try {
      console.log('🚀 Starting background transaction preload...')
      
      const response = await fetch('/api/preload-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletData }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Background preload completed:', result)
      } else {
        console.error('Background preload failed:', response.statusText)
      }
    } catch (error) {
      console.error('Background preload error:', error)
    }
  }

  const handleChatMessage = async (message: string): Promise<string> => {
    if (!walletData) {
      return 'Please load a wallet first to ask questions about it.'
    }

    try {
      // Get provider settings
      const selectedProvider = localStorage.getItem('ai_provider') || 'huggingface'
      
      let apiKey: string | null = null
      let modelName: string = 'openai/gpt-oss-120b'
      let providerSettings: any = {}

      if (selectedProvider === 'adk') {
        // ADK mode - get ADK settings
        const adkProvider = localStorage.getItem('adk_provider') || 'openai'
        const adkModel = localStorage.getItem('adk_model') || 'gpt-4o'
        const adkApiKey = localStorage.getItem(`${adkProvider}_api_key`)
        
        apiKey = adkApiKey
        modelName = adkModel
        providerSettings = {
          provider: 'adk',
          adkProvider,
          adkModel,
          adkApiKey
        }
        
        console.log('[Client] 🔧 Using ADK mode with real MCP tools')
      } else {
        // Hugging Face mode
        apiKey = localStorage.getItem('huggingface_api_key')
        modelName = fixModelName(localStorage.getItem('ai_model_name') || 'meta-llama/Llama-3.1-8B-Instruct')
        providerSettings = {
          provider: 'huggingface'
        }
        
        console.log('[Client] 🤗 Using Hugging Face mode')
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          walletData,
          apiKey,
          modelName,
          providerSettings,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      // Show warning if fallback was used
      if (data.warning) {
        console.warn(`[Page] ⚠️ ${data.warning}`);
      }
      
      return data.answer
    } catch {
      return 'Sorry, I encountered an error processing your question. Please try again.'
    }
  }

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Header - Only show on initial screen */}
      {/* {!walletData && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6 absolute top-0 left-0 right-0"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BlockIQ</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                title="Stacks Documentation"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.header>
      )} */}

      {/* Main Content */}
      <main className={`relative z-10 overflow-hidden ${!walletData ? 'h-screen' : 'h-full'}`}>
        <div className="h-full">
          {!walletData ? (
            /* Hero Section */
            <div className="h-full overflow-y-auto custom-scrollbar">
              <HeroSection onGetStarted={() => {
                // Scroll to wallet input section
                const walletSection = document.getElementById('wallet-input-section')
                if (walletSection) {
                  walletSection.scrollIntoView({ behavior: 'smooth' })
                }
              }} />
              
              {/* Wallet Input Section */}
              <div id="wallet-input-section" className="py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                  >
                    <h2 className="text-4xl font-bold text-white mb-6">
                      Start Your Analysis
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                      Enter any Stacks wallet address to get AI-powered analytics and insights
                    </p>
                  </motion.div>

                  <WalletInput onSubmit={handleWalletSubmit} loading={loading} />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 max-w-2xl mx-auto"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Modern Dashboard */
            <div className="h-full">
              <ModernDashboard
                walletData={walletData}
                aiSummary={aiSummary}
                onSendMessage={handleChatMessage}
                messages={chatMessages}
                setMessages={setChatMessages}
              />
            </div>
          )}
        </div>
      </main>

      {/* Expanded Graph Viewer */}
      <ExpandedGraphViewer 
        graphData={expandedGraph}
        onClose={() => setExpandedGraph(null)}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}