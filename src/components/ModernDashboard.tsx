"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Zap,
  Brain,
  MessageSquare,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Search,
  Bell,
  User,
  ChevronRight,
  Sparkles,
  Target,
  Shield,
  Globe,
} from "lucide-react";
import { WalletData, ChatMessage, GraphData } from "@/types/stacks";
import { formatNumber, truncateAddress } from "@/lib/utils";
import MetricCard from "./MetricCard";
import ActivityFeed from "./ActivityFeed";
import CommandPalette from "./CommandPalette";
import ChatInterface from "./ChatInterface";
import ExpandedGraphViewer from "./ExpandedGraphViewer";
import { AgentMode } from "./ModeToggle";

interface ModernDashboardProps {
  walletData: WalletData;
  aiSummary?: string;
  onSendMessage: (message: string) => Promise<string>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ModernDashboard({
  walletData,
  aiSummary,
  onSendMessage,
  messages,
  setMessages,
}: ModernDashboardProps) {
  const [activeView, setActiveView] = useState<
    "overview" | "analytics" | "transactions"
  >("overview");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [expandedGraph, setExpandedGraph] = useState<GraphData | null>(null);

  const balance = parseInt(walletData.balance.stx.balance) / 1000000;
  const totalSent = parseInt(walletData.balance.stx.total_sent) / 1000000;
  const totalReceived =
    parseInt(walletData.balance.stx.total_received) / 1000000;

  // Graph expansion handler
  const handleGraphExpand = (graphData: GraphData) => {
    setExpandedGraph(graphData);
  };

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommand = (commandId: string) => {
    switch (commandId) {
      case "analyze-transactions":
        const analysisMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: "Analyze the transaction patterns in this wallet",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, analysisMessage]);
        break;
      case "chat-wallet":
        // Focus will be handled by ChatInterface
        break;
      case "refresh-data":
        window.location.reload();
        break;
      case "view-insights":
        // Add message to chat
        const insightsMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: "Show me detailed AI insights about this wallet",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, insightsMessage]);
        break;
      case "recent-activity":
        const activityMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user",
          content: "What are the most recent transactions?",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, activityMessage]);
        break;
    }
  };

  return (
    <div className="h-full bg-black p-6 overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-gray-900 rounded-lg p-1">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "analytics", label: "Analytics", icon: PieChart },
              { key: "transactions", label: "Transactions", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveView(
                    tab.key as "overview" | "analytics" | "transactions"
                  )
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 border border-gray-700"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
            <div className="flex items-center space-x-1 text-xs">
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">K</kbd>
            </div>
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              // Trigger the settings modal from the parent page
              const event = new CustomEvent("openSettings");
              window.dispatchEvent(event);
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            title="AI Configuration Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Panel - Dynamic Content Based on Active View */}
        <div className="col-span-8 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {activeView === "overview" && (
            <>
              {/* Wallet Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Wallet Analysis
                      </h2>
                      <p className="text-gray-400">Stacks Blockchain</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="status-dot status-online" />
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <code className="text-sm text-gray-300 bg-gray-800 px-4 py-2 rounded-lg font-mono">
                    {truncateAddress(walletData.address)}
                  </code>
                  <button className="btn-secondary px-4 py-2 text-sm">
                    Copy
                  </button>
                </div>
              </motion.div>

              {/* Balance Cards */}
              <div className="grid grid-cols-3 gap-6">
                <MetricCard
                  title="Current Balance"
                  value={`${formatNumber(balance)} STX`}
                  subtitle="Available funds"
                  icon={Wallet}
                  color="blue"
                  delay={0.1}
                />

                <MetricCard
                  title="Total Received"
                  value={`${formatNumber(totalReceived)} STX`}
                  subtitle="All time inflows"
                  icon={ArrowDownLeft}
                  color="green"
                  trend={{ value: 12.5, isPositive: true }}
                  delay={0.2}
                />

                <MetricCard
                  title="Total Sent"
                  value={`${formatNumber(totalSent)} STX`}
                  subtitle="All time outflows"
                  icon={ArrowUpRight}
                  color="red"
                  trend={{ value: 8.3, isPositive: false }}
                  delay={0.3}
                />
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  title="Transactions"
                  value={(walletData.totalTransactions || walletData.transactions.length).toString()}
                  subtitle="Total count"
                  icon={Activity}
                  color="purple"
                  delay={0.4}
                />

                <MetricCard
                  title="Success Rate"
                  value="98.5%"
                  subtitle="Transaction success"
                  icon={Target}
                  color="green"
                  delay={0.5}
                />

                <MetricCard
                  title="Avg. Block Time"
                  value="10m"
                  subtitle="Processing time"
                  icon={Clock}
                  color="blue"
                  delay={0.6}
                />

                <MetricCard
                  title="Network"
                  value="Stacks"
                  subtitle="Blockchain"
                  icon={Globe}
                  color="yellow"
                  delay={0.7}
                />
              </div>

              {/* AI Insights Panel */}
              {aiSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          AI Insights
                        </h3>
                        <p className="text-sm text-gray-400">
                          Powered by advanced analytics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Live Analysis</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
                      <div className="w-8 h-8 bg-yellow-600/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Target className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        Activity Level
                      </h4>
                      <p className="text-xs text-yellow-400">
                        {walletData.transactions.length > 50
                          ? "Very Active"
                          : walletData.transactions.length > 10
                          ? "Regular Activity"
                          : "New Activity"}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30">
                      <div className="w-8 h-8 bg-blue-600/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        Wallet Type
                      </h4>
                      <p className="text-xs text-blue-400">
                        {balance > 1000
                          ? "High Balance"
                          : balance > 100
                          ? "Active Holder"
                          : "Growing"}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30">
                      <div className="w-8 h-8 bg-green-600/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        Trend
                      </h4>
                      <p className="text-xs text-green-400">
                        {totalReceived > totalSent
                          ? "Accumulating"
                          : "Distributing"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center space-x-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">
                        AI Analysis
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {aiSummary
                        .replace(/\*\*+/g, "")
                        .replace(/\|+/g, "")
                        .replace(/---+/g, "")
                        .trim()}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Recent Activity
                      </h3>
                      <p className="text-sm text-gray-400">
                        Latest transactions
                      </p>
                    </div>
                  </div>
                  <button className="btn-secondary px-4 py-2 text-sm">
                    View All
                  </button>
                </div>

                <ActivityFeed
                  transactions={walletData.transactions}
                  maxItems={5}
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="col-span-4" style={{maxHeight: "590px"}}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <ChatInterface
              onSendMessage={onSendMessage}
              disabled={false}
              messages={messages}
              setMessages={setMessages}
              onGraphExpand={handleGraphExpand}
            />
          </motion.div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />

      {/* Expanded Graph Viewer */}
      <ExpandedGraphViewer
        graphData={expandedGraph}
        onClose={() => setExpandedGraph(null)}
      />
    </div>
  );
}
