'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Command, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Clock,
  Activity,
  Brain,
  Eye,
  RefreshCw
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: string) => void
}

const commands = [
  {
    id: 'analyze-transactions',
    title: 'Analyze Transactions',
    description: 'Get AI insights on transaction patterns',
    icon: BarChart3,
    category: 'Analysis',
    shortcut: '⌘T'
  },
  {
    id: 'chat-wallet',
    title: 'Chat About Wallet',
    description: 'Ask questions about this wallet',
    icon: MessageSquare,
    category: 'AI',
    shortcut: '⌘C'
  },
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Update wallet information',
    icon: RefreshCw,
    category: 'Data',
    shortcut: '⌘R'
  },
  {
    id: 'view-insights',
    title: 'View AI Insights',
    description: 'Show detailed AI analysis',
    icon: Brain,
    category: 'AI',
    shortcut: '⌘I'
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    description: 'Show latest transactions',
    icon: Clock,
    category: 'Data',
    shortcut: '⌘A'
  },
  {
    id: 'agent-mode',
    title: 'Toggle Agent Mode',
    description: 'Enable advanced AI capabilities',
    icon: Zap,
    category: 'AI',
    shortcut: '⌘M'
  }
]

export default function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onCommand(filteredCommands[selectedIndex].id)
            onClose()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onCommand, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center space-x-3 p-4 border-b border-gray-800">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘</kbd>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">K</kbd>
              </div>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No commands found</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredCommands.map((command, index) => (
                    <motion.button
                      key={command.id}
                      onClick={() => {
                        onCommand(command.id)
                        onClose()
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-blue-600/20 border border-blue-500/30'
                          : 'hover:bg-gray-800/50'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === selectedIndex ? 'bg-blue-600/30' : 'bg-gray-800/50'
                      }`}>
                        <command.icon className={`w-4 h-4 ${
                          index === selectedIndex ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white">
                            {command.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {command.shortcut}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {command.description}
                        </p>
                      </div>
                      
                      {index === selectedIndex && (
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800 bg-gray-900/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Command className="w-3 h-3" />
                  <span>Command Palette</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}