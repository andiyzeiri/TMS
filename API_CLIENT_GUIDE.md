# TMS API Client & React Query Guide

## Overview

A comprehensive typed API client with automatic retries, error handling, and React Query integration for the TMS application.

## Features

✅ **Type-safe API client** with full TypeScript support
✅ **Automatic retries** on 429/503 with exponential backoff
✅ **Idempotency keys** for write operations
✅ **Cursor-based pagination** support
✅ **Error handling** with detailed error types
✅ **React Query hooks** for all endpoints
✅ **Authentication** token management
✅ **Request/Response interceptors**

## Files Structure

```
src/lib/api/
├── client.ts     # Core API client with fetch wrapper
├── types.ts      # TypeScript DTOs and interfaces
└── queries.ts    # React Query hooks
```

## Quick Start

### 1. Basic API Client Usage

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const response = await apiClient.get('/api/v1/loads');

// POST request with data
const newLoad = await apiClient.post('/api/v1/loads', {
  customerId: 'customer-123',
  pickupLocation: { ... }
});

// Query parameters
const queryString = apiClient.buildQuery({ status: 'active', limit: 50 });
const loads = await apiClient.get(`/api/v1/loads${queryString}`);
```

### 2. React Query Hooks

```typescript
import { useLoadsList, useDriversList } from '@/lib/api/queries';

function LoadsTable() {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    loadMore,
    refresh
  } = useLoadsList(
    { status: 'active', limit: 25 },
    { enabled: true }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(load => (
        <div key={load.id}>{load.loadNumber}</div>
      ))}
      {hasNextPage && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

## API Client Features

### Error Handling & Retries

```typescript
// Automatic retries for 429, 503, and network errors
const response = await apiClient.get('/api/v1/loads', {
  retries: 5,           // Max retry attempts
  retryDelay: 1000,     // Base delay in ms
  timeout: 30000        // Request timeout
});
```

### Idempotency Keys

Write operations automatically include idempotency keys:

```typescript
// Automatically adds: Idempotency-Key: uuid-v4
await apiClient.post('/api/v1/loads', loadData);

// Or provide your own
await apiClient.post('/api/v1/loads', loadData, {
  headers: { 'Idempotency-Key': 'custom-key' }
});
```

### Authentication

Tokens are automatically included from localStorage/sessionStorage:

```typescript
// Set token
localStorage.setItem('auth_token', 'your-jwt-token');

// All subsequent requests include: Authorization: Bearer your-jwt-token
const response = await apiClient.get('/api/v1/loads');
```

## React Query Hooks

### Loads

```typescript
import { useLoadsList } from '@/lib/api/queries';

// List loads with filters
const { data, isLoading, error } = useLoadsList({
  status: ['active', 'in_transit'],
  customerId: 'cust-123',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  cursor: 'next-page-cursor',
  limit: 50
});

// Usage in component
function LoadsPage() {
  const [filters, setFilters] = useState<LoadFilters>({
    status: 'active'
  });

  const loadsQuery = useLoadsList(filters, {
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  return (
    <div>
      <LoadFilters onChange={setFilters} />
      <LoadsList
        loads={loadsQuery.data?.data || []}
        loading={loadsQuery.isLoading}
        hasMore={loadsQuery.hasNextPage}
        onLoadMore={loadsQuery.loadMore}
      />
    </div>
  );
}
```

### Drivers

```typescript
import { useDriversList } from '@/lib/api/queries';

// List drivers with location filtering
const { data } = useDriversList({
  status: 'active',
  available: true,
  locationState: 'CA',
  licenseClass: ['A', 'B']
});

// For select dropdowns
import { useDriversForSelect } from '@/lib/api/queries';

const { data: driverOptions } = useDriversForSelect();
// Returns: [{ value: 'id', label: 'John Doe', status: 'active' }]
```

### Fleet Management

```typescript
import { useFleetTractorsList, useFleetTrailersList } from '@/lib/api/queries';

// Tractors with maintenance filtering
const { data: tractors } = useFleetTractorsList({
  status: 'active',
  maintenanceStatus: 'current',
  make: 'Freightliner',
  yearFrom: 2020
});

// Available trailers for assignment
const { data: trailers } = useFleetTrailersList({
  available: true,
  type: ['dry_van', 'refrigerated'],
  status: 'active'
});
```

### Customers & Invoices

```typescript
import { useCustomersList, useInvoicesList } from '@/lib/api/queries';

// High-value customers
const { data: customers } = useCustomersList({
  status: 'active',
  balanceFrom: 10000,
  hasOverdueInvoices: false
});

// Overdue invoices
const { data: invoices } = useInvoicesList({
  isOverdue: true,
  status: ['sent', 'viewed'],
  amountFrom: 1000
});
```

### Dashboard & Analytics

```typescript
import { useDashboardStats, useAccountingSummary } from '@/lib/api/queries';

// Real-time dashboard stats
const { data: stats } = useDashboardStats({
  refetchInterval: 5 * 60 * 1000 // Auto-refresh every 5 minutes
});

// Monthly accounting summary
const { data: accounting } = useAccountingSummary({
  periodType: 'monthly',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  includeProjections: true
});
```

## Advanced Patterns

### Infinite Queries (Future Enhancement)

```typescript
// Example of how infinite queries could be implemented
import { useInfiniteQuery } from '@tanstack/react-query';

function useInfiniteLoads(filters: LoadFilters) {
  return useInfiniteQuery({
    queryKey: ['loads', 'infinite', filters],
    queryFn: ({ pageParam }) => {
      return apiClient.get(`/api/v1/loads${apiClient.buildQuery({
        ...filters,
        cursor: pageParam
      })}`);
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor,
    initialPageParam: undefined,
  });
}
```

### Mutations with Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useUpdateLoadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loadId, status }: { loadId: string; status: LoadStatus }) =>
      apiClient.patch(`/api/v1/loads/${loadId}`, { status }),

    onMutate: async ({ loadId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['loads'] });

      const previousData = queryClient.getQueryData(['loads', 'list']);

      queryClient.setQueryData(['loads', 'list'], (old: any) => ({
        ...old,
        data: old?.data?.map((load: LoadListItem) =>
          load.id === loadId ? { ...load, status } : load
        )
      }));

      return { previousData };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['loads', 'list'], context.previousData);
      }
    },

    onSuccess: () => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    }
  });
}
```

### Custom Hook Patterns

```typescript
// Combined data fetching hook
function useLoadDetails(loadId: string) {
  const loadQuery = useQuery({
    queryKey: ['loads', 'detail', loadId],
    queryFn: () => apiClient.get(`/api/v1/loads/${loadId}`)
  });

  const driversQuery = useDriversForSelect({
    enabled: !!loadQuery.data
  });

  const customersQuery = useCustomersForSelect({
    enabled: !!loadQuery.data
  });

  return {
    load: loadQuery.data?.data,
    drivers: driversQuery.data || [],
    customers: customersQuery.data || [],
    isLoading: loadQuery.isLoading || driversQuery.isLoading || customersQuery.isLoading,
    error: loadQuery.error || driversQuery.error || customersQuery.error
  };
}
```

## Environment Configuration

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

// Or set programmatically
import { apiClient } from '@/lib/api/client';
apiClient.setBaseURL('https://api.tms-production.com');
```

## Error Handling

```typescript
import { ApiError } from '@/lib/api/client';

try {
  const response = await apiClient.post('/api/v1/loads', loadData);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Data:', error.data);

    if (error.status === 422) {
      // Handle validation errors
      const validationErrors = error.data?.errors || [];
    }
  }
}

// In React Query hooks
const { error } = useLoadsList();
if (error) {
  // error is typed as Error | null
  const apiError = error as ApiError;
  if (apiError.status === 401) {
    // Redirect to login
  }
}
```

## Testing

```typescript
// Mock API client for tests
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock React Query hooks
jest.mock('@/lib/api/queries', () => ({
  useLoadsList: jest.fn(() => ({
    data: { data: [], meta: { hasMore: false } },
    isLoading: false,
    error: null,
    hasNextPage: false,
    loadMore: jest.fn(),
    refresh: jest.fn(),
  }))
}));
```

## Best Practices

1. **Use filters objects** instead of individual parameters
2. **Leverage React Query caching** with appropriate stale times
3. **Handle loading and error states** in all components
4. **Use optimistic updates** for better UX
5. **Implement proper error boundaries** for API errors
6. **Use select options hooks** for dropdowns to reduce data transfer
7. **Set up proper retry logic** for critical operations
8. **Monitor query performance** with React Query DevTools

This API client provides a solid foundation for all TMS data operations with excellent TypeScript support and modern React patterns.