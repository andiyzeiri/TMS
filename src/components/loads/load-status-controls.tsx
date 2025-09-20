"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

export type LoadStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

interface StatusTransition {
  from: LoadStatus[];
  to: LoadStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'success';
  requiresConfirmation?: boolean;
}

const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: ['pending'],
    to: 'assigned',
    label: 'Assign Load',
    description: 'Assign driver and equipment',
    icon: <Truck className="h-4 w-4" />,
    variant: 'default',
  },
  {
    from: ['assigned'],
    to: 'in_transit',
    label: 'Start Transit',
    description: 'Load is picked up and in transit',
    icon: <MapPin className="h-4 w-4" />,
    variant: 'default',
  },
  {
    from: ['in_transit'],
    to: 'delivered',
    label: 'Mark Delivered',
    description: 'Load has been delivered',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'success',
  },
  {
    from: ['pending', 'assigned'],
    to: 'cancelled',
    label: 'Cancel Load',
    description: 'Cancel this load',
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: 'destructive',
    requiresConfirmation: true,
  },
];

const getStatusColor = (status: LoadStatus) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    in_transit: "bg-green-100 text-green-800 border-green-200",
    delivered: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatStatus = (status: LoadStatus) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface LoadStatusControlsProps {
  loadId: string;
  currentStatus: LoadStatus;
  onStatusChange?: (status: LoadStatus) => void;
  canEdit?: boolean;
}

export function LoadStatusControls({
  loadId,
  currentStatus,
  onStatusChange,
  canEdit = true,
}: LoadStatusControlsProps) {
  const [optimisticStatus, setOptimisticStatus] = useState<LoadStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (newStatus: LoadStatus) =>
      apiClient.updateLoadStatus(loadId, newStatus),
    onMutate: async (newStatus: LoadStatus) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['load', loadId] });

      // Snapshot the previous value
      const previousLoad = queryClient.getQueryData(['load', loadId]);

      // Optimistically update status
      setOptimisticStatus(newStatus);
      setIsUpdating(true);

      // Update the cache optimistically
      queryClient.setQueryData(['load', loadId], (old: any) => ({
        ...old,
        status: newStatus,
      }));

      // Return a context object with the snapshotted value
      return { previousLoad };
    },
    onSuccess: (data, newStatus) => {
      toast({
        title: "Status Updated",
        description: `Load status changed to ${formatStatus(newStatus)}`,
      });

      // Clear optimistic state
      setOptimisticStatus(null);
      setIsUpdating(false);

      // Update cache with real data
      queryClient.setQueryData(['load', loadId], data);
      onStatusChange?.(newStatus);

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
    onError: (error: any, newStatus, context) => {
      // Revert optimistic update
      if (context?.previousLoad) {
        queryClient.setQueryData(['load', loadId], context.previousLoad);
      }

      setOptimisticStatus(null);
      setIsUpdating(false);

      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update load status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
    },
  });

  const handleStatusChange = (newStatus: LoadStatus, requiresConfirmation?: boolean) => {
    if (requiresConfirmation) {
      const confirmed = confirm(
        `Are you sure you want to ${newStatus === 'cancelled' ? 'cancel' : 'update'} this load?`
      );
      if (!confirmed) return;
    }

    statusMutation.mutate(newStatus);
  };

  // Use optimistic status if available, otherwise current status
  const displayStatus = optimisticStatus || currentStatus;

  // Get available transitions for current status
  const availableTransitions = STATUS_TRANSITIONS.filter(transition =>
    transition.from.includes(currentStatus)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Load Status
            </CardTitle>
            <CardDescription>
              Current status and available actions
            </CardDescription>
          </div>

          {/* Current Status Badge */}
          <Badge className={getStatusColor(displayStatus)} variant="outline">
            <div className="flex items-center gap-1">
              {isUpdating && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
              )}
              {formatStatus(displayStatus)}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {canEdit && availableTransitions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Available status changes:
            </p>

            {availableTransitions.length === 1 ? (
              /* Single action button */
              <Button
                onClick={() => handleStatusChange(
                  availableTransitions[0].to,
                  availableTransitions[0].requiresConfirmation
                )}
                disabled={statusMutation.isPending}
                variant={availableTransitions[0].variant}
                className="w-full"
              >
                {availableTransitions[0].icon}
                <span className="ml-2">
                  {statusMutation.isPending ? 'Updating...' : availableTransitions[0].label}
                </span>
              </Button>
            ) : (
              /* Dropdown menu for multiple actions */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={statusMutation.isPending}
                  >
                    {statusMutation.isPending ? 'Updating...' : 'Update Status'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {availableTransitions.map((transition, index) => (
                    <div key={transition.to}>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(
                          transition.to,
                          transition.requiresConfirmation
                        )}
                        className="flex flex-col items-start gap-1 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {transition.icon}
                          <span className="font-medium">{transition.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {transition.description}
                        </span>
                      </DropdownMenuItem>
                      {index < availableTransitions.length - 1 && (
                        <DropdownMenuSeparator />
                      )}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Status progression indicator */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Status progression:</p>
              <div className="flex items-center gap-2 text-xs">
                {(['pending', 'assigned', 'in_transit', 'delivered'] as LoadStatus[]).map((status, index, array) => (
                  <div key={status} className="flex items-center">
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        status === displayStatus
                          ? 'bg-blue-100 text-blue-800'
                          : array.indexOf(displayStatus) > index
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {formatStatus(status)}
                    </div>
                    {index < array.length - 1 && (
                      <div className="mx-1 text-gray-400">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!canEdit && (
          <p className="text-sm text-muted-foreground">
            You don't have permission to change the load status.
          </p>
        )}

        {canEdit && availableTransitions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No status changes available for {formatStatus(currentStatus)} loads.
          </p>
        )}
      </CardContent>
    </Card>
  );
}