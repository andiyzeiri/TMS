"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadsFilters, type LoadsFilters as LoadsFiltersType } from "@/components/loads/loads-filters";
import { LoadsTable, type SortField, type SortOrder } from "@/components/loads/loads-table";
import { LoadsPagination, type PaginationInfo } from "@/components/loads/loads-pagination";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

const DEFAULT_PAGE_SIZE = 25;

export default function LoadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<LoadsFiltersType>(() => ({
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    customer: searchParams.get('customer') || undefined,
    pickupDateFrom: searchParams.get('pickupDateFrom') || undefined,
    pickupDateTo: searchParams.get('pickupDateTo') || undefined,
    origin: searchParams.get('origin') || undefined,
    destination: searchParams.get('destination') || undefined,
  }));

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)),
    total: 0,
    totalPages: 0,
  });

  const [sorting, setSorting] = useState<{
    field?: SortField;
    order?: SortOrder;
  }>({
    field: (searchParams.get('sortField') as SortField) || 'created_at',
    order: (searchParams.get('sortOrder') as SortOrder) || 'desc',
  });

  // Debounce search to avoid too many API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Update URL when filters/pagination change
  const updateURL = useCallback((newFilters: LoadsFiltersType, newPagination: PaginationInfo, newSorting: typeof sorting) => {
    const params = new URLSearchParams();

    // Add filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Add pagination to URL
    if (newPagination.page > 1) {
      params.set('page', newPagination.page.toString());
    }
    if (newPagination.pageSize !== DEFAULT_PAGE_SIZE) {
      params.set('pageSize', newPagination.pageSize.toString());
    }

    // Add sorting to URL
    if (newSorting.field) {
      params.set('sortField', newSorting.field);
    }
    if (newSorting.order) {
      params.set('sortOrder', newSorting.order);
    }

    const url = params.toString() ? `?${params.toString()}` : '/loads';
    router.replace(url, { scroll: false });
  }, [router]);

  // Query parameters for API call
  const queryParams = useMemo(() => ({
    ...debouncedFilters,
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortField: sorting.field,
    sortOrder: sorting.order,
  }), [debouncedFilters, pagination.page, pagination.pageSize, sorting.field, sorting.order]);

  // Fetch loads with server-side filtering and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['loads', queryParams],
    queryFn: () => apiClient.getLoads(queryParams),
    keepPreviousData: true,
  });

  // Fetch customers for filter dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiClient.getCustomers(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const customers = customersData?.data?.map((c: any) => c.name) || [];

  // Update pagination when data changes
  useMemo(() => {
    if (data?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    }
  }, [data?.pagination]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: LoadsFiltersType) => {
    setFilters(newFilters);
    const newPagination = { ...pagination, page: 1 }; // Reset to first page
    setPagination(newPagination);
    updateURL(newFilters, newPagination, sorting);
  }, [pagination, sorting, updateURL]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    const newPagination = { ...pagination, page: 1 };
    setPagination(newPagination);
    updateURL(emptyFilters, newPagination, sorting);
  }, [pagination, sorting, updateURL]);

  // Handle pagination changes
  const handlePageChange = useCallback((page: number) => {
    const newPagination = { ...pagination, page };
    setPagination(newPagination);
    updateURL(filters, newPagination, sorting);
  }, [filters, pagination, sorting, updateURL]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    const newPagination = { ...pagination, page: 1, pageSize };
    setPagination(newPagination);
    updateURL(filters, newPagination, sorting);
  }, [filters, pagination, sorting, updateURL]);

  // Handle sorting changes
  const handleSort = useCallback((field: SortField) => {
    const newOrder: SortOrder =
      sorting.field === field && sorting.order === 'asc' ? 'desc' : 'asc';

    const newSorting = { field, order: newOrder };
    setSorting(newSorting);
    updateURL(filters, pagination, newSorting);
  }, [filters, pagination, sorting, updateURL]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loads</h1>
            <p className="text-muted-foreground">
              Manage and track all your freight loads
            </p>
          </div>
          <Button asChild>
            <Link href="/loads/new">
              <Plus className="mr-2 h-4 w-4" />
              New Load
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <LoadsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          customers={customers}
          isLoading={isLoading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Failed to load data. Please try again.
            </p>
          </div>
        )}

        {/* Loads Table */}
        <LoadsTable
          loads={data?.loads || []}
          isLoading={isLoading}
          sortField={sorting.field}
          sortOrder={sorting.order}
          onSort={handleSort}
        />

        {/* Pagination */}
        <LoadsPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}