/**
 * ADK-TS Type Definitions for BlockIQ
 * 
 * This file contains TypeScript type definitions for ADK-TS integration,
 * agent modes, MCP tools, and related functionality.
 */

import { WalletData, StacksTransaction } from './stacks';

/**
 * Agent operation modes supported by BlockIQ
 */
export type AgentMode = 'ask' | 'plan' | 'code';

/**
 * Agent status information
 */
export interface AgentStatus {
  isReady: boolean;
  lastActivity: string;
  availableModes: AgentMode[];
  mcpToolsCount: number;
  currentMode?: AgentMode;
}

/**
 * Agent health check result
 */
export interface AgentHealthCheck {
  status: 'healthy' | 'unhealthy' | 'initializing';
  message: string;
  timestamp: string;
}

/**
 * MCP tool test results
 */
export interface MCPToolTestResults {
  toolsAvailable: string[];
  testResults: Record<string, boolean>;
}

/**
 * Agent mode suggestion result
 */
export interface ModeSuggestion {
  recommendedMode: AgentMode;
  confidence: number;
  reasoning: string;
}

/**
 * Context object passed to ADK agents
 */
export interface AgentContext {
  walletData?: WalletData;
  mode: AgentMode;
  timestamp: string;
  capabilities?: string[];
  availableTools?: string[];
  analysisCapabilities?: string[];
  executionEnvironment?: string;
  availableLibraries?: string[];
  codeCapabilities?: string[];
  safetyConstraints?: string[];
}

/**
 * MCP tool parameters for getWalletData
 */
export interface GetWalletDataParams {
  address: string;
}

/**
 * MCP tool parameters for getTransactions
 */
export interface GetTransactionsParams {
  address: string;
  limit?: number;
  offset?: number;
}

/**
 * MCP tool result for getTransactions
 */
export interface GetTransactionsResult {
  transactions: StacksTransaction[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Analysis types supported by analyzeTransactions MCP tool
 */
export type TransactionAnalysisType = 'recipients' | 'patterns' | 'volume' | 'frequency' | 'summary';

/**
 * MCP tool parameters for analyzeTransactions
 */
export interface AnalyzeTransactionsParams {
  transactions: StacksTransaction[];
  analysisType: TransactionAnalysisType;
}

/**
 * Recipient analysis result
 */
export interface RecipientAnalysis {
  type: 'recipients';
  topRecipients: Array<{
    address: string;
    count: number;
    totalAmount: number;
  }>;
  totalUniqueRecipients: number;
  summary: string;
}

/**
 * Pattern analysis result
 */
export interface PatternAnalysis {
  type: 'patterns';
  patterns: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    tokenTransfers: number;
    contractCalls: number;
    smartContracts: number;
    timeDistribution: Record<string, number>;
  };
  summary: string;
}

/**
 * Volume analysis result
 */
export interface VolumeAnalysis {
  type: 'volume';
  totalVolume: number;
  transferCount: number;
  averageVolume: number;
  medianVolume: number;
  largestTransfer: number;
  smallestTransfer: number;
  summary: string;
}

/**
 * Frequency analysis result
 */
export interface FrequencyAnalysis {
  type: 'frequency';
  dailyFrequency: Record<string, number>;
  hourlyFrequency: Record<number, number>;
  totalDays: number;
  averageDailyTransactions: number;
  peakDay: string;
  summary: string;
}

/**
 * Summary analysis result
 */
export interface SummaryAnalysis {
  type: 'summary';
  overview: {
    totalTransactions: number;
    uniqueRecipients: number;
    totalVolume: number;
    averageDailyTransactions: number;
  };
  recipients: Array<{
    address: string;
    count: number;
    totalAmount: number;
  }>;
  patterns: PatternAnalysis['patterns'];
  volume: {
    total: number;
    average: number;
    largest: number;
  };
  frequency: {
    totalDays: number;
    averageDaily: number;
    peakDay: string;
  };
  summary: string;
}

/**
 * Union type for all analysis results
 */
export type TransactionAnalysisResult = 
  | RecipientAnalysis 
  | PatternAnalysis 
  | VolumeAnalysis 
  | FrequencyAnalysis 
  | SummaryAnalysis;

/**
 * Agent configuration metadata
 */
export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  modes: {
    [K in AgentMode]: {
      name: string;
      description: string;
      method: string;
      bestFor: string[];
    };
  };
  mcpTools: Record<string, string>;
}

/**
 * Agent console log entry
 */
export interface AgentLogEntry {
  id: string;
  timestamp: string;
  type: 'mcp' | 'reasoning' | 'error' | 'info' | 'mode-change';
  mode?: AgentMode;
  message: string;
  details?: unknown;
}

/**
 * Agent operation result
 */
export interface AgentOperationResult {
  success: boolean;
  result?: string;
  error?: string;
  mode: AgentMode;
  duration: number;
  timestamp: string;
}

/**
 * ADK Integration error types
 */
export class ADKIntegrationError extends Error {
  constructor(
    message: string,
    public mode: AgentMode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ADKIntegrationError';
  }
}

export class MCPToolError extends Error {
  constructor(
    message: string,
    public toolName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'MCPToolError';
  }
}

export class AgentInitializationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AgentInitializationError';
  }
}

/**
 * Type guards for analysis results
 */
export function isRecipientAnalysis(result: TransactionAnalysisResult): result is RecipientAnalysis {
  return result.type === 'recipients';
}

export function isPatternAnalysis(result: TransactionAnalysisResult): result is PatternAnalysis {
  return result.type === 'patterns';
}

export function isVolumeAnalysis(result: TransactionAnalysisResult): result is VolumeAnalysis {
  return result.type === 'volume';
}

export function isFrequencyAnalysis(result: TransactionAnalysisResult): result is FrequencyAnalysis {
  return result.type === 'frequency';
}

export function isSummaryAnalysis(result: TransactionAnalysisResult): result is SummaryAnalysis {
  return result.type === 'summary';
}

/**
 * Utility type for agent method signatures
 */
export type AgentMethod<T = string> = (query: string, walletData?: WalletData) => Promise<T>;

/**
 * ADK Integration interface
 */
export interface IADKIntegration {
  askMode: AgentMethod;
  planMode: AgentMethod;
  codeMode: AgentMethod;
  getAgentStatus(): Promise<AgentStatus>;
  testMCPTools(): Promise<MCPToolTestResults>;
  suggestMode(query: string): ModeSuggestion;
}

// All types are already exported above individually