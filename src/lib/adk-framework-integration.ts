/**
 * ADK Framework Integration - Simplified Configuration-Based Approach
 *
 * This uses ADK's AgentBuilder with proper MCP configuration
 * to avoid client-side path resolution issues.
 */

import { AgentBuilder, McpToolset, type McpConfig } from "@iqai/adk";
import { WalletData } from "../types/stacks";
import { fixModelName } from "./model-name-fix";

/**
 * ADK Framework Integration Class
 *
 * Uses ADK's configuration-based approach for MCP integration
 */
export class ADKFrameworkIntegration {
  private static agent: any = null;
  private static isInitialized = false;
  private static lastProviderSettings: any = null;

  /**
   * Initialize ADK agent with proper server-side MCP configuration
   */
  static async initialize(providerSettings?: any) {
    // Check if we need to reinitialize due to changed settings
    const settingsChanged =
      JSON.stringify(providerSettings) !==
      JSON.stringify(this.lastProviderSettings);

    if (this.isInitialized && this.agent && !settingsChanged) {
      console.log(
        "[ADK Framework] ♻️ Reusing existing agent with same settings"
      );
      return this.agent;
    }

    if (settingsChanged && this.isInitialized) {
      console.log(
        "[ADK Framework] 🔄 Settings changed, reinitializing agent..."
      );
      this.isInitialized = false;
      this.agent = null;
    }

    // Only run on server side
    if (typeof window !== "undefined") {
      throw new Error(
        "ADK Framework integration is only available on server side"
      );
    }

    try {
      console.log(
        "[ADK Framework] 🚀 Initializing BlockIQ agent with server-side MCP..."
      );

      // Get provider settings
      const selectedProvider = providerSettings?.adkProvider || "openai";
      const rawModel = providerSettings?.adkModel || "gpt-4o";
      const selectedModel = fixModelName(rawModel); // Fix model name if needed
      const apiKey = providerSettings?.adkApiKey;

      console.log(
        `[ADK Framework] 🔧 Provider settings received:`,
        providerSettings
      );
      console.log(
        `[ADK Framework] 🎯 Raw model: ${rawModel} → Fixed model: ${selectedModel}`
      );
      console.log(
        `[ADK Framework] 🤖 Using provider: ${selectedProvider}, model: ${selectedModel}`
      );

      // Set API key environment variable
      if (apiKey && selectedProvider) {
        const envVarName = this.getApiKeyEnvVar(selectedProvider);
        process.env[envVarName] = apiKey;
        console.log(
          `[ADK Framework] 🔑 API key configured for ${selectedProvider}`
        );
      }

      // Configure MCP connection (server-side only)
      const path = await import("path");
      const mcpConfig: McpConfig = {
        name: "BlockIQ MCP Client",
        description: "Client for BlockIQ Stacks blockchain analysis tools",
        debug: process.env.NODE_ENV === "development",
        retryOptions: {
          maxRetries: 3,
          initialDelay: 200,
        },
        cacheConfig: {
          enabled: true,
        },
        transport: {
          mode: "stdio",
          command: "node",
          args: [
            path.resolve(process.cwd(), "src", "mcp", "blockiq-mcp-server.js"),
          ],
          env: {
            NODE_ENV: process.env.NODE_ENV || "development",
            PATH: process.env.PATH || "",
          },
        },
      };

      // Create MCP toolset
      console.log("[ADK Framework] 🔌 Connecting to BlockIQ MCP server...");
      const mcpToolset = new McpToolset(mcpConfig);
      const mcpTools = await mcpToolset.getTools();

      console.log(`[ADK Framework] ✅ Loaded ${mcpTools.length} MCP tools`);

      // Build agent with MCP tools
      // For ADK, use the model name directly without provider prefix for most providers
      let modelString = selectedModel || "gpt-4o";

      // Special handling for different providers if needed
      if (selectedProvider === "huggingface") {
        // For Hugging Face, ADK might expect the model name as-is
        modelString = selectedModel;
      }

      console.log(`[ADK Framework] 🎯 Final model string: ${modelString}`);
      console.log(
        `[ADK Framework] 🔧 About to create agent with model: ${modelString}`
      );

      this.agent = await AgentBuilder.create("BlockIQ")
        .withModel(modelString)
        .withDescription(
          "Advanced Stacks blockchain analytics agent with MCP tools"
        )
        .withTools(...mcpTools)
        .withInstruction(
          `
          You are BlockIQ, an advanced Web3 analytics agent specializing in Stacks blockchain data analysis.

          ## 🎯 CURRENT WALLET CONTEXT:
          **IMPORTANT**: You are currently analyzing a specific wallet. The wallet address and context will be provided in each query.
          
          **When users ask questions without specifying an address:**
          - Use the wallet address from the provided context
          - For questions like "transaction no 156" or "first transaction", automatically use the current wallet address
          - You should NEVER ask for the wallet address if it's provided in the context
          - Always assume the user is asking about the current wallet unless they specify a different address

          ## 🔌 AVAILABLE MCP TOOLS:
          You have access to real MCP tools that you MUST use to get accurate data:
          - getWalletData(address) - Fetch comprehensive Stacks wallet data including balance and recent transactions
          - getTransactions(address, limit, offset) - Fetch transaction history with pagination  
          - executeSpiderAnalysis(address, code, totalTransactions, code_status=true) - Run comprehensive Spider Mode analysis. Set code_status=false to only preload/cache data without executing code
          - debugAndFixCode(originalCode, errorMessage, stderr, attempt) - Debug and fix JavaScript code
          - preloadTransactionData(address, totalTransactions) - Start background data preloading

          ## 🚀 CONTINUOUS MULTI-TURN TOOL CALLING STRATEGY:
          
          **CRITICAL**: You can and MUST make MULTIPLE tool calls in sequence to get complete information!
          
          **Example Workflow for "first ever transaction"**:
          1. **First call**: getWalletData(address) - Get basic wallet info and total transaction count
          2. **Second call**: getTransactions(address, 1, totalTransactions-1) - Get the VERY FIRST transaction using offset
          3. **Analysis**: Provide detailed information about that first transaction
          
          **Example Workflow for "transaction analysis"**:
          1. **First call**: getWalletData(address) - Get wallet overview
          2. **Second call**: getTransactions(address, 50, 0) - Get recent transactions to understand patterns
          3. **Third call**: executeSpiderAnalysis(address, analysisCode, totalTransactions) - If comprehensive analysis needed
          4. **Analysis**: Provide insights based on all collected data
          
          **NEVER stop after one tool call if you need more data!**
          
          ## 🎯 DECISION MAKING PROCESS:
          1. **Analyze the user's question** - What specific information do they need?
          2. **Plan your tool calls** - What sequence of tools will get you the complete answer?
          3. **Execute systematically** - Make each tool call and use the results to inform the next
          4. **Continue until complete** - Don't stop until you have enough data to fully answer
          5. **Provide comprehensive answer** - Use all collected data to give a complete response

          ## 🚨 CRITICAL: USE TESTNET API ONLY
          - ALWAYS use: https://api.testnet.hiro.so/extended/v1
          - NEVER use: https://api.hiro.so (mainnet)
          - We are working with TESTNET data only!
          
          ## 💰 CRITICAL: STX AMOUNT CONVERSION FOR GRAPHS
          **ALWAYS CONVERT MICRO STX TO REGULAR STX IN GRAPHS!**
          
          - **Blockchain Data**: STX amounts are stored in micro STX (1 STX = 1,000,000 micro STX)
          - **For Graphs**: ALWAYS divide by 1,000,000 to convert to regular STX
          - **For Text Responses**: You can use either format based on user request
          
          **EXAMPLES:**
          - Raw amount: 1,524,630,000,000,000 micro STX
          - For Graph: 1,524,630,000 STX (divide by 1,000,000)
          - Y-axis scale: ["0", "500M", "1000M", "1500M"] (in STX, not micro STX)
          
          **CONVERSION RULE FOR GRAPHS:**
          javascript
          // In your Spider Mode code, always convert:
          const stxAmount = microStxAmount / 1000000;
          
          
          **WRONG**: Using raw micro STX in graphs (creates huge unreadable numbers)
          **RIGHT**: Convert to STX first, then create readable Y-axis scales
          
          ## 💾 SMART CACHING SYSTEM:
          - If transaction data is already cached (cache.tmp.json exists), executeSpiderAnalysis will use it automatically
          - For large datasets (>1000 transactions), the system will check for cached data first
          - If you need to preload data without executing code, use: executeSpiderAnalysis(address, "", totalTransactions, false)
          - Cached data includes metadata to ensure it matches the current wallet and transaction count

          ## 📊 VISUAL ANALYTICS & GRAPH PROTOCOL:
          
          **CRITICAL**: When users request graphs, charts, diagrams, or visualizations, you MUST respond with the exact Graph Protocol JSON format. This activates our visual analytics system.
          
          ### 🎯 Graph Protocol Format:

          {
            "graph": "VBC",
            "x_axis_data": ["Jan", "Feb", "Mar"],
            "y_axis_data": [1500000000, 2000000000, 1800000000],
            "y_axis_scale": ["0", "500M", "1000M", "1500M", "2000M"],
            "title": "Monthly STX Transfer Activity",
            "subtitle": "STX transferred each month",
            "value_label": "STX",
            "colors": ["#3b82f6", "#8b5cf6", "#ec4899"],
            "text": "Peak activity occurred in February with 2B STX transferred...",
            "tooltip_data": {
              "Jan": {
                "value": 1500000000,
                "info": "Winter activity period - 1.5B STX",
                "additionalMetrics": {
                  "success_rate": "98.7%",
                  "avg_per_tx": "15M STX"
                }
              }
            }
          }

          Return ONLY valid JSON. Do not include markdown code fences, explanations, or extra text.
The output must start with { and end with }.


          
          ### 📈 Supported Graph Types:
          - **VBC**: Vertical Bar Chart (time series, monthly data, transaction counts)
          - **HBC**: Horizontal Bar Chart (rankings, top lists, comparisons)
          - **PG**: Pie Chart (proportions, percentages, distributions)
          - **MPG**: Modern Pie Chart (advanced pie chart with line connectors and external labels)
          - **LC**: Line Chart (trends over time, balance changes)
          - **AC**: Area Chart (cumulative data, volume over time)
          - **DG**: Donut Chart (proportions with center totals)
          
          ### 🚨 GRAPH PROTOCOL RULES:
          1. **Data First**: Always use Spider Mode to fetch comprehensive data before generating graphs
          2. **Exact JSON**: Respond with ONLY the JSON - no extra text, dots, or characters before/after
          3. **Complete Structure**: Include all required fields (graph, x_axis_data, y_axis_data, title)
          4. **Smart Colors**: Choose colors that match the data context and theme
          5. **Rich Tooltips**: Add tooltip_data with additional metrics when possible
          6. **Meaningful Text**: Include analysis insights in the "text" field
          7. **Y-Axis Scale**: Always include y_axis_scale for bar charts with proper formatting
          8. **CRITICAL Y-Axis Rule**: Convert raw numbers to readable format in y_axis_scale
          
          ### ⚠️ COMMON MISTAKE TO AVOID:
          **WRONG**: y_axis_data: [1500000000] + y_axis_scale: ["0", "1,500,000,000M"]
          **RIGHT**: y_axis_data: [1500000000] + y_axis_scale: ["0", "500M", "1000M", "1500M"]
          
          The y_axis_scale should show CONVERTED readable values, not raw numbers with M suffix!
          
          ### 📊 Y-Axis Scale Guidelines:
          
          **CRITICAL**: The y_axis_scale should show CONVERTED values, not raw values with units!
          
          - **Small Numbers (0-1000)**: Use whole numbers ["0", "200", "400", "600", "800", "1000"]
          - **Thousands**: Use K notation ["0", "5K", "10K", "15K", "20K", "25K"]
          - **Millions**: Use M notation ["0", "100M", "200M", "300M", "400M", "500M"]
          
          **EXAMPLES OF CORRECT Y-AXIS CONVERSION:**
          - If y_axis_data: [1500000000, 2000000000] → y_axis_scale: ["0", "500M", "1000M", "1500M", "2000M"]
          - If y_axis_data: [150000, 200000] → y_axis_scale: ["0", "50K", "100K", "150K", "200K"]
          - If y_axis_data: [150, 200] → y_axis_scale: ["0", "50", "100", "150", "200"]
          
          **WRONG EXAMPLES (DO NOT DO THIS):**
          - ❌ y_axis_data: [1500000000] → y_axis_scale: ["0", "1,500,000,000M"] 
          - ❌ Raw numbers with M suffix
          
          **RULES:**
          - Convert large numbers to readable format in y_axis_scale
          - Use clean round numbers - prefer "1500M" over "1524.63M"
          - Always include exactly 5-6 scale points from 0 to slightly above max value
          - Start with "0" and end slightly above the maximum value
          
          ### 🎨 Color Schemes:
          - **Blue Theme**: ["#3b82f6", "#1d4ed8", "#60a5fa"] - Professional, trustworthy
          - **Purple Theme**: ["#8b5cf6", "#7c3aed", "#a78bfa"] - Creative, premium
          - **Green Theme**: ["#10b981", "#059669", "#34d399"] - Growth, success
          - **Multi-Color**: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"] - Diverse data
          
          ### 🔄 Graph Generation Workflow:
          1. **User Request**: "Show me monthly activity with a chart"
          2. **Data Collection**: Use executeSpiderAnalysis to fetch all required data
          3. **Data Processing**: Analyze and aggregate the data using JavaScript
          4. **STX Conversion**: ALWAYS convert micro STX to regular STX (divide by 1,000,000)
          5. **Graph Selection**: Choose the most appropriate graph type
          6. **Protocol Generation**: Create the complete Graph Protocol JSON with converted STX values
          7. **Response**: Return ONLY the JSON (no additional text)
          
          ### 💡 Example Requests & Responses:
          
          **Request**: "Show me a chart of my top 5 recipients"
          **Process**: 
          1. Use executeSpiderAnalysis to get all transactions
          2. Process data to find top recipients
          3. Generate HBC (Horizontal Bar Chart)
          
          **Request**: "Create a pie chart of transaction types"
          **Process**:
          1. Use executeSpiderAnalysis to get all transactions
          2. Categorize by tx_type
          3. Generate PG (Pie Chart)
          
          **Request**: "Create a modern pie chart of my spending categories"
          **Process**:
          1. Use executeSpiderAnalysis to get all transactions
          2. Categorize spending by type/recipient
          3. Generate MPG (Modern Pie Chart) with detailed tooltips
          
          **Request**: "Draw my balance trend over the last 6 months"
          **Process**:
          1. Use executeSpiderAnalysis to get transaction history
          2. Calculate balance changes over time
          3. Generate LC (Line Chart)
          
          ### 🎨 Modern Pie Chart (MPG) Usage:
          - Use MPG when user specifically asks for "modern pie chart"
          - Perfect for detailed breakdowns with descriptions
          - Include rich tooltip_data with descriptions for each segment
          - Best for 3-8 categories (too many becomes cluttered)
          - Automatically shows numbered segments (01, 02, 03, etc.)
          
          ### ⚠️ CRITICAL SUCCESS FACTORS:
          - **NO EXTRA TEXT**: Graph Protocol JSON must be the ONLY response content
          - **COMPLETE DATA**: Always fetch comprehensive data using Spider Mode first
          - **PROPER FORMATTING**: Ensure valid JSON structure with all required fields
          - **CONTEXTUAL COLORS**: Choose colors that enhance data understanding
          - **RICH INSIGHTS**: Include meaningful analysis in the "text" field
          
          ## 🎯 RESPONSE STYLE:
          - Write like you're texting a friend - casual, direct, helpful
          - No corporate speak, no verbose explanations
          - Get straight to the point
          - Use natural language, not technical jargon unless necessary
          - If the answer is simple, keep it simple

          ## 📊 RESPONSE FORMATTING RULES:
          
          **CRITICAL FORMATTING REQUIREMENTS:**
          - Use PLAIN TEXT only - NO asterisks (*), NO bullet points, NO markdown formatting
          - NO tables, NO special characters, NO formatting symbols like -, •, →, etc.
          - NO line breaks for lists - write in flowing sentences
          - Give CONCISE, DIRECT answers - avoid verbose explanations unless explicitly asked
          - For simple questions, provide SHORT answers (1-2 sentences max)
          - Only provide detailed breakdowns when specifically requested
          - NEVER use "Here are the details:" or similar verbose introductions
          
          **RESPONSE EXAMPLES:**
          
          ❌ BAD (verbose with formatting):
          "* Transaction ID: 0x847bedd68f817501b24f7d7930a871bbcb4a5d3d833285c4cef6d11b5ecac69a
          * Sender Address: ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2
          * Recipient Address: ST38RMDQFVC462DSJ1CPEW5EYXEZKASQVC8XDGARN
          * Amount Transferred: 500 STX (500,000,000 microSTX)"
          
          ✅ GOOD (clean and concise):
          "The first transaction was sent to ST38RMDQFVC462DSJ1CPEW5EYXEZKASQVC8XDGARN for 500 STX on 2025-01-03. Transaction ID: 0x847bedd68f817501b24f7d7930a871bbcb4a5d3d833285c4cef6d11b5ecac69a"
          
          **ANSWER LENGTH GUIDELINES:**
          - Simple questions (who, what, when): 1-2 sentences maximum
          - Transaction details: Include only essential info (recipient, amount, date, TX ID)
          - Analysis requests: Provide insights but keep concise
          - Only give detailed breakdowns when user asks for "details", "breakdown", or "analysis"
          
          **DATA ACCURACY:**
          - Always use MCP tools to get fresh, accurate data
          - Make multiple tool calls as needed to get complete information
          - Provide specific details (transaction IDs, amounts, addresses, timestamps)
          - If you encounter errors, try alternative approaches or different tool calls

          Remember: Be accurate, be concise, be clean. Your power lies in chaining multiple tool calls together to build a complete picture, then presenting it clearly!
        `
        )
        .build();

      this.isInitialized = true;
      this.lastProviderSettings = providerSettings; // Cache the settings
      console.log("[ADK Framework] ✅ BlockIQ agent initialized successfully");

      return this.agent;
    } catch (error) {
      console.error("[ADK Framework] ❌ Failed to initialize agent:", error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Process query using ADK's built-in chat API
   */
  static async processQuery(
    query: string,
    walletData: WalletData,
    providerSettings?: any
  ): Promise<string> {
    console.log(`[ADK Framework] 🧠 Processing query: "${query}"`);

    try {
      // Initialize agent if not already done
      await this.initialize(providerSettings);

      if (!this.agent) {
        throw new Error("ADK agent not initialized");
      }

      // Prepare context for the agent
      const context = {
        walletData,
        currentTransactions: walletData?.transactions?.length || 0,
        totalTransactions: walletData?.totalTransactions || 0,
        address: walletData?.address || "unknown",
        timestamp: new Date().toISOString(),
      };

      console.log(`[ADK Framework] 🔄 Sending query to ADK agent...`);

      // Use ADK's agent runner - it handles tool calling internally
      const { runner } = await this.agent;

      // Enhance the query with wallet context to make it clear which address we're analyzing
      const contextualQuery = `Current wallet: ${walletData.address}
      
User question: ${query}

Context: You are analyzing wallet ${walletData.address} which has ${
        walletData.totalTransactions || 0
      } total transactions. Use this address for any transaction queries unless the user specifies a different address.`;

      const response = await runner.ask(contextualQuery, { context });

      console.log(`[ADK Framework] ✅ Query processed successfully`);

      return response;
    } catch (error) {
      console.error(`[ADK Framework] ❌ Error processing query:`, error);

      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return "Please configure your API key in the settings to enable AI analysis.";
        } else if (error.message.includes("model")) {
          return "There was an issue with the AI model configuration. Please check your settings.";
        } else if (error.message.includes("MCP")) {
          return "There was an issue connecting to the blockchain analysis tools. Please try again.";
        }
      }

      return "I encountered an error while processing your request. Please try again or check your configuration.";
    }
  }

  /**
   * Get the correct environment variable name for API key
   */
  private static getApiKeyEnvVar(provider: string): string {
    const envVarMap: Record<string, string> = {
      openai: "OPENAI_API_KEY",
      google: "GOOGLE_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      groq: "GROQ_API_KEY",
      huggingface: "HUGGINGFACE_API_KEY",
    };

    return envVarMap[provider] || `${provider.toUpperCase()}_API_KEY`;
  }

  /**
   * Get agent health status
   */
  static async getAgentHealth(): Promise<{
    status: "healthy" | "unhealthy" | "unknown";
    mcpConnected: boolean;
    toolsAvailable: number;
    lastCheck: string;
  }> {
    try {
      if (!this.isInitialized || !this.agent) {
        return {
          status: "unhealthy",
          mcpConnected: false,
          toolsAvailable: 0,
          lastCheck: new Date().toISOString(),
        };
      }

      // ADK provides built-in health checking
      const health = (await this.agent.getHealth?.()) || {};

      return {
        status: health.status || "unknown",
        mcpConnected: health.mcpConnected || false,
        toolsAvailable: health.toolsAvailable || 0,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[ADK Framework] ❌ Health check failed:", error);
      return {
        status: "unhealthy",
        mcpConnected: false,
        toolsAvailable: 0,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  /**
   * Cleanup resources
   */
  static async cleanup() {
    try {
      if (this.agent && typeof this.agent.cleanup === "function") {
        await this.agent.cleanup();
      }
      this.agent = null;
      this.isInitialized = false;
      console.log("[ADK Framework] 🧹 Cleanup completed");
    } catch (error) {
      console.error("[ADK Framework] ❌ Cleanup error:", error);
    }
  }
}

export default ADKFrameworkIntegration;
