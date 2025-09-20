"use client";

import * as React from "react";
import { DashboardFilters, DashboardStats, WIDGET_CONFIGS } from "@/types/dashboard";
import { LoadsOverviewCard } from "./cards/loads-overview-card";
import { RevenueCard } from "./cards/revenue-card";
import { OnTimeCard } from "./cards/ontime-card";
import { AccountsReceivableCard } from "./cards/accounts-receivable-card";
import { AtRiskCard } from "./cards/at-risk-card";

// Placeholder cards for other widgets
const PlaceholderCard = ({
  title,
  isLoading,
  error
}: {
  title: string;
  isLoading?: boolean;
  error?: string;
}) => (
  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    {isLoading ? (
      <p className="text-xs text-gray-500">Loading...</p>
    ) : error ? (
      <p className="text-xs text-red-500">Error: {error}</p>
    ) : (
      <p className="text-xs text-gray-500">Widget coming soon</p>
    )}
  </div>
);

interface WidgetFactoryProps {
  widgetKey: string;
  data?: DashboardStats["data"];
  isLoading?: boolean;
  error?: string;
  filters: DashboardFilters;
}

export function WidgetFactory({
  widgetKey,
  data,
  isLoading,
  error,
  filters,
}: WidgetFactoryProps) {
  const config = WIDGET_CONFIGS[widgetKey];

  if (!config) {
    return (
      <PlaceholderCard
        title={`Unknown Widget: ${widgetKey}`}
        error="Widget configuration not found"
      />
    );
  }

  const widgetData = data?.[widgetKey as keyof typeof data];
  const widgetError = error || widgetData?.error || undefined;
  const actualData = widgetData?.data;

  switch (widgetKey) {
    case "loads_overview":
      return (
        <LoadsOverviewCard
          data={actualData}
          isLoading={isLoading}
          error={widgetError}
          filters={filters}
        />
      );

    case "revenue":
      return (
        <RevenueCard
          data={actualData}
          isLoading={isLoading}
          error={widgetError}
          filters={filters}
        />
      );

    case "ontime":
      return (
        <OnTimeCard
          data={actualData}
          isLoading={isLoading}
          error={widgetError}
          filters={filters}
        />
      );

    case "ar":
      return (
        <AccountsReceivableCard
          data={actualData}
          isLoading={isLoading}
          error={widgetError}
          filters={filters}
        />
      );

    case "at_risk":
      return (
        <AtRiskCard
          data={actualData}
          isLoading={isLoading}
          error={widgetError}
          filters={filters}
        />
      );

    case "margin":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "dwell":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "driver_availability":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "equipment_availability":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "miles":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "missing_pod":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "accessorials":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "fuel_index":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    case "ifta_estimate":
      return (
        <PlaceholderCard
          title={config.title}
          isLoading={isLoading}
          error={widgetError}
        />
      );

    default:
      return (
        <PlaceholderCard
          title={config.title}
          error="Widget implementation not found"
        />
      );
  }
}