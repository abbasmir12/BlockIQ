'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import AgentStatusMonitor, { AgentStatus } from './AgentStatusMonitor';
import SettingsModal from './SettingsModal';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const navigationItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'wallet', icon: '💰', label: 'Wallet Analysis' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'agents', icon: '🤖', label: 'AI Agents' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const handleAgentStatusChange = (status: AgentStatus) => {
    setAgentStatus(status);
  };

  const handleNavClick = (itemId: string) => {
    if (itemId === 'settings') {
      setShowSettings(true);
    } else {
      setActiveNav(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">BlockIQ</span>
              <div className="text-xs text-gray-400 font-medium">Web3 Analytics</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id && item.id !== 'settings'}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* Agent Status Panel */}
        <div className="absolute bottom-6 left-6 right-6">
          <AgentStatusMonitor 
            onStatusChange={handleAgentStatusChange}
            showDetails={false}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-white">Web3 Analytics Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Real-time blockchain insights powered by AI</p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Agent Status Indicator */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-black/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
                  <AgentStatusMonitor compact={true} />
                  {agentStatus && (
                    <div className="text-xs text-gray-400">
                      {agentStatus.performance.totalRequests} requests • {agentStatus.performance.responseTime}ms avg
                    </div>
                  )}
                </div>

                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="AI Configuration Settings"
                >
                  <span className="text-lg">⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}