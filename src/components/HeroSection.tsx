"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Code,
  MessageSquare,
  Settings,
  Database,
  Cpu,
  Network,
  Eye,
  X,
} from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [showOverview, setShowOverview] = useState(false);
  return (
    <div className="min-h-screen bg-black flex items-center relative">
      {/* Top Right Buttons */}
      <div className="absolute top-8 right-8 z-20 flex items-center space-x-4">
        {/* Settings Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => {
            // Trigger the settings modal from the parent page
            const event = new CustomEvent('openSettings');
            window.dispatchEvent(event);
          }}
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          title="AI Configuration Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        {/* Overview Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => setShowOverview(true)}
          className="btn-secondary px-6 py-3 flex items-center space-x-2 hover-lift"
        >
          <Eye className="w-4 h-4" />
          <span>Overview</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: "20px" }}
              className="inline-flex items-center space-x-3 py-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                BlockIQ
              </span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                The{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Web3 Analytics
                </span>{" "}
                platform for developers
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 leading-relaxed max-w-lg"
              >
                BlockIQ provides AI-powered blockchain analytics and insights
                for Stacks wallets. Analyze transaction patterns, generate
                visualizations, and get intelligent insights powered by advanced
                AI agents.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={onGetStarted}
                className="btn-primary px-8 py-4 text-lg font-semibold flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button className="btn-secondary px-8 py-4 text-lg font-semibold">
                View Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Dashboard Preview */}
            <div className="relative" style={{ marginTop: "100px" }}>
              {/* Code Editor Style Window */}
              <div className="card overflow-hidden">
                {/* Window Header */}
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-gray-400 font-mono">
                      BlockIQ Analytics
                    </span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="bg-gray-900 p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-500 w-8">1</span>
                      <span className="text-blue-400">import</span>
                      <span className="text-white ml-2">
                        &#123; BlockIQAgent &#125;
                      </span>
                      <span className="text-blue-400 ml-2">from</span>
                      <span className="text-green-400 ml-2">
                        &apos;@blockiq/agent&apos;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">2</span>
                      <span className="text-blue-400">import</span>
                      <span className="text-white ml-2">
                        &#123; StacksAPI &#125;
                      </span>
                      <span className="text-blue-400 ml-2">from</span>
                      <span className="text-green-400 ml-2">
                        &apos;@stacks/blockchain-api&apos;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">3</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">4</span>
                      <span className="text-purple-400">const</span>
                      <span className="text-white ml-2">agent</span>
                      <span className="text-white ml-2">=</span>
                      <span className="text-blue-400 ml-2">new</span>
                      <span className="text-yellow-400 ml-2">BlockIQAgent</span>
                      <span className="text-white">(&#123;</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">5</span>
                      <span className="text-white ml-4">apiKey:</span>
                      <span className="text-green-400 ml-2">
                        &apos;YOUR_API_KEY&apos;
                      </span>
                      <span className="text-white">,</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">6</span>
                      <span className="text-white ml-4">network:</span>
                      <span className="text-green-400 ml-2">
                        &apos;mainnet&apos;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">7</span>
                      <span className="text-white">&#125;)</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">8</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">9</span>
                      <span className="text-purple-400">const</span>
                      <span className="text-white ml-2">analysis</span>
                      <span className="text-white ml-2">=</span>
                      <span className="text-blue-400 ml-2">await</span>
                      <span className="text-white ml-2">agent.</span>
                      <span className="text-yellow-400">analyzeWallet</span>
                      <span className="text-white">(</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">10</span>
                      <span className="text-green-400 ml-2">
                        &apos;SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7&apos;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">11</span>
                      <span className="text-white">)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-4 -right-4 card p-4 bg-blue-600"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-white font-semibold">99.9%</div>
                    <div className="text-blue-100 text-xs">Accuracy</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 card p-4 bg-green-600"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-white font-semibold">10K+</div>
                    <div className="text-green-100 text-xs">
                      Wallets Analyzed
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-1/2 -right-8 card p-4 bg-purple-600"
              >
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-white font-semibold">AI</div>
                    <div className="text-purple-100 text-xs">Powered</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-24 grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Shield,
              title: "Secure & Private",
              description:
                "Your data is encrypted and never stored on our servers",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description:
                "Get insights in seconds with our optimized AI algorithms",
            },
            {
              icon: Globe,
              title: "Multi-Chain Ready",
              description:
                "Starting with Stacks, expanding to more blockchains soon",
            },
          ].map((feature, index) => (
            <div key={index} className="card p-6 text-center hover-lift">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Overview Modal */}
      <AnimatePresence>
        {showOverview && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowOverview(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Technology Overview
                        </h2>
                        <p className="text-blue-100">
                          Advanced Web3 Analytics Architecture
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOverview(false)}
                      className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                  {/* AI Agent Modes */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      <span>AI Agent Modes</span>
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="card p-6 border-l-4 border-green-500">
                        <div className="flex items-center space-x-3 mb-4">
                          <MessageSquare className="w-6 h-6 text-green-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Ask Mode
                          </h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          Simple queries with loaded data
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Fast response times</li>
                          <li>• Uses pre-loaded wallet data</li>
                          <li>• Direct question answering</li>
                          <li>• Optimized for quick insights</li>
                        </ul>
                      </div>

                      <div className="card p-6 border-l-4 border-blue-500">
                        <div className="flex items-center space-x-3 mb-4">
                          <Settings className="w-6 h-6 text-blue-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Plan Mode
                          </h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          Complex analysis with planning
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Multi-step reasoning</li>
                          <li>• Strategic analysis approach</li>
                          <li>• Comprehensive data processing</li>
                          <li>• Advanced pattern recognition</li>
                        </ul>
                      </div>

                      <div className="card p-6 border-l-4 border-purple-500">
                        <div className="flex items-center space-x-3 mb-4">
                          <Code className="w-6 h-6 text-purple-400" />
                          <h4 className="text-lg font-semibold text-white">
                            Code Mode
                          </h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          Custom JavaScript execution
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Dynamic code generation</li>
                          <li>• Custom analysis scripts</li>
                          <li>• Real-time computation</li>
                          <li>• Flexible data manipulation</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* MCP Integration */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                      <Network className="w-5 h-5 text-cyan-400" />
                      <span>Model Context Protocol (MCP)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="card p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">
                          BlockIQ-Stacks-MCP Server
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Custom MCP server providing seamless integration with
                          Stacks blockchain data
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Real-time wallet data fetching
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Transaction history analysis
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Smart contract interaction data
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">
                          Agent Development Kit (ADK)
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Advanced agent framework for blockchain analytics and
                          automation
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Multi-modal agent capabilities
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Autonomous decision making
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                            <span className="text-sm text-gray-300">
                              Context-aware processing
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Architecture */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-yellow-400" />
                      <span>Technical Architecture</span>
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="card p-4 text-center">
                        <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">
                          Data Layer
                        </h4>
                        <p className="text-xs text-gray-400">
                          Stacks API, Real-time indexing, Transaction parsing
                        </p>
                      </div>

                      <div className="card p-4 text-center">
                        <Brain className="w-8 h-8 text-green-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">
                          AI Engine
                        </h4>
                        <p className="text-xs text-gray-400">
                          LLM integration, Pattern recognition, Insight
                          generation
                        </p>
                      </div>

                      <div className="card p-4 text-center">
                        <Network className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">
                          MCP Layer
                        </h4>
                        <p className="text-xs text-gray-400">
                          Protocol integration, Agent communication, Tool access
                        </p>
                      </div>

                      <div className="card p-4 text-center">
                        <Eye className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">
                          UI Layer
                        </h4>
                        <p className="text-xs text-gray-400">
                          React/Next.js, Real-time updates, Interactive
                          visualizations
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span>Advanced Features</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              1
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Dynamic Graph Generation
                            </h4>
                            <p className="text-sm text-gray-400">
                              AI-powered visualization creation based on data
                              patterns
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              2
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Real-time Agent Console
                            </h4>
                            <p className="text-sm text-gray-400">
                              Live monitoring of agent reasoning and MCP
                              interactions
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              3
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Multi-Modal Analysis
                            </h4>
                            <p className="text-sm text-gray-400">
                              Text, code, and visual analysis capabilities
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-cyan-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              4
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Contextual Memory
                            </h4>
                            <p className="text-sm text-gray-400">
                              Persistent conversation context and learning
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              5
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Extensible Architecture
                            </h4>
                            <p className="text-sm text-gray-400">
                              Plugin system for custom analysis tools
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center mt-1">
                            <span className="text-white text-xs font-bold">
                              6
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              Security First
                            </h4>
                            <p className="text-sm text-gray-400">
                              End-to-end encryption and privacy protection
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
