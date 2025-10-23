'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export type AgentMode = 'ask' | 'plan' | 'code';

interface ModeConfig {
  key: AgentMode;
  label: string;
  description: string;
  icon: string;
  color: string;
  glowColor: string;
  shortDesc: string;
}

interface ModeToggleProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const modeConfigs: ModeConfig[] = [
  { 
    key: 'ask', 
    label: 'Ask Mode', 
    description: 'Simple queries with loaded data',
    shortDesc: 'Quick answers',
    icon: '💬',
    color: 'from-green-400 to-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.3)'
  },
  { 
    key: 'plan', 
    label: 'Plan Mode', 
    description: 'Complex analysis with planning',
    shortDesc: 'Multi-step reasoning',
    icon: '🧠',
    color: 'from-blue-400 to-cyan-500',
    glowColor: 'rgba(0, 212, 255, 0.3)'
  },
  { 
    key: 'code', 
    label: 'Code Mode', 
    description: 'Custom JavaScript execution',
    shortDesc: 'Code generation',
    icon: '⚡',
    color: 'from-purple-400 to-pink-500',
    glowColor: 'rgba(139, 92, 246, 0.3)'
  }
];

export default function ModeToggle({ 
  currentMode, 
  onModeChange, 
  disabled = false,
  size = 'md',
  orientation = 'horizontal',
  className = ''
}: ModeToggleProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`
      flex ${isVertical ? 'flex-col' : 'flex-row'} 
      card p-2 gap-2
      ${className}
    `}>
      {modeConfigs.map((mode) => {
        const isActive = currentMode === mode.key;
        
        return (
          <button
            key={mode.key}
            onClick={() => !disabled && onModeChange(mode.key)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{mode.icon}</span>
              <span className="text-sm">{mode.label}</span>
              <span className="text-xs text-gray-500">{mode.shortDesc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Export mode configurations for external use
export { modeConfigs };
export type { ModeConfig };