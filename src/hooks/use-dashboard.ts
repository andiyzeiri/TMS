import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import {
  DashboardLayout,
  DashboardLayoutSchema,
  DashboardStats,
  DashboardStatsSchema,
  DateRangeFilter,
  DashboardFilters,
} from "@/types/dashboard";

// Helper function to convert filter to date range
export function getDateRangeFromFilter(filter: DateRangeFilter, customRange?: { from: string; to: string }) {
  const today = new Date();

  switch (filter) {
    case "today":
      return {
        from: format(today, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };

    case "7d":
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      return {
        from: format(sevenDaysAgo, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };

    case "mtd":
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        from: format(firstDayOfMonth, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };

    case "custom":
      return customRange || {
        from: format(today, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };

    default:
      return {
        from: format(today, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      };
  }
}

// Hook to fetch dashboard layout
export function useDashboardLayout() {
  return useQuery({
    queryKey: ["dashboard", "layout"],
    queryFn: async (): Promise<DashboardLayout> => {
      const data = await apiClient.getDashboardLayout();
      console.log('Dashboard layout raw data:', data);
      try {
        const result = DashboardLayoutSchema.parse(data);
        console.log('Dashboard layout validation passed:', result);
        return result;
      } catch (error) {
        console.error('Dashboard layout validation failed:', error);
        console.error('Raw data that failed:', JSON.stringify(data, null, 2));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to fetch dashboard stats
export function useDashboardStats(filters: DashboardFilters, enabled: boolean = true) {
  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  return useQuery({
    queryKey: [
      "dashboard",
      "stats",
      dateRange.from,
      dateRange.to,
      filters.customerId
    ],
    queryFn: async (): Promise<DashboardStats> => {
      const params: any = {
        from_date: dateRange.from,
        to_date: dateRange.to,
      };

      // Add customer filter if specified
      if (filters.customerId) {
        params.customer_id = filters.customerId;
      }

      const data = await apiClient.getDashboardStats(params);
      console.log('Dashboard stats (1) raw data:', data);
      try {
        const result = DashboardStatsSchema.parse(data);
        console.log('Dashboard stats (1) validation passed:', result);
        return result;
      } catch (error) {
        console.error('Dashboard stats (1) validation failed:', error);
        console.error('Raw data that failed:', JSON.stringify(data, null, 2));
        throw error;
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook to fetch dashboard stats with specific widgets only
export function useDashboardStatsWithLayout(
  filters: DashboardFilters,
  allowedWidgets: string[],
  enabled: boolean = true
) {
  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  return useQuery({
    queryKey: [
      "dashboard",
      "stats",
      "filtered",
      dateRange.from,
      dateRange.to,
      filters.customerId,
      allowedWidgets.sort().join(",")
    ],
    queryFn: async (): Promise<DashboardStats> => {
      const params: any = {
        from_date: dateRange.from,
        to_date: dateRange.to,
        include: allowedWidgets.join(","),
      };

      // Add customer filter if specified
      if (filters.customerId) {
        params.customer_id = filters.customerId;
      }

      const data = await apiClient.getDashboardStats(params);
      console.log('Dashboard stats (2) raw data:', data);
      try {
        const result = DashboardStatsSchema.parse(data);
        console.log('Dashboard stats (2) validation passed:', result);
        return result;
      } catch (error) {
        console.error('Dashboard stats (2) validation failed:', error);
        console.error('Raw data that failed:', JSON.stringify(data, null, 2));
        throw error;
      }
    },
    enabled: enabled && allowedWidgets.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook to fetch single widget stats
export function useWidgetStats(
  widgetKey: string,
  filters: DashboardFilters,
  enabled: boolean = true
) {
  const dateRange = getDateRangeFromFilter(filters.dateRange, filters.customDateRange);

  return useQuery({
    queryKey: [
      "dashboard",
      "widget",
      widgetKey,
      dateRange.from,
      dateRange.to,
      filters.customerId
    ],
    queryFn: async () => {
      const params: any = {
        from_date: dateRange.from,
        to_date: dateRange.to,
      };

      // Add customer filter if specified
      if (filters.customerId) {
        params.customer_id = filters.customerId;
      }

      const data = await apiClient.getWidgetStats(widgetKey, params);
      return DashboardStatsSchema.parse(data);
    },
    enabled: enabled && !!widgetKey,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Custom hook that combines layout and stats
export function useDashboard(filters: DashboardFilters) {
  // First fetch the layout to know which widgets user can access
  const {
    data: layout,
    isLoading: layoutLoading,
    error: layoutError,
  } = useDashboardLayout();

  // Then fetch stats for those widgets
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStatsWithLayout(
    filters,
    layout?.widgets || [],
    !!layout?.widgets
  );

  return {
    layout,
    stats,
    isLoading: layoutLoading || statsLoading,
    error: layoutError || statsError,
    refetch: refetchStats,
  };
}