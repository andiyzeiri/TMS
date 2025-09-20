"use client";

import * as React from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BaseWidgetCard } from "../base-widget-card";
import { RevenueData, DashboardFilters } from "@/types/dashboard";

interface RevenueCardProps {
  data?: RevenueData;
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

// Mock trend data for the mini chart - in a real app, this would come from the API
const generateTrendData = (currentValue: number) => {
  const baseValue = currentValue * 0.8;
  const trend = [];

  for (let i = 0; i < 7; i++) {
    const variance = Math.random() * 0.3 - 0.15; // ±15% variance
    const value = baseValue + (baseValue * variance) + (baseValue * 0.2 * (i / 6)); // slight upward trend
    trend.push({
      day: i + 1,
      value: Math.round(value),
    });
  }

  return trend;
};

export function RevenueCard({
  data,
  isLoading,
  error,
  filters,
}: RevenueCardProps) {
  if (!data && !isLoading) {
    return null;
  }

  // Calculate trend based on period vs previous period (mock calculation)
  const trendValue = data ? ((data.period / (data.qtd * 0.3)) - 1) * 100 : 0;
  const trendData = data ? generateTrendData(data.period) : [];

  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const miniChart = data && (
    <div className="h-[60px] mt-2" role="img" aria-label="Revenue trend over last 7 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: any) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(day) => `Day ${day}`}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <BaseWidgetCard
      title="Revenue"
      value={data ? formatCurrency(data.period) : '$0'}
      subtitle={data ? `${data.period_range.from} to ${data.period_range.to}` : undefined}
      trend={data ? {
        value: Math.abs(trendValue),
        isPositive: trendValue >= 0,
        label: "vs prev period",
      } : undefined}
      chart={miniChart}
      isLoading={isLoading}
      error={error}
      aria-label={data ? `Revenue: ${formatCurrency(data.period)} for period ${data.period_range.from} to ${data.period_range.to}` : "Revenue data"}
    />
  );
}

// Extended revenue breakdown component
export function RevenueBreakdown({
  data,
  className,
}: {
  data?: RevenueData;
  className?: string;
}) {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    { label: "Month to Date", value: data.mtd, color: "text-blue-600" },
    { label: "Quarter to Date", value: data.qtd, color: "text-green-600" },
    { label: "Year to Date", value: data.ytd, color: "text-purple-600" },
  ];

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-3">Revenue Breakdown</h4>
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <span className={`text-sm font-medium ${metric.color}`}>
              {formatCurrency(metric.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}