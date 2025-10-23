"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Maximize2,
} from "lucide-react";
import { GraphData } from "@/types/stacks";

interface GraphRendererProps {
  data: GraphData;
  isCompact?: boolean;
  onClick?: () => void;
  onExpand?: () => void;
}

export default function GraphRenderer({
  data,
  isCompact = false,
  onClick,
  onExpand,
}: GraphRendererProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring animations for smooth interactions
  const scale = useSpring(1, { stiffness: 300, damping: 30 });
  const opacity = useSpring(1, { stiffness: 300, damping: 30 });
  const glowIntensity = useSpring(0, { stiffness: 200, damping: 25 });

  // Transform values for dynamic styling
  const scaleTransform = useTransform(scale, [1, 1.02], [1, 1.02]);
  const glowTransform = useTransform(glowIntensity, [0, 1], [0.1, 0.3]);

  // Validate data to prevent NaN errors
  const safeData = {
    ...data,
    x_axis_data: data.x_axis_data || [],
    y_axis_data: data.y_axis_data?.map((val) => (isNaN(val) ? 0 : val)) || [],
    tooltip_data: data.tooltip_data,
  };
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: {
      label: string;
      value: number;
      percentage?: number;
      color: string;
      additionalInfo?: string;
    };
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: { label: "", value: 0, color: "" },
  });

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle hover effects
  useEffect(() => {
    if (isHovered) {
      scale.set(1.02);
      glowIntensity.set(1);
    } else {
      scale.set(1);
      glowIntensity.set(0);
    }
  }, [isHovered, scale, glowIntensity]);

  const showTooltip = (
    event: React.MouseEvent,
    label: string,
    value: number,
    color: string,
    additionalInfo?: string
  ) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) return;

    const total = safeData.y_axis_data.reduce((sum, val) => sum + val, 0);
    const percentage = total > 0 ? (value / total) * 100 : 0;

    // Get enhanced tooltip data if available
    const tooltipData = safeData.tooltip_data?.[label];
    const enhancedInfo = tooltipData?.info || additionalInfo;

    // Calculate position relative to the element center
    const elementCenterX = rect.left + rect.width / 2;

    // Position tooltip above the element by default
    let x = elementCenterX;
    let y = rect.top - 15;

    // If tooltip would go above the container, position it below
    if (y < containerRect.top + 10) {
      y = rect.bottom + 15;
    }

    // Keep tooltip within horizontal bounds relative to container
    const tooltipWidth = 256; // w-64 = 16rem = 256px
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;

    // Adjust horizontal position to stay within container bounds
    if (x + tooltipWidth / 2 > containerRight - 10) {
      x = containerRight - tooltipWidth / 2 - 10;
    } else if (x - tooltipWidth / 2 < containerLeft + 10) {
      x = containerLeft + tooltipWidth / 2 + 10;
    }

    setTooltip({
      visible: true,
      x: x,
      y: y,
      content: {
        label,
        value,
        percentage,
        color,
        additionalInfo: enhancedInfo,
      },
    });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const neonColors = [
    "#8b5cf6",
    "#3b82f6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#6366f1",
    "#a855f7",
  ];

  const colors = data.colors || neonColors;

  const renderHorizontalBarChart = () => {
    const maxValue = Math.max(...safeData.y_axis_data) || 1;

    return (
      <div className="space-y-4">
        {safeData.x_axis_data.map((label, index) => {
          const value = safeData.y_axis_data[index] || 0;
          const percentage = (value / maxValue) * 100;
          const color = colors[index % colors.length];

          return (
            <motion.div
              key={index}
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
              }}
            >
              <div className="w-28 text-sm text-gray-300 text-right truncate font-medium">
                {label}
              </div>
              <div className="flex-1 bg-black/60 rounded-full h-10 relative overflow-hidden border border-gray-800/50">
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: animationComplete ? `${percentage}%` : 0,
                    opacity: animationComplete ? 1 : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="h-full rounded-full flex items-center justify-end pr-4 cursor-pointer chart-data-point relative group"
                  style={{
                    background: `linear-gradient(90deg, ${color}40, ${color})`,
                  }}
                  whileHover={{
                    scale: 1.02,
                  }}
                  onMouseEnter={(e) =>
                    showTooltip(e, label, value, color, `Rank: #${index + 1}`)
                  }
                  onMouseLeave={hideTooltip}
                >
                  {/* Animated glow effect */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />

                  {/* Value moved to end of bar */}
                  <span className="text-white text-xs font-semibold relative z-10 mr-2">
                    {value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(1)}K`
                      : value.toLocaleString()}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderVerticalBarChart = () => {
    const maxValue = Math.max(...safeData.y_axis_data) || 1;
    const total = safeData.y_axis_data.reduce((sum, val) => sum + val, 0) || 1;

    // Generate Y-axis scale (use provided y_axis_scale or auto-generate)
    const yAxisScale = safeData.y_axis_scale || generateYAxisScale(maxValue);
    const chartHeight = 240;

    // Dynamic chart width based on number of bars
    const numberOfBars = safeData.x_axis_data.length;
    const barWidth = 48; // w-12 = 48px
    const barSpacing = 12; // space-x-3 = 12px
    const chartWidth = Math.max(
      420,
      numberOfBars * (barWidth + barSpacing) + 40
    ); // Minimum 420px
    const yAxisWidth = 80; // Space for Y-axis labels

    return (
      <div className="flex justify-center overflow-x-auto">
        <div
          className="relative"
          style={{
            width: chartWidth + yAxisWidth,
            height: chartHeight + 120,
            minWidth: "500px",
          }}
        >
          {/* Y-axis */}
          <div
            className="absolute left-0 top-16 flex flex-col justify-between"
            style={{ height: chartHeight, width: yAxisWidth }}
          >
            {[...yAxisScale].reverse().map((scaleValue, index) => (
              <div key={index} className="flex items-center w-full">
                <span
                  className="text-xs text-gray-400 font-mono text-right pr-3"
                  style={{ width: yAxisWidth - 12 }}
                >
                  {scaleValue}
                </span>
                <div className="w-3 h-px bg-gray-600"></div>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div
            className="absolute top-16"
            style={{ left: yAxisWidth, width: chartWidth, height: chartHeight }}
          >
            {yAxisScale.map((_, index) => (
              <div
                key={index}
                className="absolute w-full border-t border-gray-800/30"
                style={{
                  bottom: `${(index / (yAxisScale.length - 1)) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Chart area */}
          <div
            className="absolute top-16 flex items-end justify-start space-x-3 px-4"
            style={{ left: yAxisWidth, width: chartWidth, height: chartHeight }}
          >
            {safeData.x_axis_data.map((label, index) => {
              const value = safeData.y_axis_data[index] || 0;
              const height = (value / maxValue) * (chartHeight - 8);
              const percentage = ((value / total) * 100).toFixed(1);
              const color = colors[index % colors.length];

              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {/* Percentage label on top */}
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{
                      opacity: animationComplete ? 1 : 0,
                      y: animationComplete ? -8 : -5,
                    }}
                    transition={{ delay: index * 0.2 + 1, duration: 0.5 }}
                    className="absolute bottom-full mb-1 text-xs font-semibold text-white bg-gray-800/90 px-2 py-1 rounded-md whitespace-nowrap shadow-lg"
                    style={{ color: color }}
                  >
                    {percentage}%
                  </motion.div>

                  {/* Bar */}
                  <div className="relative group">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: animationComplete ? height : 0,
                        opacity: animationComplete ? 1 : 0,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 80,
                      }}
                      className="rounded-t-lg cursor-pointer chart-data-point relative overflow-hidden"
                      style={{
                        width: `${barWidth}px`,
                        background: `linear-gradient(180deg, ${color}, ${color}80)`,
                        minHeight: "8px",
                      }}
                      whileHover={{
                        scale: 1.05,
                      }}
                      onMouseEnter={(e) =>
                        showTooltip(
                          e,
                          label,
                          value,
                          color,
                          `${percentage}% of total`
                        )
                      }
                      onMouseLeave={hideTooltip}
                    >
                      {/* Animated shimmer effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(180deg, transparent, ${color}40, transparent)`,
                          animation: "pulse 2s ease-in-out infinite",
                        }}
                      />

                      {/* Glow border */}
                      <div
                        className="absolute inset-0 rounded-t-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ borderColor: color }}
                      />
                    </motion.div>
                  </div>

                  {/* X-axis label */}
                  <div
                    className="text-xs text-gray-300 text-center truncate font-medium mt-3"
                    style={{ width: `${barWidth}px` }}
                  >
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to generate Y-axis scale with clean formatting
  const generateYAxisScale = (maxValue: number): (number | string)[] => {
    if (maxValue === 0) return ["0"];

    // Determine the appropriate scale and step size
    let stepSize: number;
    let steps = 5;

    if (maxValue >= 1000000) {
      // For millions, use clean million steps
      const maxInMillions = maxValue / 1000000;
      stepSize = Math.ceil(maxInMillions / steps) * 1000000;
    } else if (maxValue >= 1000) {
      // For thousands, use clean thousand steps
      const maxInThousands = maxValue / 1000;
      stepSize = Math.ceil(maxInThousands / steps) * 1000;
    } else {
      // For smaller numbers, use clean whole number steps
      stepSize = Math.ceil(maxValue / steps);
    }

    const scale = [];
    for (let i = 0; i <= steps; i++) {
      const value = i * stepSize;
      if (value === 0) {
        scale.push("0");
      } else if (value >= 1000000) {
        const millions = value / 1000000;
        scale.push(
          millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`
        );
      } else if (value >= 1000) {
        const thousands = value / 1000;
        scale.push(
          thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`
        );
      } else {
        scale.push(value.toString());
      }
    }

    return scale;
  };

  const renderPieChart = () => {
    const total = safeData.y_axis_data.reduce((sum, val) => sum + val, 0) || 1;
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative">
          <svg width="240" height="240" className="transform -rotate-90">
            <defs>
              {colors.map((color, index) => (
                <filter key={index} id={`glow-${index}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {safeData.y_axis_data.map((value, index) => {
              const angle = (value / total) * 360;
              const color = colors[index % colors.length];

              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const startX = 120 + 90 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 120 + 90 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 120 + 90 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 120 + 90 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              return (
                <motion.path
                  key={index}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: animationComplete ? 1 : 0,
                    opacity: animationComplete ? 1 : 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.3,
                    type: "spring",
                    stiffness: 100,
                  }}
                  d={`M 120 120 L ${startX} ${startY} A 90 90 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={color}
                  stroke="rgba(0, 0, 0, 0.8)"
                  strokeWidth="3"
                  filter={`url(#glow-${index})`}
                  className="cursor-pointer chart-data-point transition-all duration-300"
                  style={{}}
                  whileHover={{
                    scale: 1.05,
                  }}
                  onMouseEnter={(e) => {
                    showTooltip(
                      e,
                      data.x_axis_data[index],
                      value,
                      color,
                      `Segment ${index + 1} of ${data.x_axis_data.length}`
                    );
                  }}
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </svg>
        </div>

        {/* Compact Legend */}
        <div className="flex flex-col space-y-2">
          {data.x_axis_data.map((label, index) => {
            const value = data.y_axis_data[index];
            const percentage = ((value / total) * 100).toFixed(1);
            const color = colors[index % colors.length];

            return (
              <motion.div
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 1 }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <div className="text-xs">
                  <div className="text-gray-200 font-medium">{label}</div>
                  <div className="text-gray-400 text-xs">{percentage}%</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...safeData.y_axis_data) || 1;
    const minValue = Math.min(...safeData.y_axis_data) || 0;
    const range = maxValue - minValue || 1;
    const dataLength = safeData.y_axis_data.length;

    const points = safeData.y_axis_data
      .map((value, index) => {
        const x = dataLength > 1 ? (index / (dataLength - 1)) * 340 : 170;
        const y = 160 - ((value - minValue) / range) * 130;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="flex flex-col items-center">
        <svg width="380" height="200" className="mb-6">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1] || colors[0]} />
              <stop offset="100%" stopColor={colors[2] || colors[0]} />
            </linearGradient>

            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0.05" />
            </linearGradient>

            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="20"
              y1={30 + i * 26}
              x2="360"
              y2={30 + i * 26}
              className="chart-grid"
            />
          ))}

          {/* Vertical grid lines */}
          {safeData.x_axis_data.map((_, index) => {
            const x =
              dataLength > 1 ? 20 + (index / (dataLength - 1)) * 340 : 190;
            return (
              <line
                key={index}
                x1={x}
                y1="30"
                x2={x}
                y2="186"
                className="chart-grid"
              />
            );
          })}

          {/* Area fill */}
          <motion.polygon
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: animationComplete ? 1 : 0,
              opacity: animationComplete ? 1 : 0,
            }}
            transition={{ duration: 2.5, delay: 0.5 }}
            points={`20,186 ${points} ${dataLength > 1 ? "360" : "170"},186`}
            fill="url(#areaGradient)"
          />

          {/* Main line */}
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: animationComplete ? 1 : 0,
              opacity: animationComplete ? 1 : 0,
            }}
            transition={{ duration: 2, delay: 1 }}
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#lineGlow)"
            style={{}}
          />

          {/* Data points */}
          {safeData.y_axis_data.map((value, index) => {
            const dataLength = safeData.y_axis_data.length;
            const x =
              dataLength > 1 ? 20 + (index / (dataLength - 1)) * 340 : 190;
            const y = 160 - ((value - minValue) / range) * 130;

            const safeX = isNaN(x) ? 190 : x;
            const safeY = isNaN(y) ? 95 : y;

            return (
              <motion.g key={index}>
                {/* Glow ring */}
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: animationComplete ? 1 : 0,
                    opacity: animationComplete ? 0.6 : 0,
                  }}
                  transition={{ duration: 0.8, delay: 1.5 + index * 0.2 }}
                  cx={safeX}
                  cy={safeY}
                  r="12"
                  fill="none"
                  stroke={colors[0]}
                  strokeWidth="2"
                  opacity="0.4"
                />

                {/* Main point */}
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: animationComplete ? 1 : 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.5 + index * 0.2,
                    type: "spring",
                    stiffness: 300,
                  }}
                  cx={safeX}
                  cy={safeY}
                  r="6"
                  fill={colors[0]}
                  stroke="rgba(0, 0, 0, 0.8)"
                  strokeWidth="3"
                  className="cursor-pointer chart-data-point"
                  style={{}}
                  whileHover={{
                    scale: 1.5,
                  }}
                  onMouseEnter={(e) => {
                    showTooltip(
                      e,
                      safeData.x_axis_data[index],
                      value,
                      colors[0],
                      `Data point ${index + 1}`
                    );
                  }}
                  onMouseLeave={hideTooltip}
                />
              </motion.g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between w-96 text-sm text-gray-300 font-medium">
          {data.x_axis_data.map((label, index) => (
            <span key={index} className="text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const maxValue = Math.max(...safeData.y_axis_data) || 1;
    const minValue = Math.min(...safeData.y_axis_data) || 0;
    const range = maxValue - minValue || 1;
    const dataLength = safeData.y_axis_data.length;

    const points = safeData.y_axis_data
      .map((value, index) => {
        const x = dataLength > 1 ? 20 + (index / (dataLength - 1)) * 340 : 190;
        const y = 160 - ((value - minValue) / range) * 130;
        return `${x},${y}`;
      })
      .join(" ");

    const areaPoints = `20,186 ${points} ${dataLength > 1 ? "360" : "190"},186`;

    return (
      <div className="flex flex-col items-center">
        <svg width="380" height="200" className="mb-6">
          <defs>
            <linearGradient
              id="areaGradientFill"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
              <stop
                offset="50%"
                stopColor={colors[1] || colors[0]}
                stopOpacity="0.3"
              />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0.05" />
            </linearGradient>

            <linearGradient
              id="areaLineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1] || colors[0]} />
              <stop offset="100%" stopColor={colors[2] || colors[0]} />
            </linearGradient>

            <filter id="areaGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="20"
              y1={30 + i * 26}
              x2="360"
              y2={30 + i * 26}
              className="chart-grid"
            />
          ))}

          {/* Area fill with animation */}
          <motion.polygon
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: animationComplete ? 1 : 0,
              opacity: animationComplete ? 1 : 0,
            }}
            transition={{ duration: 2.5, delay: 0.5 }}
            points={areaPoints}
            fill="url(#areaGradientFill)"
            filter="url(#areaGlow)"
          />

          {/* Top line with glow */}
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: animationComplete ? 1 : 0,
              opacity: animationComplete ? 1 : 0,
            }}
            transition={{ duration: 2, delay: 1 }}
            points={points}
            fill="none"
            stroke="url(#areaLineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 10px ${colors[0]}60)`,
            }}
          />

          {/* Interactive data points */}
          {safeData.y_axis_data.map((value, index) => {
            const dataLength = safeData.y_axis_data.length;
            const x =
              dataLength > 1 ? 20 + (index / (dataLength - 1)) * 340 : 190;
            const y = 160 - ((value - minValue) / range) * 130;

            const safeX = isNaN(x) ? 190 : x;
            const safeY = isNaN(y) ? 95 : y;

            return (
              <motion.circle
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: animationComplete ? 1 : 0,
                  opacity: animationComplete ? 1 : 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 1.5 + index * 0.15,
                  type: "spring",
                  stiffness: 300,
                }}
                cx={safeX}
                cy={safeY}
                r="5"
                fill={colors[0]}
                stroke="rgba(0, 0, 0, 0.8)"
                strokeWidth="2"
                className="cursor-pointer chart-data-point"
                style={{}}
                whileHover={{
                  scale: 1.4,
                }}
                onMouseEnter={(e) => {
                  showTooltip(
                    e,
                    safeData.x_axis_data[index],
                    value,
                    colors[0],
                    `Area point ${index + 1}`
                  );
                }}
                onMouseLeave={hideTooltip}
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between w-96 text-sm text-gray-300 font-medium">
          {data.x_axis_data.map((label, index) => (
            <span key={index} className="text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Smart label distribution algorithm
  const calculateLabelDistribution = (totalSegments: number) => {
    if (totalSegments <= 2) {
      return { left: 1, right: totalSegments - 1, top: 0, bottom: 0 };
    }
    if (totalSegments <= 4) {
      return {
        left: Math.floor(totalSegments / 2),
        right: Math.floor(totalSegments / 2),
        top: totalSegments % 2,
        bottom: 0,
      };
    }

    // For n > 4: Use 60-40 split (sides vs top/bottom)
    const sideTotal = Math.ceil(totalSegments * 0.6);
    const verticalTotal = totalSegments - sideTotal;

    // Distribute sides (left gets priority on odd)
    const left = Math.ceil(sideTotal / 2);
    const right = Math.floor(sideTotal / 2);

    // Distribute verticals (top gets priority on odd)
    const top = Math.ceil(verticalTotal / 2);
    const bottom = Math.floor(verticalTotal / 2);

    return { left, right, top, bottom };
  };

  const renderModernPieChart = () => {
    const total = safeData.y_axis_data.reduce((sum, val) => sum + val, 0) || 1;
    const radius = 100;
    const innerRadius = 50;
    const centerX = 350;
    const centerY = 225;
    const labelHeight = 50; // Height of each label
    const minSpacing = 55; // Minimum spacing between labels

    // First pass: Calculate initial positions for all labels
    let currentAngle = 0;
    const labelPositions = safeData.y_axis_data.map((value, index) => {
      const angle = (value / total) * 360;
      const color = colors[index % colors.length];

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      currentAngle += angle;

      // Initial connector calculation
      const connectorStartX =
        centerX + (radius + 15) * Math.cos((midAngle * Math.PI) / 180);
      const connectorStartY =
        centerY + (radius + 15) * Math.sin((midAngle * Math.PI) / 180);

      const extendedRadius = 120;
      const connectorMidX =
        centerX + extendedRadius * Math.cos((midAngle * Math.PI) / 180);
      const connectorMidY =
        centerY + extendedRadius * Math.sin((midAngle * Math.PI) / 180);

      const isRightSide = connectorMidX > centerX;

      return {
        index,
        value,
        angle,
        color,
        startAngle,
        endAngle,
        midAngle,
        connectorStartX,
        connectorStartY,
        connectorMidY,
        isRightSide,
        extendedRadius, // Will be adjusted for collision
        percentage: ((value / total) * 100).toFixed(0),
      };
    });

    // Second pass: Detect and resolve collisions
    const leftLabels = labelPositions
      .filter((pos) => !pos.isRightSide)
      .sort((a, b) => a.connectorMidY - b.connectorMidY);
    const rightLabels = labelPositions
      .filter((pos) => pos.isRightSide)
      .sort((a, b) => a.connectorMidY - b.connectorMidY);

    // Adjust positions to prevent overlaps
    const adjustForCollisions = (labels: typeof labelPositions) => {
      for (let i = 0; i < labels.length - 1; i++) {
        const currentLabel = labels[i];
        const nextLabel = labels[i + 1];

        // Calculate current Y positions
        const currentY =
          centerY +
          currentLabel.extendedRadius *
            Math.sin((currentLabel.midAngle * Math.PI) / 180);
        const nextY =
          centerY +
          nextLabel.extendedRadius *
            Math.sin((nextLabel.midAngle * Math.PI) / 180);

        const distance = Math.abs(nextY - currentY);

        // If labels are too close, extend the radius of the lower one
        if (distance < minSpacing) {
          const neededDistance = minSpacing - distance;
          // Extend the radius to push the label further out
          nextLabel.extendedRadius +=
            neededDistance /
            Math.abs(Math.sin((nextLabel.midAngle * Math.PI) / 180));
        }
      }
    };

    adjustForCollisions(leftLabels);
    adjustForCollisions(rightLabels);

    return (
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: "700px", height: "450px" }}>
          <svg
            width="700"
            height="450"
            className="absolute"
            style={{ left: "0px", top: "0px" }}
          >
            <defs>
              {colors.map((color, index) => (
                <filter key={index} id={`modern-glow-${index}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {/* Pie slices and integrated connectors with labels */}
            {labelPositions.map((labelData) => {
              const {
                index,
                value,
                angle,
                color,
                startAngle,
                endAngle,
                midAngle,
                connectorStartX,
                connectorStartY,
                isRightSide,
                extendedRadius,
                percentage,
              } = labelData;
              // Slice path
              const startX1 =
                centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const startY1 =
                centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const endX1 =
                centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const endY1 =
                centerY + radius * Math.sin((endAngle * Math.PI) / 180);

              const startX2 =
                centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const startY2 =
                centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
              const endX2 =
                centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const endY2 =
                centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              // Connector with adjusted radius (for collision avoidance)
              const connectorMidX =
                centerX + extendedRadius * Math.cos((midAngle * Math.PI) / 180);
              const connectorMidY =
                centerY + extendedRadius * Math.sin((midAngle * Math.PI) / 180);

              // Horizontal line extension (L-shape)
              const connectorEndX = connectorMidX + (isRightSide ? 80 : -80);
              const connectorEndY = connectorMidY;

              return (
                <g key={index}>
                  {/* Pie slice */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: animationComplete ? 1 : 0,
                      opacity: animationComplete ? 1 : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100,
                    }}
                    d={`M ${startX1} ${startY1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX1} ${endY1} L ${endX2} ${endY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX2} ${startY2} Z`}
                    fill={color}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    filter={`url(#modern-glow-${index})`}
                    className="cursor-pointer chart-data-point transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={(e) =>
                      showTooltip(
                        e,
                        safeData.x_axis_data[index],
                        value,
                        color,
                        `${percentage}% of total`
                      )
                    }
                    onMouseLeave={hideTooltip}
                  />

                  {/* L-shaped connector line */}
                  <motion.g
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: animationComplete ? 1 : 0,
                      opacity: animationComplete ? 0.8 : 0,
                    }}
                    transition={{ delay: index * 0.2 + 1, duration: 0.8 }}
                  >
                    {/* First line: from slice to bend point */}
                    <line
                      x1={connectorStartX}
                      y1={connectorStartY}
                      x2={connectorMidX}
                      y2={connectorMidY}
                      stroke={color}
                      strokeWidth="2"
                    />

                    {/* Second line: horizontal from bend point */}
                    <line
                      x1={connectorMidX}
                      y1={connectorMidY}
                      x2={connectorEndX}
                      y2={connectorEndY}
                      stroke={color}
                      strokeWidth="2"
                    />
                  </motion.g>

                  {/* Connector dot at end */}
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: animationComplete ? 1 : 0,
                      opacity: animationComplete ? 1 : 0,
                    }}
                    transition={{ delay: index * 0.2 + 1.2, duration: 0.4 }}
                    cx={connectorEndX}
                    cy={connectorEndY}
                    r="3"
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                  />

                  {/* Percentage label on slice */}
                  <motion.text
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: animationComplete ? 1 : 0,
                      scale: animationComplete ? 1 : 0.8,
                    }}
                    transition={{ delay: index * 0.2 + 0.8, duration: 0.6 }}
                    x={
                      centerX +
                      (radius - 25) * Math.cos((midAngle * Math.PI) / 180)
                    }
                    y={
                      centerY +
                      (radius - 25) * Math.sin((midAngle * Math.PI) / 180)
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-white font-bold text-sm"
                    fill="white"
                    style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
                  >
                    {percentage}%
                  </motion.text>

                  {/* Integrated label at connector end */}
                  <motion.g
                    initial={{ opacity: 0, x: isRightSide ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 1.8, duration: 0.6 }}
                  >
                    <foreignObject
                      x={isRightSide ? connectorEndX + 8 : connectorEndX - 168}
                      y={connectorEndY - 25}
                      width="160"
                      height="50"
                    >
                      <div
                        className={`${
                          !isRightSide ? "text-right" : "text-left"
                        }`}
                      >
                        {/* Title line */}
                        <div
                          className={`flex items-center ${
                            !isRightSide ? "justify-end" : "justify-start"
                          }`}
                          style={{ marginBottom: "-6px" }}
                        >
                          <span
                            className="text-lg font-bold mr-2"
                            style={{ color: color }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-gray-200 font-semibold text-sm uppercase tracking-wide">
                            {safeData.x_axis_data[index]}
                          </span>
                        </div>

                        {/* Description */}
                        <div
                          className={`text-xs text-gray-400 leading-tight mt-0.5 ${
                            !isRightSide ? "text-right" : "text-left"
                          }`}
                          style={{ marginTop: "-3px" }}
                        >
                          {safeData.tooltip_data?.[safeData.x_axis_data[index]]
                            ?.info ||
                            `${
                              value >= 1000000
                                ? `${(value / 1000000).toFixed(1)}M`
                                : value >= 1000
                                ? `${(value / 1000).toFixed(1)}K`
                                : value.toLocaleString()
                            } items`}
                        </div>

                        {/* Percentage highlight */}
                        <div
                          className={`text-xs font-semibold mt-0.5 ${
                            !isRightSide ? "text-right" : "text-left"
                          }`}
                          style={{ color: color, marginTop: "-3px" }}
                        >
                          {percentage}% of total
                        </div>
                      </div>
                    </foreignObject>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderDonutChart = () => {
    const total = data.y_axis_data.reduce((sum, val) => sum + val, 0);
    let currentAngle = 0;
    const radius = 95;
    const innerRadius = 60;

    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative">
          <svg width="240" height="240" className="transform -rotate-90">
            <defs>
              {colors.map((color, index) => (
                <filter key={index} id={`donut-glow-${index}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0, 212, 255, 0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Center glow */}
            <circle cx="120" cy="120" r={innerRadius} fill="url(#centerGlow)" />

            {data.y_axis_data.map((value, index) => {
              const angle = (value / total) * 360;
              const color = colors[index % colors.length];

              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const startX1 =
                120 + radius * Math.cos((startAngle * Math.PI) / 180);
              const startY1 =
                120 + radius * Math.sin((startAngle * Math.PI) / 180);
              const endX1 = 120 + radius * Math.cos((endAngle * Math.PI) / 180);
              const endY1 = 120 + radius * Math.sin((endAngle * Math.PI) / 180);

              const startX2 =
                120 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const startY2 =
                120 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
              const endX2 =
                120 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const endY2 =
                120 + innerRadius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              return (
                <motion.path
                  key={index}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: animationComplete ? 1 : 0,
                    opacity: animationComplete ? 1 : 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.3,
                    type: "spring",
                    stiffness: 100,
                  }}
                  d={`M ${startX1} ${startY1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX1} ${endY1} L ${endX2} ${endY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX2} ${startY2} Z`}
                  fill={color}
                  stroke="rgba(0, 0, 0, 0.8)"
                  strokeWidth="3"
                  filter={`url(#donut-glow-${index})`}
                  className="cursor-pointer chart-data-point transition-all duration-300"
                  style={{}}
                  whileHover={{
                    scale: 1.05,
                  }}
                  onMouseEnter={(e) => {
                    showTooltip(
                      e,
                      data.x_axis_data[index],
                      value,
                      color,
                      `Donut segment ${index + 1}`
                    );
                  }}
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </svg>

          {/* Enhanced center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <div className="text-3xl font-bold text-white">
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 font-medium">Total</div>
            </motion.div>
          </div>
        </div>

        {/* Compact Legend */}
        <div className="flex flex-col space-y-2">
          {data.x_axis_data.map((label, index) => {
            const value = data.y_axis_data[index];
            const percentage = ((value / total) * 100).toFixed(1);
            const color = colors[index % colors.length];

            return (
              <motion.div
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 1.5 }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <div className="text-xs">
                  <div className="text-gray-200 font-medium">{label}</div>
                  <div className="text-gray-400 text-xs">
                    {percentage}% • {value.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const getGraphIcon = () => {
    switch (data.graph) {
      case "HBC":
        return <BarChart3 className="w-5 h-5" />;
      case "VBC":
        return <BarChart3 className="w-5 h-5 transform rotate-90" />;
      case "PG":
        return <PieChart className="w-5 h-5" />;
      case "MPG":
        return <PieChart className="w-5 h-5 transform rotate-45" />;
      case "LC":
        return <TrendingUp className="w-5 h-5" />;
      case "AC":
        return <Activity className="w-5 h-5" />;
      case "DG":
        return <PieChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const renderGraph = () => {
    switch (data.graph) {
      case "HBC":
        return renderHorizontalBarChart();
      case "VBC":
        return renderVerticalBarChart();
      case "PG":
        return renderPieChart();
      case "MPG":
        return renderModernPieChart();
      case "LC":
        return renderLineChart();
      case "AC":
        return renderAreaChart();
      case "DG":
        return renderDonutChart();
      default:
        return renderVerticalBarChart();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        scale: scaleTransform,
        opacity: opacity,
      }}
      className={`relative overflow-hidden rounded-2xl ${
        isCompact
          ? "p-6 cursor-pointer bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50"
          : "p-8 bg-gradient-to-br from-gray-900/80 to-black/50 backdrop-blur-sm border border-gray-700/30"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={
        !isCompact
          ? {
              borderColor: "rgba(139, 92, 246, 0.5)",
            }
          : undefined
      }
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          isCompact ? "mb-6" : "mb-8"
        }`}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            className={`${
              isCompact ? "p-3" : "p-4"
            } bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl`}
            whileHover={{ scale: 1.05, rotate: 2 }}
            style={{}}
          >
            <div className="text-white">{getGraphIcon()}</div>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3
              className={`${
                isCompact ? "text-lg" : "text-2xl"
              } font-bold text-white mb-1`}
            >
              {data.title}
            </h3>
            {data.subtitle && !isCompact && (
              <p className="text-sm text-gray-300 font-medium">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {isCompact && onClick && (
            <div className="text-sm text-purple-400 hover:text-purple-300 font-medium px-3 py-1 rounded-lg bg-purple-500/10">
              Click to expand
            </div>
          )}

          {!isCompact && onExpand && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="p-3 text-gray-400 hover:text-purple-400 transition-all duration-300 rounded-xl hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Maximize2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Graph */}
      <div className={`flex justify-center ${isCompact ? "mb-3" : "mb-6"}`}>
        <div
          className={
            isCompact ? "transform scale-75 origin-center overflow-hidden" : ""
          }
        >
          {renderGraph()}
        </div>
      </div>

      {/* Enhanced text content */}
      {data.text && !isCompact && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-purple-400">
              Analysis & Insights
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{data.text}</p>
        </motion.div>
      )}

      {/* Enhanced Glass Morphism Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl w-80"
          >
            {/* Tooltip Arrow */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-4 p-5 pb-0">
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-700"
                style={{
                  backgroundColor: tooltip.content.color,
                }}
              />
              <span className="text-lg font-semibold text-white">
                {tooltip.content.label}
              </span>
            </div>

            <div className="p-5 pt-0 space-y-4">
              {/* Main value */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-medium">
                  {safeData.value_label || "Value"}
                </span>
                <span className="text-xl font-bold text-white">
                  {tooltip.content.value.toLocaleString()}
                </span>
              </div>

              {/* Percentage with modern styling */}
              {tooltip.content.percentage !== undefined && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-medium">
                      Share
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: tooltip.content.color }}
                    >
                      {tooltip.content.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Modern progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tooltip.content.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-3 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${tooltip.content.color}60, ${tooltip.content.color})`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Additional info */}
              {tooltip.content.additionalInfo && (
                <div className="pt-4 border-t border-gray-700/50">
                  <span className="text-sm text-gray-300">
                    {tooltip.content.additionalInfo}
                  </span>
                </div>
              )}

              {/* Enhanced metrics */}
              {data.tooltip_data?.[tooltip.content.label]
                ?.additionalMetrics && (
                <div className="pt-4 border-t border-gray-700/50 space-y-3">
                  {Object.entries(
                    data.tooltip_data[tooltip.content.label]
                      .additionalMetrics || {}
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-400 capitalize font-medium">
                        {key}
                      </span>
                      <span className="text-sm font-semibold text-gray-200">
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
