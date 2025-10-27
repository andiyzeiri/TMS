"use client";

import * as React from "react";
import { BaseWidgetCard } from "../base-widget-card";
import { AtRiskData, DashboardFilters } from "@/types/dashboard";
import { getDateRangeFromFilter } from "@/hooks/use-dashboard";

interface AtRiskCardProps {
  data?: AtRiskData;
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

export function AtRiskCard({
  data,
  isLoading,
  error,
  filters,
}: AtRiskCardProps) {
  if (!data && !isLoading) {
    return null;
  }

  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  // Generate link to at-risk loads
  const getAtRiskLink = () => {
    const params = new URLSearchParams();
    params.set("status", "IN_TRANSIT");
    params.set("at_risk", "true");
    params.set("from", dateRange.from);
    params.set("to", dateRange.to);
    if (filters.customerId) {
      params.set("customer_id", filters.customerId);
    }
    return `/loads?${params.toString()}`;
  };

  return (
    <BaseWidgetCard
      title="At-Risk Loads"
      value={data?.total_at_risk || 0}
      subtitle={data?.top_loads.length ? `${data.top_loads.length} loads need attention` : "No loads at risk"}
      trend={data ? {
        value: data.total_at_risk,
        isPositive: false, // At-risk loads are never positive
        label: "loads at risk",
      } : undefined}
      link={{
        href: getAtRiskLink(),
        label: "View at-risk loads",
      }}
      isLoading={isLoading}
      error={error}
      aria-label={`At-risk loads: ${data?.total_at_risk || 0} loads currently at risk of being late`}
    />
  );
}

// At-risk loads list component
export function AtRiskLoadsList({
  data,
  className,
}: {
  data?: AtRiskData;
  className?: string;
}) {
  if (!data || !data.top_loads.length) return null;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDelayColor = (minutes: number) => {
    if (minutes < 60) return "text-yellow-600";
    if (minutes < 240) return "text-orange-600";
    return "text-red-600";
  };

  const formatDelay = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m late`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours}h late`;
  };

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-3">Top At-Risk Loads</h4>
      <div className="space-y-2">
        {data.top_loads.slice(0, 5).map((load) => (
          <div
            key={load.load_id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {load.load_number}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                  {load.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Scheduled: {formatTime(load.scheduled_datetime)}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${getDelayColor(load.eta_slip_minutes)}`}>
                {formatDelay(load.eta_slip_minutes)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.top_loads.length > 5 && (
        <div className="text-center mt-3">
          <span className="text-xs text-gray-500">
            +{data.top_loads.length - 5} more at-risk loads
          </span>
        </div>
      )}
    </div>
  );
}