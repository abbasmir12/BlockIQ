'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Zap, ChevronDown, Sparkles, Activity } from 'lucide-react'
import GraphRenderer from './GraphRenderer'
import { GraphData } from '@/types/stacks'

const demoGraphs = [
  {
    graph: 'VBC',
    x_axis_data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    y_axis_data: [45, 67, 23, 89, 34],
    title: 'Monthly Transaction Activity',
    subtitle: 'Transactions per month',
    colors: ['#00d4ff', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'],
    text: 'Peak activity was in April with 89 transactions. Overall trend shows variable monthly usage pattern with significant blockchain engagement.'
  },
  {
    graph: 'PG',
    x_axis_data: ['Token Transfer', 'Contract Call', 'Smart Contract'],
    y_axis_data: [150, 45, 5],
    title: 'Transaction Type Distribution',
    colors: ['#00d4ff', '#8b5cf6', '#ef4444'],
    text: 'Token transfers dominate at 75% of all transactions, indicating active STX movement and trading activity across the Stacks ecosystem.'
  },
  {
    graph: 'HBC',
    x_axis_data: ['ST1ABC...DEF', 'ST2GHI...JKL', 'ST3MNO...PQR', 'ST4STU...VWX'],
    y_axis_data: [25, 18, 12, 8],
    title: 'Top STX Recipients',
    subtitle: 'By transaction count',
    colors: ['#00d4ff', '#3b82f6', '#8b5cf6', '#10b981'],
    text: 'ST1ABC...DEF received the most transactions (25), suggesting it might be an exchange or service address with high activity.'
  },
  {
    graph: 'LC',
    x_axis_data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    y_axis_data: [1000, 1200, 950, 1100],
    title: 'STX Balance Trend',
    subtitle: 'Balance over time',
    colors: ['#00d4ff', '#3b82f6'],
    text: 'Balance shows volatility with a dip in week 3, possibly due to a large transaction or contract interaction. Recovery in week 4 indicates continued activity.'
  },
  {
    graph: 'AC',
    x_axis_data: ['Q1', 'Q2', 'Q3', 'Q4'],
    y_axis_data: [2500, 3200, 2800, 3500],
    title: 'Quarterly Volume Trend',
    subtitle: 'STX volume over quarters',
    colors: ['#00d4ff', '#8b5cf6', '#10b981'],
    text: 'Strong growth trajectory with Q4 showing the highest volume, indicating increasing adoption and network activity.'
  },
  {
    graph: 'DG',
    x_axis_data: ['DeFi', 'NFTs', 'Gaming', 'Infrastructure'],
    y_axis_data: [40, 25, 20, 15],
    title: 'Ecosystem Activity Distribution',
    colors: ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b'],
    text: 'DeFi leads ecosystem activity at 40%, followed by NFTs and gaming, showing a diverse and healthy blockchain ecosystem.'
  }
]

interface GraphDemoProps {
  expandedGraph?: GraphData | null
}

export default function GraphDemo({ expandedGraph }: GraphDemoProps) {
  const [showDemo, setShowDemo] = useState(false)
  const [currentGraph, setCurrentGraph] = useState(0)

  const exampleQuestions = [
    "Show me a chart of monthly transaction activity",
    "Create a pie chart of transaction types", 
    "Draw a bar chart of top recipients",
    "Display balance trend over time",
    "Generate a visual breakdown of contract interactions",
    "Show me October activities with a diagram",
    "Chart the daily activity for last month",
    "Pie chart of STX amounts sent to different addresses",
    "Bar graph of most active days",
    "Line chart showing balance changes over time"
  ]

  return (
    <motion.div 
      className="chart-container p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute top-4 right-4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="p-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              style={{ 
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' 
              }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white">Visual Analytics Showcase</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Interactive blockchain data visualizations</p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowDemo(!showDemo)}
            className="flex items-center space-x-3 px-6 py-3 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-medium">
              {showDemo ? 'Hide Examples' : 'Show Examples'}
            </span>
            <motion.div
              animate={{ rotate: showDemo ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10 space-y-8 mt-8"
          >
            {/* Example Questions */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <h4 className="text-lg font-semibold text-white">Try These Queries</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleQuestions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/50 text-sm text-gray-300 hover:bg-black/60 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>&quot;{question}&quot;</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Graph Type Selector */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <h4 className="text-lg font-semibold text-white">Interactive Chart Gallery</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {demoGraphs.map((graph, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentGraph(index)}
                    className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      currentGraph === index
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-black/40 backdrop-blur-sm border-gray-800/50 text-gray-300 hover:bg-black/60 hover:border-cyan-500/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="font-bold">{graph.graph}</div>
                      <div className="text-xs opacity-80 mt-1">{graph.title}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Demo Graph or Expanded Graph */}
            <div className="border border-cyan-500/20 rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
              <GraphRenderer 
                data={expandedGraph || demoGraphs[currentGraph]} 
                onExpand={() => {/* Handle expand */}}
              />
            </div>
            
            {expandedGraph && (
              <motion.div 
                className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-base font-semibold text-cyan-400">Live Graph from Chat</span>
                </div>
                <p className="text-sm text-gray-300">
                  This graph was generated from your conversation. You can continue asking questions about this data or request different visualizations.
                </p>
              </motion.div>
            )}

            {/* Enhanced Graph Types Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/50"
                whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.3)' }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  <span className="text-base font-semibold text-white">Bar Charts</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  HBC & VBC for comparing categories, values, and rankings with animated bars and glow effects.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/50"
                whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.3)' }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <PieChart className="w-6 h-6 text-purple-400" />
                  <span className="text-base font-semibold text-white">Circular Charts</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  PG & DG for proportions and distributions with interactive segments and enhanced legends.
                </p>
              </motion.div>
              
              <motion.div 
                className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/50"
                whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span className="text-base font-semibold text-white">Trend Charts</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  LC & AC for time series and trends with gradient fills and animated data points.
                </p>
              </motion.div>
            </div>

            {/* Enhanced Instructions */}
            <motion.div 
              className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-semibold text-blue-400">How to Use BlockIQ Analytics</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <p>• <span className="text-cyan-400 font-medium">Enable Agent Mode</span> for advanced graph capabilities</p>
                  <p>• Ask for <span className="text-purple-400 font-medium">&quot;chart&quot;</span>, <span className="text-purple-400 font-medium">&quot;graph&quot;</span>, or <span className="text-purple-400 font-medium">&quot;visual&quot;</span> in your questions</p>
                </div>
                <div className="space-y-2">
                  <p>• <span className="text-green-400 font-medium">AI automatically</span> chooses the best graph type for your data</p>
                  <p>• All graphs include <span className="text-cyan-400 font-medium">interactive animations</span> and detailed explanations</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}