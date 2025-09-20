"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Truck,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentStatus } from "@/components/loads/document-status";
import { LoadTimeline, type TimelineEvent } from "@/components/loads/load-timeline";
import { LoadAssignmentPanel } from "@/components/loads/load-assignment-panel";
import { LoadStatusControls, type LoadStatus } from "@/components/loads/load-status-controls";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const LOAD_STATUSES = [
  "pending",
  "assigned",
  "in_transit",
  "delivered",
  "cancelled",
];

const getStatusColor = (status: string) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_transit: "bg-green-100 text-green-800",
    delivered: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const getStopIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "in_progress":
      return <Clock className="h-5 w-5 text-blue-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
};

export default function LoadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: load, isLoading } = useQuery({
    queryKey: ["load", params.id],
    queryFn: () => apiClient.getLoad(params.id as string),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      apiClient.updateLoadStatus(params.id as string, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Load status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["load", params.id] });
      queryClient.invalidateQueries({ queryKey: ["loads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const assignmentMutation = useMutation({
    mutationFn: ({ driverId }: { driverId: string }) =>
      apiClient.assignDriver(params.id as string, driverId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Driver assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["load", params.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign driver",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    setUploadProgress(0);

    try {
      await apiClient.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!load) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900">Load not found</h1>
          <p className="text-gray-600 mt-2">The requested load could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/loads">Back to Loads</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Load {load.load_number}
            </h1>
            <p className="text-muted-foreground">
              {load.customer?.name} • {load.origin_city}, {load.origin_state} → {load.destination_city}, {load.destination_state}
            </p>
          </div>
          <div className="ml-auto">
            <Badge className={getStatusColor(load.status)}>
              {load.status?.replace("_", " ") || "Unknown"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Load Details */}
            <Card>
              <CardHeader>
                <CardTitle>Load Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Origin</p>
                        <p className="text-sm text-muted-foreground">
                          {load.origin_address}<br />
                          {load.origin_city}, {load.origin_state} {load.origin_zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pickup Date</p>
                        <p className="text-sm text-muted-foreground">
                          {load.pickup_date ? format(new Date(load.pickup_date), "MMM dd, yyyy") : "TBD"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Destination</p>
                        <p className="text-sm text-muted-foreground">
                          {load.destination_address}<br />
                          {load.destination_city}, {load.destination_state} {load.destination_zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Rate</p>
                        <p className="text-sm text-muted-foreground">
                          ${load.rate ? Number(load.rate).toLocaleString() : "TBD"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stops Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Stops Timeline</CardTitle>
                <CardDescription>
                  Track the progress of this load through each stop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {load.stops?.map((stop: any, index: number) => (
                    <div key={stop.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        {getStopIcon(stop.status)}
                        {index < load.stops.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{stop.type}</p>
                          <Badge variant="outline">
                            {stop.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {stop.address}, {stop.city}, {stop.state}
                        </p>
                        {stop.scheduled_time && (
                          <p className="text-xs text-muted-foreground">
                            Scheduled: {format(new Date(stop.scheduled_time), "MMM dd, yyyy hh:mm a")}
                          </p>
                        )}
                        {stop.actual_time && (
                          <p className="text-xs text-green-600">
                            Completed: {format(new Date(stop.actual_time), "MMM dd, yyyy hh:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <LoadTimeline
              events={[
                {
                  id: '1',
                  type: 'status_change',
                  title: 'Load created',
                  description: 'Load was created and is pending assignment',
                  timestamp: load.created_at,
                  metadata: {
                    to_status: 'pending',
                  },
                },
                // Add more timeline events based on load history
                ...(load.driver ? [{
                  id: '2',
                  type: 'assignment' as const,
                  title: 'Driver assigned',
                  description: `${load.driver.name} was assigned to this load`,
                  timestamp: load.updated_at,
                  metadata: {
                    driver_name: load.driver.name,
                  },
                }] : []),
              ]}
            />
          </div>

          <div className="space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={load.status}
                  onValueChange={(status) => statusMutation.mutate({ status })}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusMutation.isPending && (
                  <p className="text-sm text-muted-foreground">
                    Updating status...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Driver Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {load.driver ? (
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{load.driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {load.driver.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No driver assigned</p>
                    <Button size="sm" className="mt-2">
                      Assign Driver
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Controls */}
            <LoadStatusControls
              loadId={params.id as string}
              currentStatus={load.status as LoadStatus}
              onStatusChange={(newStatus) => {
                // Optimistically update load status in cache
                queryClient.setQueryData(['load', params.id], (old: any) => ({
                  ...old,
                  status: newStatus,
                }));
              }}
            />

            {/* Assignment Panel */}
            <LoadAssignmentPanel
              loadId={params.id as string}
              assignment={{
                driver: load.driver,
                tractor: load.tractor,
                trailer: load.trailer,
              }}
              onAssignmentUpdate={(assignment) => {
                queryClient.setQueryData(['load', params.id], (old: any) => ({
                  ...old,
                  ...assignment,
                }));
              }}
            />

            {/* Document Status and Upload */}
            <DocumentStatus loadId={params.id as string} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}