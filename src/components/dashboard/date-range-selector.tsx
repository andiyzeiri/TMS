"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeFilter } from "@/types/dashboard";

interface DateRangeSelectorProps {
  value: {
    range: DateRangeFilter;
    customRange?: {
      from: string;
      to: string;
    };
  };
  onChange: (value: {
    range: DateRangeFilter;
    customRange?: {
      from: string;
      to: string;
    };
  }) => void;
  className?: string;
}

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "mtd", label: "Month to Date" },
  { value: "custom", label: "Custom Range" },
] as const;

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: value.customRange
      ? new Date(value.customRange.from)
      : undefined,
    to: value.customRange
      ? new Date(value.customRange.to)
      : undefined,
  });

  const handleRangeChange = (newRange: DateRangeFilter) => {
    if (newRange === "custom") {
      // If switching to custom, keep current custom range or set defaults
      onChange({
        range: newRange,
        customRange: value.customRange || {
          from: format(new Date(), "yyyy-MM-dd"),
          to: format(new Date(), "yyyy-MM-dd"),
        },
      });
    } else {
      // For preset ranges, clear custom range
      onChange({
        range: newRange,
        customRange: undefined,
      });
    }
  };

  const handleCustomDateChange = (newDate: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    setDate(newDate);

    if (newDate.from && newDate.to) {
      onChange({
        range: "custom",
        customRange: {
          from: format(newDate.from, "yyyy-MM-dd"),
          to: format(newDate.to, "yyyy-MM-dd"),
        },
      });
    }
  };

  const getDateRangeLabel = () => {
    if (value.range === "custom" && value.customRange) {
      const from = new Date(value.customRange.from);
      const to = new Date(value.customRange.to);
      return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
    }

    const option = dateRangeOptions.find(opt => opt.value === value.range);
    return option?.label || "Select range";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value.range}
        onValueChange={handleRangeChange}
      >
        <SelectTrigger
          className="w-[140px]"
          aria-label="Select date range type"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.range === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date.from && "text-muted-foreground"
              )}
              aria-label="Select custom date range"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateRangeLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={{
                from: date.from,
                to: date.to,
              }}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {value.range !== "custom" && (
        <div className="text-sm text-muted-foreground">
          {getDateRangeLabel()}
        </div>
      )}
    </div>
  );
}