'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Maximize2, Copy, ExternalLink } from 'lucide-react'
import GraphRenderer from './GraphRenderer'
import { GraphData } from '@/types/stacks'

interface ExpandedGraphViewerProps {
  graphData: GraphData | null
  onClose: () => void
}

export default function ExpandedGraphViewer({ graphData, onClose }: ExpandedGraphViewerProps) {
  if (!graphData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-7xl max-h-[95vh] overflow-y-auto relative bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8 p-8 pb-0">
            <div className="flex items-center space-x-5">
              <motion.div
                className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <Maximize2 className="w-9 h-9 text-white" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{graphData.title}</h2>
                {graphData.subtitle && (
                  <p className="text-xl text-gray-300 font-medium">{graphData.subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                className="p-4 text-gray-400 hover:text-purple-400 transition-all duration-300 rounded-2xl hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
                title="Copy Graph Data"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-6 h-6" />
              </motion.button>

              <motion.button
                className="p-4 text-gray-400 hover:text-blue-400 transition-all duration-300 rounded-2xl hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30"
                title="Download Graph"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-6 h-6" />
              </motion.button>

              <motion.button
                className="p-4 text-gray-400 hover:text-emerald-400 transition-all duration-300 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30"
                title="Share Graph"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-6 h-6" />
              </motion.button>

              <motion.button
                onClick={onClose}
                className="p-4 text-gray-400 hover:text-red-400 transition-all duration-300 rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                title="Close"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Expanded Graph */}
          <div className="mb-8 px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GraphRenderer data={graphData} />
            </motion.div>
          </div>

          {/* Enhanced Analysis Section */}
          {graphData.text && (
            <motion.div
              className="mx-8 mb-8 p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-sm rounded-3xl border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
                <h3 className="text-2xl font-bold text-white">Analysis & Insights</h3>
              </div>
              <p className="text-gray-200 leading-relaxed text-lg">
                {graphData.text}
              </p>
            </motion.div>
          )}

          {/* Enhanced Graph Details */}
          <div className="mx-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.3)' }}
            >
              <h4 className="text-sm font-medium text-gray-400 mb-3">Graph Type</h4>
              <p className="text-xl font-bold text-white">
                {graphData.graph === 'VBC' && 'Vertical Bar Chart'}
                {graphData.graph === 'HBC' && 'Horizontal Bar Chart'}
                {graphData.graph === 'PG' && 'Pie Chart'}
                {graphData.graph === 'LC' && 'Line Chart'}
                {graphData.graph === 'AC' && 'Area Chart'}
                {graphData.graph === 'DG' && 'Donut Chart'}
              </p>
              <div className="mt-2 text-sm text-cyan-400 font-medium">
                Interactive • Animated
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <h4 className="text-sm font-medium text-gray-400 mb-3">Data Points</h4>
              <p className="text-xl font-bold text-white">{graphData.x_axis_data.length} items</p>
              <div className="mt-2 text-sm text-purple-400 font-medium">
                {graphData.x_axis_data.length > 5 ? 'Rich Dataset' : 'Focused View'}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <h4 className="text-sm font-medium text-gray-400 mb-3">Total Value</h4>
              <p className="text-xl font-bold text-white">
                {graphData.y_axis_data.reduce((sum, val) => sum + val, 0).toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-green-400 font-medium">
                Aggregated Sum
              </div>
            </motion.div>
          </div>

          {/* Enhanced Data Table */}
          <motion.div
            className="mx-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse" />
              <h3 className="text-2xl font-bold text-white">Data Breakdown</h3>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/60 border-b border-gray-600/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Label</th>
                      <th className="px-8 py-6 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">Value</th>
                      <th className="px-8 py-6 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">Percentage</th>
                      <th className="px-8 py-6 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Visual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {graphData.x_axis_data.map((label, index) => {
                      const value = graphData.y_axis_data[index]
                      const total = graphData.y_axis_data.reduce((sum, val) => sum + val, 0)
                      const percentage = ((value / total) * 100).toFixed(1)
                      const color = graphData.colors?.[index] || '#8b5cf6'

                      return (
                        <motion.tr
                          key={index}
                          className="hover:bg-gray-800/50 transition-all duration-300 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <td className="px-8 py-6 text-sm text-gray-200 font-medium">{label}</td>
                          <td className="px-8 py-6 text-sm text-white text-right font-mono font-bold tabular-nums">
                            {value.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-sm text-right">
                            <span
                              className="font-bold text-lg bg-gray-800/40 px-3 py-1 rounded-full"
                              style={{ color }}
                            >
                              {percentage}%
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex justify-center">
                              <div
                                className="w-6 h-6 rounded-full border-3 border-gray-600/60 group-hover:scale-110 group-hover:border-gray-400/80 transition-all duration-300 relative"
                                style={{
                                  backgroundColor: color
                                }}
                              >
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                      style={{
                                        background: `radial-gradient(circle at center, ${color}40, transparent)`
                                      }} />
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}