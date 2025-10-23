'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
  delay?: number
}

const colorClasses = {
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-600/20',
    border: 'border-blue-500/30',
    trend: 'text-blue-400'
  },
  green: {
    icon: 'text-green-400',
    bg: 'bg-green-600/20',
    border: 'border-green-500/30',
    trend: 'text-green-400'
  },
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-600/20',
    border: 'border-red-500/30',
    trend: 'text-red-400'
  },
  purple: {
    icon: 'text-purple-400',
    bg: 'bg-purple-600/20',
    border: 'border-purple-500/30',
    trend: 'text-purple-400'
  },
  yellow: {
    icon: 'text-yellow-400',
    bg: 'bg-yellow-600/20',
    border: 'border-yellow-500/30',
    trend: 'text-yellow-400'
  }
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color, 
  delay = 0 
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`card p-6 hover-lift border-l-4 ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        
        {trend && (
          <div className={`text-xs font-medium ${colors.trend}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className="text-xs text-gray-500">
            {trend.isPositive ? 'Increase' : 'Decrease'} from last period
          </p>
        )}
      </div>
    </motion.div>
  )
}