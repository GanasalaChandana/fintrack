"use client";
import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface StatCardProps {
  title: string;
  value: string;
  change?: number | null;
  icon: LucideIcon;
  color: string;
  description?: string;
  /** Optional sparkline — array of { v: number } for the last N months */
  sparklineData?: { v: number }[];
  /** Navigate when card is clicked */
  onClick?: () => void;
}

const snapZero = (n: number): number => (Math.abs(n) < 0.05 ? 0 : n);

const SparkTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg pointer-events-none">
      ${Number(payload[0].value).toLocaleString()}
    </div>
  );
};

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  description,
  sparklineData,
  onClick,
}: StatCardProps) {
  const snapped = change != null ? snapZero(change) : null;

  const isPositive = snapped !== null && snapped > 0;
  const isNegative = snapped !== null && snapped < 0;
  const isZero     = snapped !== null && snapped === 0;
  const showBadge  = snapped !== null && !isZero;

  const badgeStyles = isPositive
    ? "bg-green-50 text-green-700 border border-green-200"
    : isNegative
    ? "bg-red-50 text-red-700 border border-red-200"
    : "bg-gray-50 text-gray-500 border border-gray-200";

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const sparkColor = color.includes("green")
    ? "#10b981"
    : color.includes("red")
    ? "#ef4444"
    : color.includes("blue")
    ? "#3b82f6"
    : color.includes("purple")
    ? "#8b5cf6"
    : "#6366f1";

  const hasSparkline = Array.isArray(sparklineData) && sparklineData.length >= 2;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 ${
        onClick
          ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          : "hover:shadow-md"
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {showBadge && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeStyles}`}
          >
            <TrendIcon className="w-3 h-3" />
            {isPositive && "+"}
            {snapped!.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {hasSparkline && (
        <div className="h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Tooltip content={<SparkTooltip />} cursor={false} />
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: sparkColor, stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}