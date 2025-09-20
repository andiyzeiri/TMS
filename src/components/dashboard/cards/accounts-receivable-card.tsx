"use client";

import * as React from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BaseWidgetCard } from "../base-widget-card";
import { AccountsReceivableData, DashboardFilters } from "@/types/dashboard";

interface AccountsReceivableCardProps {
  data?: AccountsReceivableData;
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

export function AccountsReceivableCard({
  data,
  isLoading,
  error,
  filters,
}: AccountsReceivableCardProps) {
  if (!data && !isLoading) {
    return null;
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare aging buckets data for chart
  const chartData = data ? [
    {
      name: "0-30",
      value: data.aging_buckets.current_0_30,
      label: "Current (0-30 days)",
      color: "#10b981",
    },
    {
      name: "31-60",
      value: data.aging_buckets.days_31_60,
      label: "31-60 days",
      color: "#f59e0b",
    },
    {
      name: "61-90",
      value: data.aging_buckets.days_61_90,
      label: "61-90 days",
      color: "#ef4444",
    },
    {
      name: "90+",
      value: data.aging_buckets.days_over_90,
      label: "Over 90 days",
      color: "#dc2626",
    },
  ] : [];

  // Calculate DSO trend (mock - would come from API in real app)
  const dsoTrend = data ? data.average_days_outstanding - data.dso_heuristic : 0;

  const miniChart = data && (
    <div className="h-[80px] mt-2" role="img" aria-label="Accounts receivable aging breakdown">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              formatCurrency(value),
              props.payload.label,
            ]}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="value"
            radius={[2, 2, 0, 0]}
            fill={(entry) => entry.color}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <BaseWidgetCard
      title="Accounts Receivable"
      value={data ? formatCurrency(data.open_invoices.amount) : '$0'}
      subtitle={data ? `${data.open_invoices.count} open invoices • ${data.average_days_outstanding.toFixed(0)} days avg` : undefined}
      trend={data ? {
        value: Math.abs(dsoTrend),
        isPositive: dsoTrend <= 0, // Lower DSO is better
        label: "DSO vs target",
      } : undefined}
      chart={miniChart}
      isLoading={isLoading}
      error={error}
      aria-label={data ? `Accounts receivable: ${formatCurrency(data.open_invoices.amount)} in ${data.open_invoices.count} open invoices, ${data.average_days_outstanding.toFixed(0)} days average outstanding` : "Accounts receivable data"}
    />
  );
}

// AR aging breakdown component
export function AccountsReceivableBreakdown({
  data,
  className,
}: {
  data?: AccountsReceivableData;
  className?: string;
}) {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalAmount = data.open_invoices.amount;

  const agingBuckets = [
    {
      label: "Current (0-30 days)",
      amount: data.aging_buckets.current_0_30,
      percentage: (data.aging_buckets.current_0_30 / totalAmount) * 100,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "31-60 days",
      amount: data.aging_buckets.days_31_60,
      percentage: (data.aging_buckets.days_31_60 / totalAmount) * 100,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "61-90 days",
      amount: data.aging_buckets.days_61_90,
      percentage: (data.aging_buckets.days_61_90 / totalAmount) * 100,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Over 90 days",
      amount: data.aging_buckets.days_over_90,
      percentage: (data.aging_buckets.days_over_90 / totalAmount) * 100,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-3">Aging Breakdown</h4>
      <div className="space-y-3">
        {agingBuckets.map((bucket) => (
          <div key={bucket.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{bucket.label}</span>
              <div className="text-right">
                <span className={`text-sm font-medium ${bucket.color}`}>
                  {formatCurrency(bucket.amount)}
                </span>
                <div className="text-xs text-gray-500">
                  {bucket.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${bucket.bgColor.replace('bg-', 'bg-')} h-2 rounded-full`}
                style={{ width: `${bucket.percentage}%` }}
                role="progressbar"
                aria-valuenow={bucket.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${bucket.label}: ${formatCurrency(bucket.amount)} (${bucket.percentage.toFixed(1)}% of total)`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">DSO Target:</span>
          <span className="font-medium">{data.dso_heuristic.toFixed(0)} days</span>
        </div>
      </div>
    </div>
  );
}