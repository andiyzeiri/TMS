"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Load {
  id: string;
  load_number: string;
  status: string;
  customer_name: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  pickup_date: string | null;
  delivery_date: string | null;
  rate: number | null;
  driver?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export type SortField = 'load_number' | 'status' | 'customer_name' | 'pickup_date' | 'delivery_date' | 'rate' | 'created_at';
export type SortOrder = 'asc' | 'desc';

interface LoadsTableProps {
  loads: Load[];
  isLoading?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort: (field: SortField) => void;
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    in_transit: "bg-green-100 text-green-800 border-green-200",
    delivered: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function SortableHeader({
  field,
  currentField,
  currentOrder,
  onSort,
  children
}: {
  field: SortField;
  currentField?: SortField;
  currentOrder?: SortOrder;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = currentField === field;

  return (
    <Button
      variant="ghost"
      className="h-auto p-0 hover:bg-transparent font-medium justify-start"
      onClick={() => onSort(field)}
    >
      <span className="mr-2">{children}</span>
      {isActive ? (
        currentOrder === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

function LoadsTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Load #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LoadsTable({
  loads,
  isLoading = false,
  sortField,
  sortOrder,
  onSort
}: LoadsTableProps) {
  if (isLoading) {
    return <LoadsTableSkeleton />;
  }

  if (loads.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No loads found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or create a new load to get started.
        </p>
        <Button asChild>
          <Link href="/loads/new">Create Load</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <SortableHeader
                field="load_number"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Load #
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                field="status"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Status
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                field="customer_name"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Customer
              </SortableHeader>
            </TableHead>
            <TableHead>Route</TableHead>
            <TableHead>
              <SortableHeader
                field="pickup_date"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Pickup
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                field="delivery_date"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Delivery
              </SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader
                field="rate"
                currentField={sortField}
                currentOrder={sortOrder}
                onSort={onSort}
              >
                Rate
              </SortableHeader>
            </TableHead>
            <TableHead>Driver</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loads.map((load) => (
            <TableRow key={load.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <Link
                  href={`/loads/${load.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {load.load_number}
                </Link>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(load.status)} variant="outline">
                  {formatStatus(load.status)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{load.customer_name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1 text-green-600" />
                    {load.origin_city}, {load.origin_state}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1 text-red-600" />
                    {load.destination_city}, {load.destination_state}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {load.pickup_date ? (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    {format(new Date(load.pickup_date), "MMM dd, yyyy")}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">TBD</span>
                )}
              </TableCell>
              <TableCell>
                {load.delivery_date ? (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    {format(new Date(load.delivery_date), "MMM dd, yyyy")}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">TBD</span>
                )}
              </TableCell>
              <TableCell>
                {load.rate ? (
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                    {load.rate.toLocaleString()}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">TBD</span>
                )}
              </TableCell>
              <TableCell>
                {load.driver ? (
                  <div className="flex items-center text-sm">
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                    {load.driver.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/loads/${load.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View load details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}