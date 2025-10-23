'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'

interface WalletInputProps {
  onSubmit: (address: string) => void
  loading: boolean
}

export default function WalletInput({ onSubmit, loading }: WalletInputProps) {
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim() && !loading) {
      onSubmit(address.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Stacks wallet address (e.g., ST1PQHQKV0RJXZFY...)"
            className="w-full px-6 py-4 pl-14 pr-32 card-input text-white placeholder-gray-400 text-lg focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <button
            type="submit"
            disabled={!address.trim() || loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-4 h-4" />
                <span>Analyzing</span>
              </div>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Enter a Stacks wallet address to analyze transaction patterns and generate insights
        </p>
      </div>
    </motion.div>
  )
}