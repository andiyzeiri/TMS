"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Filter, X, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

export interface LoadsFilters {
  search?: string;
  status?: string;
  customer?: string;
  pickupDateFrom?: string;
  pickupDateTo?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  origin?: string;
  destination?: string;
}

interface LoadsFiltersProps {
  filters: LoadsFilters;
  onFiltersChange: (filters: LoadsFilters) => void;
  onClearFilters: () => void;
  customers: string[];
  isLoading?: boolean;
}

const LOAD_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function LoadsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  customers,
  isLoading = false,
}: LoadsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickupDateFrom, setPickupDateFrom] = useState<Date | undefined>(
    filters.pickupDateFrom ? new Date(filters.pickupDateFrom) : undefined
  );
  const [pickupDateTo, setPickupDateTo] = useState<Date | undefined>(
    filters.pickupDateTo ? new Date(filters.pickupDateTo) : undefined
  );

  const handleFilterChange = (key: keyof LoadsFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleDateChange = (type: 'pickupDateFrom' | 'pickupDateTo', date: Date | undefined) => {
    if (type === 'pickupDateFrom') {
      setPickupDateFrom(date);
    } else {
      setPickupDateTo(date);
    }

    onFiltersChange({
      ...filters,
      [type]: date ? format(date, "yyyy-MM-dd") : undefined,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value.length > 0).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search loads by number, customer, or location..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {LOAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClearFilters();
                        setPickupDateFrom(undefined);
                        setPickupDateTo(undefined);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Customer Filter */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={filters.customer || "all"}
                    onValueChange={(value) => handleFilterChange("customer", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pickup Date Range */}
                <div className="space-y-2">
                  <Label>Pickup Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {pickupDateFrom ? format(pickupDateFrom, "MMM dd") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={pickupDateFrom}
                          onSelect={(date) => handleDateChange('pickupDateFrom', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {pickupDateTo ? format(pickupDateTo, "MMM dd") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={pickupDateTo}
                          onSelect={(date) => handleDateChange('pickupDateTo', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Origin & Destination */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <Input
                      placeholder="Origin city/state"
                      value={filters.origin || ""}
                      onChange={(e) => handleFilterChange("origin", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Input
                      placeholder="Destination city/state"
                      value={filters.destination || ""}
                      onChange={(e) => handleFilterChange("destination", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {LOAD_STATUSES.find(s => s.value === filters.status)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange("status", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.customer && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Customer: {filters.customer}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange("customer", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.pickupDateFrom || filters.pickupDateTo) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Pickup: {filters.pickupDateFrom || "Any"} - {filters.pickupDateTo || "Any"}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  handleFilterChange("pickupDateFrom", undefined);
                  handleFilterChange("pickupDateTo", undefined);
                  setPickupDateFrom(undefined);
                  setPickupDateTo(undefined);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.origin && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {filters.origin}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange("origin", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.destination && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {filters.destination}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange("destination", undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}