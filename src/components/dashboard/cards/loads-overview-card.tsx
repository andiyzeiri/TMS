"use client";

import * as React from "react";
import { BaseWidgetCard } from "../base-widget-card";
import { LoadsOverviewData, DashboardFilters } from "@/types/dashboard";
import { getDateRangeFromFilter } from "@/hooks/use-dashboard";

interface LoadsOverviewCardProps {
  data?: LoadsOverviewData;
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

export function LoadsOverviewCard({
  data,
  isLoading,
  error,
  filters,
}: LoadsOverviewCardProps) {
  if (!data && !isLoading) {
    return null;
  }

  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  // Generate link to filtered loads page
  const getStatusLink = (status: string) => {
    const params = new URLSearchParams();
    params.set("status", status.toUpperCase());
    params.set("from", dateRange.from);
    params.set("to", dateRange.to);
    if (filters.customerId) {
      params.set("customer_id", filters.customerId);
    }
    return `/loads?${params.toString()}`;
  };

  // Calculate percentage of delivered loads
  const deliveredPercentage = data?.total_loads
    ? ((data.delivered_today / data.total_loads) * 100)
    : 0;

  return (
    <BaseWidgetCard
      title="Loads Overview"
      value={data?.total_loads || 0}
      subtitle={`${data?.delivered_today || 0} delivered today`}
      trend={{
        value: deliveredPercentage,
        isPositive: deliveredPercentage > 50,
        label: "delivered",
      }}
      link={{
        href: getStatusLink("all"),
        label: "View all loads",
      }}
      isLoading={isLoading}
      error={error}
      aria-label={`Total loads: ${data?.total_loads || 0}, with ${data?.delivered_today || 0} delivered today`}
    />
  );
}

// Status breakdown component for detailed view
export function LoadsStatusBreakdown({
  data,
  filters,
  className,
}: {
  data?: LoadsOverviewData;
  filters: DashboardFilters;
  className?: string;
}) {
  if (!data) return null;

  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  const statusDisplayMap = {
    draft: "Draft",
    dispatched: "Dispatched",
    assigned: "Assigned",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusColorMap = {
    draft: "bg-gray-100 text-gray-800",
    dispatched: "bg-blue-100 text-blue-800",
    assigned: "bg-yellow-100 text-yellow-800",
    picked_up: "bg-orange-100 text-orange-800",
    in_transit: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const getStatusLink = (status: string) => {
    const params = new URLSearchParams();
    params.set("status", status.toUpperCase());
    params.set("from", dateRange.from);
    params.set("to", dateRange.to);
    if (filters.customerId) {
      params.set("customer_id", filters.customerId);
    }
    return `/loads?${params.toString()}`;
  };

  return (
    <div className={className}>
      <h4 className="text-sm font-medium mb-3">Status Breakdown</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data.status_counts).map(([status, count]) => (
          <a
            key={status}
            href={getStatusLink(status)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label={`${count} loads with status ${statusDisplayMap[status as keyof typeof statusDisplayMap]}`}
          >
            <span className="text-sm text-gray-600">
              {statusDisplayMap[status as keyof typeof statusDisplayMap]}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColorMap[status as keyof typeof statusColorMap]
              }`}
            >
              {count}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}