'use client'

import { motion } from 'framer-motion'
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Transaction {
  tx_id: string
  tx_type: string
  tx_status: string
  burn_block_time: number
  block_height: number
}

interface ActivityFeedProps {
  transactions: Transaction[]
  maxItems?: number
}

export default function ActivityFeed({ transactions, maxItems = 5 }: ActivityFeedProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'token_transfer':
        return { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-600/20' }
      case 'contract_call':
        return { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-600/20' }
      case 'smart_contract':
        return { icon: Activity, color: 'text-green-400', bg: 'bg-green-600/20' }
      default:
        return { icon: Activity, color: 'text-gray-400', bg: 'bg-gray-600/20' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-400' }
      case 'abort_by_response':
        return { icon: XCircle, color: 'text-red-400' }
      default:
        return { icon: AlertCircle, color: 'text-yellow-400' }
    }
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, maxItems).map((tx, index) => {
        const txIcon = getTransactionIcon(tx.tx_type)
        const statusIcon = getStatusIcon(tx.tx_status)
        const TxIcon = txIcon.icon
        const StatusIcon = statusIcon.icon

        return (
          <motion.div
            key={tx.tx_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {/* Transaction Icon */}
              <div className={`w-10 h-10 ${txIcon.bg} rounded-xl flex items-center justify-center`}>
                <TxIcon className={`w-5 h-5 ${txIcon.color}`} />
              </div>

              {/* Transaction Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-white capitalize">
                    {tx.tx_type.replace('_', ' ')}
                  </h4>
                  <StatusIcon className={`w-3 h-3 ${statusIcon.color}`} />
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(tx.burn_block_time * 1000).toLocaleDateString()}</span>
                  </div>
                  <span>Block {tx.block_height}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-700/50"
              onClick={() => window.open(`https://explorer.stacks.co/txid/${tx.tx_id}?chain=testnet`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )
      })}
    </div>
  )
}