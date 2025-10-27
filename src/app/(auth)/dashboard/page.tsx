"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RefreshCw, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { WidgetFactory } from "@/components/dashboard/widget-factory";
import { CustomizeDashboardModal } from "@/components/dashboard/customize-dashboard-modal";
import { MainLayout } from "@/components/layout/main-layout";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardFilters, DateRangeFilter } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Hook for URL state management with localStorage fallback
function useDashboardState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Initialize state from URL or localStorage
  const [filters, setFilters] = React.useState<DashboardFilters>(() => {
    const fromUrl = {
      dateRange: (searchParams?.get("range") as DateRangeFilter) || "today",
      customDateRange: searchParams?.get("from") && searchParams?.get("to") ? {
        from: searchParams.get("from")!,
        to: searchParams.get("to")!,
      } : undefined,
      customerId: searchParams?.get("customer_id") || undefined,
    };

    // Fallback to localStorage if no URL params
    if (!searchParams?.get("range") && typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboard-filters");
      if (stored) {
        try {
          return { ...JSON.parse(stored), ...fromUrl };
        } catch {
          // Ignore localStorage errors
        }
      }
    }

    return fromUrl;
  });

  // Update URL and localStorage when filters change
  const updateFilters = React.useCallback((newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams();
    params.set("range", updatedFilters.dateRange);

    if (updatedFilters.dateRange === "custom" && updatedFilters.customDateRange) {
      params.set("from", updatedFilters.customDateRange.from);
      params.set("to", updatedFilters.customDateRange.to);
    }

    if (updatedFilters.customerId) {
      params.set("customer_id", updatedFilters.customerId);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-filters", JSON.stringify(updatedFilters));
    }
  }, [filters, router, pathname]);

  return { filters, updateFilters };
}

export default function DashboardPage() {
  const { filters, updateFilters } = useDashboardState();
  const { layout, stats, isLoading, error, refetch } = useDashboard(filters);
  const { toast } = useToast();

  // Mock customers data - in real app, this would come from API
  const customers = React.useMemo(() => [
    { id: "1", name: "ABC Logistics" },
    { id: "2", name: "XYZ Transport" },
    { id: "3", name: "Global Shipping Co" },
  ], []);

  const handleRefresh = React.useCallback(() => {
    refetch();
    toast({
      title: "Dashboard refreshed",
      description: "Data has been updated with the latest information.",
    });
  }, [refetch, toast]);

  if (error && !isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h2>
              <p className="text-red-600 mb-4">
                {typeof error === 'string' ? error : 'An unexpected error occurred'}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8" role="main" aria-label="Dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your transportation operations and finances
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <CustomizeDashboardModal>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
          </CustomizeDashboardModal>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <DateRangeSelector
            value={{
              range: filters.dateRange,
              customRange: filters.customDateRange,
            }}
            onChange={(value) =>
              updateFilters({
                dateRange: value.range,
                customDateRange: value.customRange,
              })
            }
            className="flex-1"
          />

          <Select
            value={filters.customerId || "all"}
            onValueChange={(value) =>
              updateFilters({
                customerId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[200px]" aria-label="Filter by customer">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && !stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32 mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Widgets */}
        {layout && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="grid"
            aria-label="Dashboard widgets"
          >
            {layout.widgets.map((widgetKey) => (
              <div key={widgetKey} role="gridcell">
                <WidgetFactory
                  widgetKey={widgetKey}
                  data={stats?.data}
                  isLoading={isLoading}
                  error={error as string}
                  filters={filters}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && layout && layout.widgets.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                No Dashboard Widgets Available
              </h2>
              <p className="text-gray-600">
                You don't have access to any dashboard widgets. Please contact your administrator.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Info (Development) */}
      {stats?.meta && process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h3 className="font-medium mb-2">Performance Info (Dev)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Widgets:</span> {stats.meta.widget_count}
            </div>
            <div>
              <span className="font-medium">Execution Time:</span> {stats.meta.total_execution_time_ms}ms
            </div>
            <div>
              <span className="font-medium">Errors:</span> {stats.meta.error_count || 0}
            </div>
            <div>
              <span className="font-medium">Date Range:</span>{" "}
              {stats.meta.date_range.from} to {stats.meta.date_range.to}
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}