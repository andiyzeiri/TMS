import {
  LayoutDashboard,
  Truck,
  Users,
  Car,
  Building2,
  Wallet,
  Calculator,
  FileText,
  Link,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface RouteConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiredPermissions: string[];
  alwaysVisible?: boolean;
}

export const routeConfig: RouteConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredPermissions: [],
    alwaysVisible: true,
  },
  {
    id: 'loads',
    label: 'Loads',
    href: '/loads',
    icon: Truck,
    requiredPermissions: ['view:ops'],
  },
  {
    id: 'drivers',
    label: 'Drivers',
    href: '/drivers',
    icon: Users,
    requiredPermissions: ['view:ops'],
  },
  {
    id: 'fleet',
    label: 'Fleet',
    href: '/fleet',
    icon: Car,
    requiredPermissions: ['view:ops'],
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: Building2,
    requiredPermissions: ['view:ops'],
  },
  {
    id: 'paycheck',
    label: 'Paycheck',
    href: '/paycheck',
    icon: Wallet,
    requiredPermissions: ['view:finance'],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    href: '/accounting',
    icon: Calculator,
    requiredPermissions: ['view:finance'],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/invoices',
    icon: FileText,
    requiredPermissions: ['view:finance'],
  },
  {
    id: 'api-connections',
    label: 'API Connections',
    href: '/api-connections',
    icon: Link,
    requiredPermissions: ['admin:*'],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredPermissions: ['admin:*'],
  },
];

export function getVisibleRoutes(
  routes: RouteConfig[],
  hasAnyPermission: (permissions: string[]) => boolean
): RouteConfig[] {
  return routes.filter(route => {
    if (route.alwaysVisible) return true;
    return hasAnyPermission(route.requiredPermissions);
  });
}