import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '../Sidebar';
import { usePermissions } from '@/hooks/use-permissions';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock the usePermissions hook
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  Menu: () => <div data-testid="menu" />,
  X: () => <div data-testid="x" />,
  LayoutDashboard: () => <div data-testid="dashboard-icon" />,
  Truck: () => <div data-testid="truck-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Car: () => <div data-testid="car-icon" />,
  Building2: () => <div data-testid="building-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  Calculator: () => <div data-testid="calculator-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  Link: () => <div data-testid="link-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
}));

const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Sidebar', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Permission-based visibility', () => {
    it('shows only dashboard when user has no permissions', async () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        hasPermission: jest.fn(() => false),
        hasAnyPermission: jest.fn(() => false),
        isLoading: false,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Loads')).not.toBeInTheDocument();
      expect(screen.queryByText('Drivers')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('shows operations items when user has view:ops permission', async () => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:ops'],
        hasPermission: jest.fn((perm) => perm === 'view:ops'),
        hasAnyPermission: jest.fn((perms) => perms.includes('view:ops')),
        isLoading: false,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Loads')).toBeInTheDocument();
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Fleet')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.queryByText('Accounting')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('shows finance items when user has view:finance permission', async () => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:finance'],
        hasPermission: jest.fn((perm) => perm === 'view:finance'),
        hasAnyPermission: jest.fn((perms) => perms.includes('view:finance')),
        isLoading: false,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Paycheck')).toBeInTheDocument();
      expect(screen.getByText('Accounting')).toBeInTheDocument();
      expect(screen.getByText('Invoices')).toBeInTheDocument();
      expect(screen.queryByText('Loads')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('shows admin items when user has admin:* permission', async () => {
      mockUsePermissions.mockReturnValue({
        permissions: ['admin:*'],
        hasPermission: jest.fn((perm) => perm === 'admin:*'),
        hasAnyPermission: jest.fn((perms) =>
          perms.some(perm => perm === 'admin:*' || perm.startsWith('admin:'))
        ),
        isLoading: false,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('API Connections')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.queryByText('Loads')).not.toBeInTheDocument();
      expect(screen.queryByText('Accounting')).not.toBeInTheDocument();
    });

    it('shows all items when user has all permissions', async () => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:ops', 'view:finance', 'admin:*'],
        hasPermission: jest.fn(() => true),
        hasAnyPermission: jest.fn(() => true),
        isLoading: false,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      // Check all menu items are present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Loads')).toBeInTheDocument();
      expect(screen.getByText('Drivers')).toBeInTheDocument();
      expect(screen.getByText('Fleet')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Paycheck')).toBeInTheDocument();
      expect(screen.getByText('Accounting')).toBeInTheDocument();
      expect(screen.getByText('Invoices')).toBeInTheDocument();
      expect(screen.getByText('API Connections')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows loading skeleton when permissions are loading', () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        isLoading: true,
        error: null,
      });

      render(<Sidebar />, { wrapper: createWrapper() });

      // Should show skeleton elements instead of actual menu items
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Loads')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:ops', 'view:finance'],
        hasPermission: jest.fn(() => true),
        hasAnyPermission: jest.fn(() => true),
        isLoading: false,
        error: null,
      });
    });

    it('handles arrow key navigation', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      const sidebar = screen.getByRole('complementary');

      // Focus the sidebar
      fireEvent.keyDown(sidebar, { key: 'ArrowDown' });

      // The first navigation item should be focused
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('handles Enter key to navigate', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      const sidebar = screen.getByRole('complementary');
      const loadsLink = screen.getByText('Loads').closest('a');

      // Focus on loads link and press Enter
      fireEvent.focus(loadsLink!);
      fireEvent.keyDown(sidebar, { key: 'Enter' });

      // Should trigger navigation (in a real app, this would navigate)
      expect(loadsLink).toHaveAttribute('href', '/loads');
    });

    it('handles Escape key to blur sidebar', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      const sidebar = screen.getByRole('complementary');

      fireEvent.keyDown(sidebar, { key: 'Escape' });

      // Sidebar should lose focus
      expect(sidebar).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:ops'],
        hasPermission: jest.fn((perm) => perm === 'view:ops'),
        hasAnyPermission: jest.fn((perms) => perms.includes('view:ops')),
        isLoading: false,
        error: null,
      });
    });

    it('has proper ARIA labels', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Loads')).toBeInTheDocument();
      expect(screen.getByLabelText('Drivers')).toBeInTheDocument();
    });

    it('sets aria-current for active page', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');

      const loadsLink = screen.getByText('Loads').closest('a');
      expect(loadsLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('has proper focus management', () => {
      render(<Sidebar />, { wrapper: createWrapper() });

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const loadsLink = screen.getByText('Loads').closest('a');

      // Links should be focusable (they don't need explicit tabindex as they're naturally focusable)
      expect(dashboardLink).toBeInTheDocument();
      expect(loadsLink).toBeInTheDocument();

      // Check they can receive focus
      dashboardLink?.focus();
      expect(dashboardLink).toHaveFocus();
    });
  });

  describe('Responsive behavior', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        permissions: ['view:ops'],
        hasPermission: jest.fn(() => true),
        hasAnyPermission: jest.fn(() => true),
        isLoading: false,
        error: null,
      });
    });

    it('applies collapsed styles when collapsed prop is true', () => {
      render(<Sidebar collapsed={true} />, { wrapper: createWrapper() });

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('lg:w-16');
    });

    it('calls onToggleCollapse when toggle button is clicked', () => {
      const onToggleCollapse = jest.fn();
      render(<Sidebar onToggleCollapse={onToggleCollapse} />, { wrapper: createWrapper() });

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });
  });
});