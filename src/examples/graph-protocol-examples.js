/**
 * BlockIQ Visual Analytics System - Graph Protocol Examples
 * 
 * These are example Graph Protocol JSON responses that demonstrate
 * how the AI should format visual analytics responses.
 */

// Example 1: Monthly Transaction Activity (Vertical Bar Chart)
const monthlyActivityExample = {
  "graph": "VBC",
  "x_axis_data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "y_axis_data": [150, 220, 180, 195, 240, 210],
  "y_axis_scale": ["0", "50", "100", "150", "200", "250"],
  "title": "Monthly Transaction Activity",
  "subtitle": "Transactions per month over 6 months",
  "value_label": "Transactions",
  "colors": ["#3b82f6", "#1d4ed8", "#60a5fa", "#2563eb", "#1e40af", "#1e3a8a"],
  "text": "Peak activity occurred in May with 240 transactions, showing a 23% increase from April. The wallet demonstrates consistent activity with an average of 199 transactions per month. February shows the highest spike, possibly indicating increased trading activity during market volatility.",
  "tooltip_data": {
    "Jan": {
      "value": 150,
      "info": "Winter activity period",
      "additionalMetrics": {
        "success_rate": "98.7%",
        "avg_amount": "1.2M STX",
        "top_recipient": "ST1ABC...DEF"
      }
    },
    "Feb": {
      "value": 220,
      "info": "High activity month",
      "additionalMetrics": {
        "success_rate": "99.1%",
        "avg_amount": "1.8M STX",
        "top_recipient": "ST2XYZ...GHI"
      }
    }
  }
}

// Example 2: Top Recipients (Horizontal Bar Chart)
const topRecipientsExample = {
  "graph": "HBC",
  "x_axis_data": ["ST1ABC...DEF", "ST2XYZ...GHI", "ST3QWE...RTY", "ST4ASD...FGH", "ST5ZXC...VBN"],
  "y_axis_data": [2500000, 1800000, 1200000, 950000, 750000],
  "y_axis_scale": ["0", "500K", "1M", "1.5M", "2M", "2.5M"],
  "title": "Top 5 Recipients",
  "subtitle": "Addresses receiving the most STX",
  "value_label": "STX Amount",
  "colors": ["#8b5cf6", "#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"],
  "text": "The top recipient received 2.5M STX, representing 35% of all outgoing transfers. The distribution shows a clear hierarchy with the top 3 recipients accounting for 72% of total outgoing volume. This suggests focused relationships with key addresses.",
  "tooltip_data": {
    "ST1ABC...DEF": {
      "value": 2500000,
      "info": "Primary recipient - 35% of total",
      "additionalMetrics": {
        "transaction_count": "45",
        "avg_per_tx": "55,556 STX",
        "relationship": "Exchange"
      }
    }
  }
}

// Example 3: Transaction Type Distribution (Pie Chart)
const transactionTypesExample = {
  "graph": "PG",
  "x_axis_data": ["Token Transfer", "Contract Call", "Smart Contract", "Coinbase", "Other"],
  "y_axis_data": [1250, 340, 85, 25, 15],
  "title": "Transaction Type Distribution",
  "subtitle": "Breakdown of transaction types",
  "value_label": "Count",
  "colors": ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"],
  "text": "Token transfers dominate at 73% of all transactions, indicating active trading behavior. Contract calls represent 20%, suggesting engagement with DeFi protocols. Smart contract deployments are minimal at 5%, showing this is primarily a user wallet rather than a developer address.",
  "tooltip_data": {
    "Token Transfer": {
      "value": 1250,
      "info": "Standard STX transfers",
      "additionalMetrics": {
        "avg_amount": "125,000 STX",
        "success_rate": "99.2%"
      }
    }
  }
}

// Example 4: Balance Trend Over Time (Line Chart)
const balanceTrendExample = {
  "graph": "LC",
  "x_axis_data": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
  "y_axis_data": [5000000, 4750000, 5200000, 4900000, 5500000, 5800000],
  "title": "Balance Trend Analysis",
  "subtitle": "STX balance changes over 6 weeks",
  "value_label": "STX Balance",
  "colors": ["#ec4899", "#db2777", "#f472b6"],
  "text": "The wallet shows an overall upward trend with a 16% increase over 6 weeks. Notable volatility in weeks 2-4 suggests active trading, followed by steady accumulation. The current balance of 5.8M STX represents the highest point in the analyzed period.",
  "tooltip_data": {
    "Week 1": {
      "value": 5000000,
      "info": "Starting balance",
      "additionalMetrics": {
        "net_change": "0 STX",
        "transactions": "12"
      }
    }
  }
}

// Example 5: Cumulative Volume (Area Chart)
const cumulativeVolumeExample = {
  "graph": "AC",
  "x_axis_data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "y_axis_data": [1000000, 2500000, 4200000, 6100000, 8500000, 11200000],
  "title": "Cumulative Transaction Volume",
  "subtitle": "Total STX volume over time",
  "value_label": "Cumulative STX",
  "colors": ["#f59e0b", "#d97706", "#fbbf24"],
  "text": "Total transaction volume reached 11.2M STX by June, with accelerating growth in the latter months. The steepest growth occurred between April and May, indicating increased activity. The cumulative curve shows consistent upward momentum with no significant plateaus.",
  "tooltip_data": {
    "Jun": {
      "value": 11200000,
      "info": "Peak cumulative volume",
      "additionalMetrics": {
        "monthly_growth": "32%",
        "velocity": "High"
      }
    }
  }
}

// Example 6: Activity Distribution (Donut Chart)
const activityDistributionExample = {
  "graph": "DG",
  "x_axis_data": ["Morning", "Afternoon", "Evening", "Night"],
  "y_axis_data": [180, 320, 280, 95],
  "title": "Daily Activity Distribution",
  "subtitle": "Transaction timing patterns",
  "value_label": "Transactions",
  "colors": ["#6366f1", "#4f46e5", "#818cf8", "#a5b4fc"],
  "text": "Afternoon shows peak activity with 37% of transactions, followed by evening at 32%. This pattern suggests active trading during market hours. Night activity is minimal at 11%, indicating human rather than automated trading behavior.",
  "tooltip_data": {
    "Afternoon": {
      "value": 320,
      "info": "Peak activity period (12-18h)",
      "additionalMetrics": {
        "avg_amount": "95,000 STX",
        "success_rate": "99.4%"
      }
    }
  }
}

// Example 7: Modern Pie Chart with Line Connectors
const modernPieChartExample = {
  "graph": "MPG",
  "x_axis_data": ["DeFi Trading", "NFT Purchases", "Staking Rewards", "P2P Transfers", "Exchange Deposits"],
  "y_axis_data": [2500000000, 800000000, 1200000000, 600000000, 400000000],
  "title": "STX Usage Breakdown",
  "subtitle": "How STX tokens are being utilized",
  "value_label": "STX Amount",
  "colors": ["#4f46e5", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
  "text": "DeFi trading dominates STX usage at 45%, followed by staking rewards at 22%. This indicates active participation in the Stacks ecosystem with a focus on yield generation and decentralized finance activities.",
  "tooltip_data": {
    "DeFi Trading": {
      "value": 2500000000,
      "info": "Active trading on decentralized exchanges and liquidity provision",
      "additionalMetrics": {
        "avg_trade_size": "25M STX",
        "frequency": "Daily",
        "platforms": "3 DEXs"
      }
    },
    "NFT Purchases": {
      "value": 800000000,
      "info": "Digital collectibles and art purchases on Stacks",
      "additionalMetrics": {
        "collections": "12",
        "avg_price": "8M STX",
        "rarest_nft": "Stacks Punk #42"
      }
    },
    "Staking Rewards": {
      "value": 1200000000,
      "info": "Rewards from staking STX tokens for Bitcoin yield",
      "additionalMetrics": {
        "apy": "8.5%",
        "cycles": "24",
        "btc_earned": "0.15 BTC"
      }
    }
  }
}

module.exports = {
  monthlyActivityExample,
  topRecipientsExample,
  transactionTypesExample,
  balanceTrendExample,
  cumulativeVolumeExample,
  activityDistributionExample,
  modernPieChartExample
}