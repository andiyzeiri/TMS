import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  LoadListItem,
  LoadFilters,
  DriverListItem,
  DriverFilters,
  TractorListItem,
  TractorFilters,
  TrailerListItem,
  TrailerFilters,
  CustomerListItem,
  CustomerFilters,
  InvoiceListItem,
  InvoiceFilters,
  DashboardStats,
  DashboardLayout,
  AccountingSummary,
  AccountingFilters,
  PaginatedResponse,
} from './types';

// ============================================================================
// Query Key Factories
// ============================================================================

export const queryKeys = {
  // Loads
  loads: () => ['loads'] as const,
  loadsList: (filters?: LoadFilters) => ['loads', 'list', filters] as const,
  loadsDetail: (id: string) => ['loads', 'detail', id] as const,

  // Drivers
  drivers: () => ['drivers'] as const,
  driversList: (filters?: DriverFilters) => ['drivers', 'list', filters] as const,
  driversDetail: (id: string) => ['drivers', 'detail', id] as const,

  // Fleet - Tractors
  tractors: () => ['fleet', 'tractors'] as const,
  tractorsList: (filters?: TractorFilters) => ['fleet', 'tractors', 'list', filters] as const,
  tractorsDetail: (id: string) => ['fleet', 'tractors', 'detail', id] as const,

  // Fleet - Trailers
  trailers: () => ['fleet', 'trailers'] as const,
  trailersList: (filters?: TrailerFilters) => ['fleet', 'trailers', 'list', filters] as const,
  trailersDetail: (id: string) => ['fleet', 'trailers', 'detail', id] as const,

  // Customers
  customers: () => ['customers'] as const,
  customersList: (filters?: CustomerFilters) => ['customers', 'list', filters] as const,
  customersDetail: (id: string) => ['customers', 'detail', id] as const,

  // Invoices
  invoices: () => ['invoices'] as const,
  invoicesList: (filters?: InvoiceFilters) => ['invoices', 'list', filters] as const,
  invoicesDetail: (id: string) => ['invoices', 'detail', id] as const,

  // Dashboard
  dashboard: () => ['dashboard'] as const,
  dashboardLayout: () => ['dashboard', 'layout'] as const,
  dashboardStats: () => ['dashboard', 'stats'] as const,

  // Accounting
  accounting: () => ['accounting'] as const,
  accountingSummary: (filters?: AccountingFilters) => ['accounting', 'summary', filters] as const,
} as const;

// ============================================================================
// Hook Types and Utilities
// ============================================================================

export interface PaginationHelpers {
  hasNextPage: boolean;
  nextCursor?: string;
  loadMore: () => void;
  refresh: () => void;
}

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number | boolean;
}

// ============================================================================
// Loads Hooks
// ============================================================================

export function useLoadsList(
  filters: LoadFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<LoadListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.loadsList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<LoadListItem[]>(`/api/v1/loads${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<LoadListItem>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      // This would typically trigger infinite query logic
      // For now, we'll refetch with new cursor
      console.log('Load more with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Drivers Hooks
// ============================================================================

export function useDriversList(
  filters: DriverFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<DriverListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.driversList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<DriverListItem[]>(`/api/v1/drivers${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<DriverListItem>;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      console.log('Load more drivers with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Fleet Tractors Hooks
// ============================================================================

export function useFleetTractorsList(
  filters: TractorFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<TractorListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.tractorsList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<TractorListItem[]>(`/api/v1/fleet/tractors${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<TractorListItem>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      console.log('Load more tractors with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Fleet Trailers Hooks
// ============================================================================

export function useFleetTrailersList(
  filters: TrailerFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<TrailerListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.trailersList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<TrailerListItem[]>(`/api/v1/fleet/trailers${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<TrailerListItem>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      console.log('Load more trailers with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Customers Hooks
// ============================================================================

export function useCustomersList(
  filters: CustomerFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<CustomerListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.customersList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<CustomerListItem[]>(`/api/v1/customers${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<CustomerListItem>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      console.log('Load more customers with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Invoices Hooks
// ============================================================================

export function useInvoicesList(
  filters: InvoiceFilters = {},
  options: QueryOptions = {}
): UseQueryResult<PaginatedResponse<InvoiceListItem>, Error> & PaginationHelpers {
  const query = useQuery({
    queryKey: queryKeys.invoicesList(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<InvoiceListItem[]>(`/api/v1/invoices${queryString}`);

      return {
        data: response.data,
        meta: response.meta || { hasMore: false },
      } as PaginatedResponse<InvoiceListItem>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });

  const hasNextPage = query.data?.meta?.hasMore ?? false;
  const nextCursor = query.data?.meta?.nextCursor;

  const loadMore = () => {
    if (hasNextPage && nextCursor) {
      console.log('Load more invoices with cursor:', nextCursor);
    }
  };

  const refresh = () => {
    query.refetch();
  };

  return {
    ...query,
    hasNextPage,
    nextCursor,
    loadMore,
    refresh,
  };
}

// ============================================================================
// Accounting Hooks
// ============================================================================

export function useAccountingSummary(
  filters: AccountingFilters,
  options: QueryOptions = {}
): UseQueryResult<AccountingSummary, Error> {
  return useQuery({
    queryKey: queryKeys.accountingSummary(filters),
    queryFn: async () => {
      const queryString = apiClient.buildQuery(filters);
      const response = await apiClient.get<AccountingSummary>(`/api/v1/accounting/summary${queryString}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

// ============================================================================
// Dashboard Hooks
// ============================================================================

export function useDashboardLayout(
  options: QueryOptions = {}
): UseQueryResult<DashboardLayout, Error> {
  return useQuery({
    queryKey: queryKeys.dashboardLayout(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardLayout>('/api/v1/dashboard/layout');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

export function useDashboardStats(
  options: QueryOptions = {}
): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/api/v1/dashboard/stats');
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    ...options,
  });
}

// ============================================================================
// Utility Hooks for Common Patterns
// ============================================================================

/**
 * Hook for getting all available items (no pagination) - useful for dropdowns
 */
export function useDriversForSelect(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['drivers', 'select'],
    queryFn: async () => {
      const response = await apiClient.get<DriverListItem[]>('/api/v1/drivers?status=active&limit=1000');
      return response.data.map(driver => ({
        value: driver.id,
        label: driver.fullName,
        status: driver.status,
      }));
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCustomersForSelect(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['customers', 'select'],
    queryFn: async () => {
      const response = await apiClient.get<CustomerListItem[]>('/api/v1/customers?status=active&limit=1000');
      return response.data.map(customer => ({
        value: customer.id,
        label: customer.name,
        status: customer.status,
      }));
    },
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}

export function useTractorsForSelect(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['fleet', 'tractors', 'select'],
    queryFn: async () => {
      const response = await apiClient.get<TractorListItem[]>('/api/v1/fleet/tractors?status=active&available=true&limit=1000');
      return response.data.map(tractor => ({
        value: tractor.id,
        label: `${tractor.unit} (${tractor.make} ${tractor.model})`,
        unit: tractor.unit,
        status: tractor.status,
      }));
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useTrailersForSelect(options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['fleet', 'trailers', 'select'],
    queryFn: async () => {
      const response = await apiClient.get<TrailerListItem[]>('/api/v1/fleet/trailers?status=active&available=true&limit=1000');
      return response.data.map(trailer => ({
        value: trailer.id,
        label: `${trailer.unit} (${trailer.type})`,
        unit: trailer.unit,
        type: trailer.type,
        status: trailer.status,
      }));
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}