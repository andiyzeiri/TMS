"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BaseWidgetCard } from "../base-widget-card";
import { OnTimeData, DashboardFilters } from "@/types/dashboard";

interface OnTimeCardProps {
  data?: OnTimeData;
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

const COLORS = {
  onTime: "#10b981",
  late: "#ef4444",
};

export function OnTimeCard({
  data,
  isLoading,
  error,
  filters,
}: OnTimeCardProps) {
  if (!data && !isLoading) {
    return null;
  }

  // Use 30-day performance as the primary metric
  const primaryMetric = data?.p30;
  const performancePercentage = primaryMetric?.percentage || 0;

  // Prepare data for mini pie chart
  const chartData = primaryMetric ? [
    {
      name: "On Time",
      value: primaryMetric.on_time_deliveries,
      percentage: primaryMetric.percentage,
      color: COLORS.onTime,
    },
    {
      name: "Late",
      value: primaryMetric.total_deliveries - primaryMetric.on_time_deliveries,
      percentage: 100 - primaryMetric.percentage,
      color: COLORS.late,
    },
  ] : [];

  const miniChart = data && (
    <div className="h-[80px] mt-2" role="img" aria-label={`On-time performance: ${performancePercentage.toFixed(1)}% of deliveries on time`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={35}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              `${value} deliveries (${props.payload.percentage.toFixed(1)}%)`,
              name,
            ]}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <BaseWidgetCard
      title="On-Time Performance"
      value={`${performancePercentage.toFixed(1)}%`}
      subtitle={primaryMetric ? `${primaryMetric.on_time_deliveries} of ${primaryMetric.total_deliveries} deliveries (30 days)` : undefined}
      trend={data ? {
        value: Math.abs(data.p30.percentage - data.p7.percentage),
        isPositive: data.p30.percentage >= data.p7.percentage,
        label: "vs 7-day avg",
      } : undefined}
      chart={miniChart}
      isLoading={isLoading}
      error={error}
      aria-label={primaryMetric ? `On-time performance: ${performancePercentage.toFixed(1)}%, ${primaryMetric.on_time_deliveries} of ${primaryMetric.total_deliveries} deliveries on time over 30 days` : "On-time performance data"}
    />
  );
}

// Performance breakdown component
export function OnTimeBreakdown({
  data,
  className,
}: {
  data?: OnTimeData;
  className?: string;
}) {
  if (!data) return null;

  const periods = [
    { label: "Last 7 Days", data: data.p7, color: "text-blue-600" },
    { label: "Last 30 Days", data: data.p30, color: "text-green-600" },
  ];

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-3">Performance Breakdown</h4>
      <div className="space-y-4">
        {periods.map((period) => (
          <div key={period.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{period.label}</span>
              <span className={`text-sm font-medium ${period.color}`}>
                {period.data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{period.data.on_time_deliveries} on time</span>
              <span>{period.data.total_deliveries} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${period.data.percentage}%` }}
                role="progressbar"
                aria-valuenow={period.data.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${period.label}: ${period.data.percentage.toFixed(1)}% on-time performance`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}