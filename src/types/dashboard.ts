import { z } from "zod";

// Date range types
export const DateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// Dashboard layout types
export const DashboardLayoutSchema = z.object({
  widgets: z.array(z.string()),
});

export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

// Widget result base schema
export const WidgetResultSchema = z.object({
  data: z.any(),
  generated_at: z.string(),
  error: z.string().nullable(),
});

// Individual widget data schemas
export const LoadsOverviewDataSchema = z.object({
  status_counts: z.record(z.string(), z.number()),
  delivered_today: z.number(),
  total_loads: z.number(),
});

export const RevenueDataSchema = z.object({
  currency: z.string(),
  mtd: z.number(),
  qtd: z.number(),
  ytd: z.number(),
  period: z.number(),
  period_range: DateRangeSchema,
});

export const OnTimeDataSchema = z.object({
  p7: z.object({
    total_deliveries: z.number(),
    on_time_deliveries: z.number(),
    percentage: z.number(),
  }),
  p30: z.object({
    total_deliveries: z.number(),
    on_time_deliveries: z.number(),
    percentage: z.number(),
  }),
});

export const AccountsReceivableDataSchema = z.object({
  open_invoices: z.object({
    count: z.number(),
    amount: z.number(),
  }),
  average_days_outstanding: z.number(),
  dso_heuristic: z.number(),
  aging_buckets: z.object({
    current_0_30: z.number(),
    days_31_60: z.number(),
    days_61_90: z.number(),
    days_over_90: z.number(),
  }),
  trailing_90d_revenue: z.number(),
});

export const AtRiskDataSchema = z.object({
  total_at_risk: z.number(),
  top_loads: z.array(z.object({
    load_id: z.string(),
    load_number: z.string(),
    status: z.string(),
    scheduled_datetime: z.string(),
    actual_datetime: z.string().nullable(),
    eta_slip_minutes: z.number(),
  })),
});

export const MarginDataSchema = z.object({
  gross_margin: z.object({
    amount: z.number(),
    percentage: z.number(),
  }),
  operating_margin: z.object({
    amount: z.number(),
    percentage: z.number(),
  }),
  total_revenue: z.number(),
  total_cost: z.number(),
});

export const DwellDataSchema = z.object({
  average_dwell_hours: z.number(),
  median_dwell_hours: z.number(),
  top_locations: z.array(z.object({
    location: z.string(),
    average_hours: z.number(),
    load_count: z.number(),
  })),
});

export const DriverAvailabilityDataSchema = z.object({
  available: z.number(),
  busy: z.number(),
  out_of_service: z.number(),
  total: z.number(),
});

export const EquipmentAvailabilityDataSchema = z.object({
  tractors: z.object({
    available: z.number(),
    in_use: z.number(),
    maintenance: z.number(),
    total: z.number(),
  }),
  trailers: z.object({
    available: z.number(),
    in_use: z.number(),
    maintenance: z.number(),
    total: z.number(),
  }),
});

export const MilesDataSchema = z.object({
  total_miles: z.number(),
  loaded_miles: z.number(),
  empty_miles: z.number(),
  utilization_percentage: z.number(),
});

export const MissingPodDataSchema = z.object({
  missing_count: z.number(),
  overdue_count: z.number(),
  recent_missing: z.array(z.object({
    load_id: z.string(),
    load_number: z.string(),
    delivery_date: z.string(),
    days_overdue: z.number(),
  })),
});

export const AccessorialsDataSchema = z.object({
  total_amount: z.number(),
  count: z.number(),
  by_type: z.record(z.object({
    amount: z.number(),
    count: z.number(),
  })),
});

export const FuelIndexDataSchema = z.object({
  current_index: z.number(),
  previous_index: z.number(),
  change_percentage: z.number(),
  effective_date: z.string(),
});

export const IftaEstimateDataSchema = z.object({
  estimated_tax: z.number(),
  miles_by_state: z.record(z.number()),
  tax_rate_by_state: z.record(z.number()),
});

// Main dashboard stats schema
export const DashboardStatsSchema = z.object({
  data: z.object({
    loads_overview: WidgetResultSchema.extend({
      data: LoadsOverviewDataSchema,
    }).optional(),
    revenue: WidgetResultSchema.extend({
      data: RevenueDataSchema,
    }).optional(),
    ontime: WidgetResultSchema.extend({
      data: OnTimeDataSchema,
    }).optional(),
    ar: WidgetResultSchema.extend({
      data: AccountsReceivableDataSchema,
    }).optional(),
    at_risk: WidgetResultSchema.extend({
      data: AtRiskDataSchema,
    }).optional(),
    margin: WidgetResultSchema.extend({
      data: MarginDataSchema,
    }).optional(),
    dwell: WidgetResultSchema.extend({
      data: DwellDataSchema,
    }).optional(),
    driver_availability: WidgetResultSchema.extend({
      data: DriverAvailabilityDataSchema,
    }).optional(),
    equipment_availability: WidgetResultSchema.extend({
      data: EquipmentAvailabilityDataSchema,
    }).optional(),
    miles: WidgetResultSchema.extend({
      data: MilesDataSchema,
    }).optional(),
    missing_pod: WidgetResultSchema.extend({
      data: MissingPodDataSchema,
    }).optional(),
    accessorials: WidgetResultSchema.extend({
      data: AccessorialsDataSchema,
    }).optional(),
    fuel_index: WidgetResultSchema.extend({
      data: FuelIndexDataSchema,
    }).optional(),
    ifta_estimate: WidgetResultSchema.extend({
      data: IftaEstimateDataSchema,
    }).optional(),
  }),
  meta: z.object({
    widget_count: z.number(),
    error_count: z.number().optional(),
    total_execution_time_ms: z.number(),
    date_range: DateRangeSchema,
    timings: z.record(z.string(), z.number()),
  }),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type LoadsOverviewData = z.infer<typeof LoadsOverviewDataSchema>;
export type RevenueData = z.infer<typeof RevenueDataSchema>;
export type OnTimeData = z.infer<typeof OnTimeDataSchema>;
export type AccountsReceivableData = z.infer<typeof AccountsReceivableDataSchema>;
export type AtRiskData = z.infer<typeof AtRiskDataSchema>;
export type MarginData = z.infer<typeof MarginDataSchema>;
export type DwellData = z.infer<typeof DwellDataSchema>;
export type DriverAvailabilityData = z.infer<typeof DriverAvailabilityDataSchema>;
export type EquipmentAvailabilityData = z.infer<typeof EquipmentAvailabilityDataSchema>;
export type MilesData = z.infer<typeof MilesDataSchema>;
export type MissingPodData = z.infer<typeof MissingPodDataSchema>;
export type AccessorialsData = z.infer<typeof AccessorialsDataSchema>;
export type FuelIndexData = z.infer<typeof FuelIndexDataSchema>;
export type IftaEstimateData = z.infer<typeof IftaEstimateDataSchema>;

// Filter types
export type DateRangeFilter = "today" | "7d" | "mtd" | "custom";

export interface DashboardFilters {
  dateRange: DateRangeFilter;
  customDateRange?: {
    from: string;
    to: string;
  };
  customerId?: string;
}

// Dashboard preferences types
export interface DashboardPreferences {
  hidden_widgets: string[];
  widget_order: string[];
  available_widgets: string[];
}

export const DashboardPreferencesSchema = z.object({
  hidden_widgets: z.array(z.string()),
  widget_order: z.array(z.string()),
  available_widgets: z.array(z.string()),
});

// Widget configuration
export interface WidgetConfig {
  key: string;
  title: string;
  group: "ops" | "finance";
  hasChart?: boolean;
  linkPattern?: string; // e.g., "/loads?status={status}&from={from}&to={to}"
}

export const WIDGET_CONFIGS: Record<string, WidgetConfig> = {
  loads_overview: {
    key: "loads_overview",
    title: "Loads Overview",
    group: "ops",
    hasChart: false,
    linkPattern: "/loads?status={status}&from={from}&to={to}",
  },
  revenue: {
    key: "revenue",
    title: "Revenue",
    group: "finance",
    hasChart: true,
  },
  ontime: {
    key: "ontime",
    title: "On-Time Performance",
    group: "ops",
    hasChart: true,
  },
  ar: {
    key: "ar",
    title: "Accounts Receivable",
    group: "finance",
    hasChart: true,
  },
  at_risk: {
    key: "at_risk",
    title: "At-Risk Loads",
    group: "ops",
    hasChart: false,
    linkPattern: "/loads?status=in_transit&at_risk=true&from={from}&to={to}",
  },
  margin: {
    key: "margin",
    title: "Margin Analysis",
    group: "finance",
    hasChart: true,
  },
  dwell: {
    key: "dwell",
    title: "Dwell Times",
    group: "ops",
    hasChart: true,
  },
  driver_availability: {
    key: "driver_availability",
    title: "Driver Availability",
    group: "ops",
    hasChart: true,
  },
  equipment_availability: {
    key: "equipment_availability",
    title: "Equipment Availability",
    group: "ops",
    hasChart: true,
  },
  miles: {
    key: "miles",
    title: "Miles Tracking",
    group: "ops",
    hasChart: true,
  },
  missing_pod: {
    key: "missing_pod",
    title: "Missing POD",
    group: "ops",
    hasChart: false,
    linkPattern: "/loads?missing_pod=true&from={from}&to={to}",
  },
  accessorials: {
    key: "accessorials",
    title: "Accessorial Charges",
    group: "finance",
    hasChart: true,
  },
  fuel_index: {
    key: "fuel_index",
    title: "Fuel Index",
    group: "finance",
    hasChart: true,
  },
  ifta_estimate: {
    key: "ifta_estimate",
    title: "IFTA Estimate",
    group: "finance",
    hasChart: true,
  },
};