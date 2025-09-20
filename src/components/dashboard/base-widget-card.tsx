"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BaseWidgetCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  chart?: React.ReactNode;
  link?: {
    href: string;
    label?: string;
  };
  isLoading?: boolean;
  error?: string;
  className?: string;
  "aria-label"?: string;
}

export function BaseWidgetCard({
  title,
  value,
  subtitle,
  trend,
  chart,
  link,
  isLoading = false,
  error,
  className,
  "aria-label": ariaLabel,
}: BaseWidgetCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)} role="region" aria-label={`Loading ${title}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[100px] mb-2" />
          <Skeleton className="h-4 w-[80px] mb-4" />
          {chart && <Skeleton className="h-[200px] w-full" />}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive/20 bg-destructive/5", className)} role="region" aria-label={`Error loading ${title}`}>
        <CardHeader>
          <CardTitle className="text-destructive text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive/80">
            Failed to load data: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Format numbers with appropriate commas/decimals
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      } else if (val % 1 !== 0) {
        return val.toFixed(2);
      } else {
        return val.toLocaleString();
      }
    }
    return val;
  };

  return (
    <Card
      className={cn("relative", className)}
      role="region"
      aria-label={ariaLabel || `${title}: ${formatValue(value)}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {link && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <Link
              href={link.href}
              aria-label={link.label || `View details for ${title}`}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          <div className="text-2xl font-bold" aria-label={`Current value: ${formatValue(value)}`}>
            {formatValue(value)}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
              aria-label={`Trend: ${trend.isPositive ? "up" : "down"} ${Math.abs(trend.value)}% ${trend.label}`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" aria-hidden="true" />
              )}
              {Math.abs(trend.value).toFixed(1)}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-4">
            {subtitle}
          </p>
        )}
        {chart && (
          <div className="mt-4" role="img" aria-label={`Chart for ${title}`}>
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
}