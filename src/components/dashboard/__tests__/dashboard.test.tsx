import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';
import { useDashboard } from '@/hooks/use-dashboard';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock the dashboard hook
jest.mock('@/hooks/use-dashboard');

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Test wrapper with React Query
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard page with loading state', () => {
    (useDashboard as jest.Mock).mockReturnValue({
      layout: null,
      stats: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByRole('main', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor your transportation operations and finances')).toBeInTheDocument();

    // Check for loading skeletons
    const skeletons = screen.getAllByTestId('skeleton'); // This would need to be added to Skeleton component
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders dashboard with widgets when data is loaded', async () => {
    const mockLayout = {
      widgets: ['loads_overview', 'revenue', 'ontime', 'ar']
    };

    const mockStats = {
      data: {
        loads_overview: {
          data: {
            status_counts: {
              draft: 5,
              dispatched: 8,
              in_transit: 12,
              delivered: 25,
              completed: 20
            },
            delivered_today: 15,
            total_loads: 70
          },
          generated_at: '2024-09-19T14:30:45.123456',
          error: null
        },
        revenue: {
          data: {
            currency: 'USD',
            mtd: 125000.50,
            qtd: 340000.75,
            ytd: 890000.25,
            period: 15000.00,
            period_range: {
              from: '2024-09-19',
              to: '2024-09-19'
            }
          },
          generated_at: '2024-09-19T14:30:45.234567',
          error: null
        }
      },
      meta: {
        widget_count: 2,
        error_count: 0,
        total_execution_time_ms: 145.67,
        date_range: {
          from: '2024-09-19',
          to: '2024-09-19'
        },
        timings: {
          loads_overview: 12.34,
          revenue: 34.56
        }
      }
    };

    (useDashboard as jest.Mock).mockReturnValue({
      layout: mockLayout,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('grid', { name: /dashboard widgets/i })).toBeInTheDocument();
    });

    // Check that widgets are rendered
    expect(screen.getByText('Loads Overview')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument(); // loads overview total
    expect(screen.getByText('$15,000')).toBeInTheDocument(); // revenue value
  });

  it('handles error state correctly', () => {
    (useDashboard as jest.Mock).mockReturnValue({
      layout: null,
      stats: null,
      isLoading: false,
      error: 'Failed to load dashboard data',
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText('Failed to Load Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows empty state when user has no widgets', async () => {
    const mockLayout = {
      widgets: []
    };

    (useDashboard as jest.Mock).mockReturnValue({
      layout: mockLayout,
      stats: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No Dashboard Widgets Available')).toBeInTheDocument();
    });

    expect(screen.getByText('You don\'t have access to any dashboard widgets. Please contact your administrator.')).toBeInTheDocument();
  });

  it('updates filters when date range is changed', async () => {
    const mockRefetch = jest.fn();

    (useDashboard as jest.Mock).mockReturnValue({
      layout: { widgets: ['loads_overview'] },
      stats: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Find and click the date range selector
    const dateRangeSelect = screen.getByRole('combobox', { name: /select date range type/i });
    fireEvent.click(dateRangeSelect);

    // Select "Last 7 Days"
    const sevenDayOption = screen.getByText('Last 7 Days');
    fireEvent.click(sevenDayOption);

    // Should update the URL
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('calls refetch when refresh button is clicked', async () => {
    const mockRefetch = jest.fn();

    (useDashboard as jest.Mock).mockReturnValue({
      layout: { widgets: ['loads_overview'] },
      stats: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });
});

describe('Role-based Widget Access', () => {
  it('shows only operations widgets for ops user', async () => {
    const mockLayout = {
      widgets: ['loads_overview', 'ontime', 'at_risk'] // Only ops widgets
    };

    (useDashboard as jest.Mock).mockReturnValue({
      layout: mockLayout,
      stats: {
        data: {
          loads_overview: {
            data: { status_counts: {}, delivered_today: 0, total_loads: 0 },
            generated_at: '2024-09-19T14:30:45.123456',
            error: null
          }
        },
        meta: { widget_count: 1, total_execution_time_ms: 10, date_range: { from: '2024-09-19', to: '2024-09-19' }, timings: {} }
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Should show ops widgets
    await waitFor(() => {
      expect(screen.getByText('Loads Overview')).toBeInTheDocument();
      expect(screen.getByText('On-Time Performance')).toBeInTheDocument();
      expect(screen.getByText('At-Risk Loads')).toBeInTheDocument();
    });

    // Should NOT show finance widgets
    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    expect(screen.queryByText('Accounts Receivable')).not.toBeInTheDocument();
  });

  it('shows only finance widgets for finance user', async () => {
    const mockLayout = {
      widgets: ['revenue', 'ar', 'margin'] // Only finance widgets
    };

    (useDashboard as jest.Mock).mockReturnValue({
      layout: mockLayout,
      stats: {
        data: {
          revenue: {
            data: {
              currency: 'USD',
              mtd: 125000,
              qtd: 340000,
              ytd: 890000,
              period: 15000,
              period_range: { from: '2024-09-19', to: '2024-09-19' }
            },
            generated_at: '2024-09-19T14:30:45.123456',
            error: null
          }
        },
        meta: { widget_count: 1, total_execution_time_ms: 10, date_range: { from: '2024-09-19', to: '2024-09-19' }, timings: {} }
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Should show finance widgets
    await waitFor(() => {
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Accounts Receivable')).toBeInTheDocument();
      expect(screen.getByText('Margin Analysis')).toBeInTheDocument();
    });

    // Should NOT show ops widgets
    expect(screen.queryByText('Loads Overview')).not.toBeInTheDocument();
    expect(screen.queryByText('On-Time Performance')).not.toBeInTheDocument();
  });

  it('shows all widgets for admin user', async () => {
    const mockLayout = {
      widgets: ['loads_overview', 'revenue', 'ontime', 'ar', 'at_risk', 'margin']
    };

    const mockStats = {
      data: {
        loads_overview: {
          data: { status_counts: {}, delivered_today: 0, total_loads: 0 },
          generated_at: '2024-09-19T14:30:45.123456',
          error: null
        },
        revenue: {
          data: {
            currency: 'USD', mtd: 125000, qtd: 340000, ytd: 890000, period: 15000,
            period_range: { from: '2024-09-19', to: '2024-09-19' }
          },
          generated_at: '2024-09-19T14:30:45.123456',
          error: null
        }
      },
      meta: { widget_count: 2, total_execution_time_ms: 20, date_range: { from: '2024-09-19', to: '2024-09-19' }, timings: {} }
    };

    (useDashboard as jest.Mock).mockReturnValue({
      layout: mockLayout,
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Should show both ops and finance widgets
    await waitFor(() => {
      expect(screen.getByText('Loads Overview')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('On-Time Performance')).toBeInTheDocument();
      expect(screen.getByText('Accounts Receivable')).toBeInTheDocument();
      expect(screen.getByText('At-Risk Loads')).toBeInTheDocument();
      expect(screen.getByText('Margin Analysis')).toBeInTheDocument();
    });
  });
});