// ============================================================================
// Base Types
// ============================================================================

export interface PaginationMeta {
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseFilters {
  cursor?: string;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Load Types
// ============================================================================

export type LoadStatus =
  | 'draft'
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'invoiced'
  | 'completed'
  | 'cancelled';

export interface LoadListItem {
  id: string;
  loadNumber: string;
  status: LoadStatus;
  pickupLocation: {
    name: string;
    city: string;
    state: string;
  };
  deliveryLocation: {
    name: string;
    city: string;
    state: string;
  };
  pickupDate: string; // ISO date
  deliveryDate: string; // ISO date
  customer: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
  };
  tractor?: {
    id: string;
    unit: string;
  };
  trailer?: {
    id: string;
    unit: string;
  };
  revenue: number;
  distance: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoadFilters extends BaseFilters {
  status?: LoadStatus | LoadStatus[];
  customerId?: string;
  driverId?: string;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
}

// ============================================================================
// Driver Types
// ============================================================================

export type DriverStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type LicenseClass = 'A' | 'B' | 'C';

export interface DriverListItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: DriverStatus;
  licenseNumber: string;
  licenseClass: LicenseClass;
  licenseExpiration: string; // ISO date
  hireDate: string; // ISO date
  currentLocation?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    updatedAt: string;
  };
  assignedTractor?: {
    id: string;
    unit: string;
  };
  assignedTrailer?: {
    id: string;
    unit: string;
  };
  activeLoadsCount: number;
  totalMiles: number;
  createdAt: string;
  updatedAt: string;
}

export interface DriverFilters extends BaseFilters {
  status?: DriverStatus | DriverStatus[];
  licenseClass?: LicenseClass | LicenseClass[];
  available?: boolean;
  locationCity?: string;
  locationState?: string;
}

// ============================================================================
// Fleet Types (Tractors)
// ============================================================================

export type TractorStatus = 'active' | 'maintenance' | 'out_of_service' | 'retired';
export type MaintenanceStatus = 'due' | 'overdue' | 'scheduled' | 'current';

export interface TractorListItem {
  id: string;
  unit: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: TractorStatus;
  mileage: number;
  fuelType: string;
  assignedDriver?: {
    id: string;
    name: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    updatedAt: string;
  };
  maintenance: {
    status: MaintenanceStatus;
    nextServiceDate?: string; // ISO date
    nextServiceMiles?: number;
    lastServiceDate?: string; // ISO date
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expirationDate: string; // ISO date
  };
  createdAt: string;
  updatedAt: string;
}

export interface TractorFilters extends BaseFilters {
  status?: TractorStatus | TractorStatus[];
  make?: string | string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  maintenanceStatus?: MaintenanceStatus | MaintenanceStatus[];
  available?: boolean;
}

// ============================================================================
// Fleet Types (Trailers)
// ============================================================================

export type TrailerStatus = 'active' | 'maintenance' | 'out_of_service' | 'retired';
export type TrailerType = 'dry_van' | 'refrigerated' | 'flatbed' | 'tank' | 'container';

export interface TrailerListItem {
  id: string;
  unit: string;
  type: TrailerType;
  make: string;
  model: string;
  year: number;
  vin?: string;
  status: TrailerStatus;
  length: number; // feet
  capacity: number; // weight in lbs
  assignedDriver?: {
    id: string;
    name: string;
  };
  assignedTractor?: {
    id: string;
    unit: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    updatedAt: string;
  };
  maintenance: {
    status: MaintenanceStatus;
    nextServiceDate?: string; // ISO date
    lastServiceDate?: string; // ISO date
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrailerFilters extends BaseFilters {
  status?: TrailerStatus | TrailerStatus[];
  type?: TrailerType | TrailerType[];
  make?: string | string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  maintenanceStatus?: MaintenanceStatus | MaintenanceStatus[];
  available?: boolean;
}

// ============================================================================
// Customer Types
// ============================================================================

export type CustomerStatus = 'active' | 'inactive' | 'on_hold' | 'terminated';
export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'cod' | 'prepaid';

export interface CustomerListItem {
  id: string;
  name: string;
  accountNumber?: string;
  status: CustomerStatus;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentTerms: PaymentTerms;
  creditLimit?: number;
  currentBalance: number;
  totalLoads: number;
  totalRevenue: number;
  averageRevenue: number;
  lastLoadDate?: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters extends BaseFilters {
  status?: CustomerStatus | CustomerStatus[];
  paymentTerms?: PaymentTerms | PaymentTerms[];
  state?: string | string[];
  balanceFrom?: number;
  balanceTo?: number;
  hasOverdueInvoices?: boolean;
}

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customer: {
    id: string;
    name: string;
  };
  load?: {
    id: string;
    loadNumber: string;
  };
  amount: number;
  paidAmount: number;
  remainingBalance: number;
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  paidDate?: string; // ISO date
  paymentTerms: PaymentTerms;
  daysOverdue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters extends BaseFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  customerId?: string;
  loadId?: string;
  issueDateFrom?: string; // ISO date
  issueDateTo?: string; // ISO date
  dueDateFrom?: string; // ISO date
  dueDateTo?: string; // ISO date
  amountFrom?: number;
  amountTo?: number;
  isOverdue?: boolean;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  loads: {
    total: number;
    active: number;
    completed: number;
    revenue: number;
  };
  fleet: {
    tractors: {
      total: number;
      active: number;
      maintenance: number;
    };
    trailers: {
      total: number;
      active: number;
      maintenance: number;
    };
    drivers: {
      total: number;
      active: number;
      available: number;
    };
  };
  financials: {
    totalRevenue: number;
    outstandingInvoices: number;
    overdueInvoices: number;
    averageCollectionDays: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'load_created' | 'load_completed' | 'invoice_paid' | 'driver_assigned';
    description: string;
    timestamp: string;
    relatedEntity?: {
      type: 'load' | 'driver' | 'customer' | 'invoice';
      id: string;
      name: string;
    };
  }>;
}

export interface DashboardLayout {
  widgets: Array<{
    id: string;
    type: 'stats' | 'chart' | 'list' | 'map';
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    config: Record<string, any>;
  }>;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    refreshInterval: number; // seconds
    timezone: string;
  };
}

// ============================================================================
// Accounting Types
// ============================================================================

export interface AccountingSummary {
  period: {
    start: string; // ISO date
    end: string; // ISO date
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  revenue: {
    total: number;
    byCustomer: Array<{
      customerId: string;
      customerName: string;
      amount: number;
      percentage: number;
    }>;
    trend: Array<{
      date: string; // ISO date
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    margin: number; // percentage
  };
  cashFlow: {
    receivables: number;
    payables: number;
    netCashFlow: number;
  };
  kpis: {
    revenuePerMile: number;
    costPerMile: number;
    utilizationRate: number; // percentage
    onTimeDeliveryRate: number; // percentage
  };
}

export interface AccountingFilters {
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string; // ISO date
  endDate: string; // ISO date
  customerId?: string;
  driverId?: string;
  includeProjections?: boolean;
}