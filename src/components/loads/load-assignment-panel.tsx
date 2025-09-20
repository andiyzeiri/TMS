"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Truck,
  Trailer,
  Edit3,
  Check,
  X,
  Phone,
  MapPin,
  Settings,
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
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  license_number?: string;
  status: 'available' | 'assigned' | 'unavailable';
  current_location?: string;
}

interface Equipment {
  id: string;
  number: string;
  type: string;
  status: 'available' | 'assigned' | 'maintenance';
  location?: string;
}

interface LoadAssignment {
  driver?: Driver;
  tractor?: Equipment;
  trailer?: Equipment;
}

interface LoadAssignmentPanelProps {
  loadId: string;
  assignment: LoadAssignment;
  onAssignmentUpdate?: (assignment: LoadAssignment) => void;
  canEdit?: boolean;
}

function AssignmentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function LoadAssignmentPanel({
  loadId,
  assignment,
  onAssignmentUpdate,
  canEdit = true,
}: LoadAssignmentPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(assignment.driver?.id || "");
  const [selectedTractor, setSelectedTractor] = useState(assignment.tractor?.id || "");
  const [selectedTrailer, setSelectedTrailer] = useState(assignment.trailer?.id || "");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available drivers
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => apiClient.getDrivers({ status: 'available' }),
    enabled: isEditing,
  });

  // Fetch available tractors
  const { data: tractors, isLoading: tractorsLoading } = useQuery({
    queryKey: ['tractors', 'available'],
    queryFn: () => apiClient.getTractors({ status: 'available' }),
    enabled: isEditing,
  });

  // Fetch available trailers
  const { data: trailers, isLoading: trailersLoading } = useQuery({
    queryKey: ['trailers', 'available'],
    queryFn: () => apiClient.getTrailers({ status: 'available' }),
    enabled: isEditing,
  });

  const assignmentMutation = useMutation({
    mutationFn: (data: {
      driver_id?: string;
      tractor_id?: string;
      trailer_id?: string;
    }) => apiClient.updateLoadAssignment(loadId, data),
    onSuccess: (data) => {
      toast({
        title: "Assignment Updated",
        description: "Load assignment has been successfully updated",
      });
      setIsEditing(false);
      onAssignmentUpdate?.(data);
      queryClient.invalidateQueries({ queryKey: ["load", loadId] });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to update load assignment",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    assignmentMutation.mutate({
      driver_id: selectedDriver || undefined,
      tractor_id: selectedTractor || undefined,
      trailer_id: selectedTrailer || undefined,
    });
  };

  const handleCancel = () => {
    setSelectedDriver(assignment.driver?.id || "");
    setSelectedTractor(assignment.tractor?.id || "");
    setSelectedTrailer(assignment.trailer?.id || "");
    setIsEditing(false);
  };

  const isLoading = driversLoading || tractorsLoading || trailersLoading;
  const isAssignmentComplete = assignment.driver && assignment.tractor;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Load Assignment
              {isAssignmentComplete && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Complete
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Assign driver, tractor, and trailer to this load
            </CardDescription>
          </div>
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {isLoading ? (
              <AssignmentSkeleton />
            ) : (
              <>
                {/* Driver Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Driver
                  </label>
                  <Select
                    value={selectedDriver}
                    onValueChange={setSelectedDriver}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No driver assigned</SelectItem>
                      {drivers?.map((driver: Driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{driver.name}</span>
                            <Badge
                              variant={driver.status === 'available' ? 'outline' : 'secondary'}
                              className="ml-2"
                            >
                              {driver.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tractor Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Tractor
                  </label>
                  <Select
                    value={selectedTractor}
                    onValueChange={setSelectedTractor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tractor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No tractor assigned</SelectItem>
                      {tractors?.map((tractor: Equipment) => (
                        <SelectItem key={tractor.id} value={tractor.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{tractor.number} ({tractor.type})</span>
                            <Badge
                              variant={tractor.status === 'available' ? 'outline' : 'secondary'}
                              className="ml-2"
                            >
                              {tractor.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trailer Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Trailer className="h-4 w-4" />
                    Trailer
                  </label>
                  <Select
                    value={selectedTrailer}
                    onValueChange={setSelectedTrailer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trailer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No trailer assigned</SelectItem>
                      {trailers?.map((trailer: Equipment) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{trailer.number} ({trailer.type})</span>
                            <Badge
                              variant={trailer.status === 'available' ? 'outline' : 'secondary'}
                              className="ml-2"
                            >
                              {trailer.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={assignmentMutation.isPending}
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                {assignmentMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={assignmentMutation.isPending}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Driver Display */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Driver</p>
                  {assignment.driver ? (
                    <div>
                      <p className="text-sm font-medium">{assignment.driver.name}</p>
                      {assignment.driver.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {assignment.driver.phone}
                          </span>
                        </div>
                      )}
                      {assignment.driver.current_location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {assignment.driver.current_location}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </div>
              {assignment.driver && (
                <Badge
                  variant={assignment.driver.status === 'available' ? 'outline' : 'secondary'}
                >
                  {assignment.driver.status}
                </Badge>
              )}
            </div>

            {/* Tractor Display */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Tractor</p>
                  {assignment.tractor ? (
                    <div>
                      <p className="text-sm font-medium">
                        {assignment.tractor.number} ({assignment.tractor.type})
                      </p>
                      {assignment.tractor.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {assignment.tractor.location}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </div>
              {assignment.tractor && (
                <Badge
                  variant={assignment.tractor.status === 'available' ? 'outline' : 'secondary'}
                >
                  {assignment.tractor.status}
                </Badge>
              )}
            </div>

            {/* Trailer Display */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Trailer className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Trailer</p>
                  {assignment.trailer ? (
                    <div>
                      <p className="text-sm font-medium">
                        {assignment.trailer.number} ({assignment.trailer.type})
                      </p>
                      {assignment.trailer.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {assignment.trailer.location}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </div>
              {assignment.trailer && (
                <Badge
                  variant={assignment.trailer.status === 'available' ? 'outline' : 'secondary'}
                >
                  {assignment.trailer.status}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}