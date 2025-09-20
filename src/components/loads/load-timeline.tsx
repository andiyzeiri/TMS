"use client";

import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Truck,
  FileText,
  DollarSign,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'assignment' | 'document' | 'location' | 'payment' | 'note';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
  metadata?: {
    from_status?: string;
    to_status?: string;
    driver_name?: string;
    document_type?: string;
    location?: string;
    amount?: number;
    [key: string]: any;
  };
}

interface LoadTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const getEventIcon = (type: TimelineEvent['type']) => {
  const iconProps = { className: "h-4 w-4" };

  switch (type) {
    case 'status_change':
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'assignment':
      return <User {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'document':
      return <FileText {...iconProps} className="h-4 w-4 text-purple-600" />;
    case 'location':
      return <MapPin {...iconProps} className="h-4 w-4 text-orange-600" />;
    case 'payment':
      return <DollarSign {...iconProps} className="h-4 w-4 text-green-600" />;
    default:
      return <Clock {...iconProps} className="h-4 w-4 text-gray-600" />;
  }
};

const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'status_change':
      return 'bg-green-100 border-green-200';
    case 'assignment':
      return 'bg-blue-100 border-blue-200';
    case 'document':
      return 'bg-purple-100 border-purple-200';
    case 'location':
      return 'bg-orange-100 border-orange-200';
    case 'payment':
      return 'bg-green-100 border-green-200';
    default:
      return 'bg-gray-100 border-gray-200';
  }
};

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadTimeline({ events, isLoading = false }: LoadTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Track all events and updates for this load
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Track all events and updates for this load
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          Track all events and updates for this load
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Event icon */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background
                  ${getEventColor(event.type)}
                `}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}

                      {/* Event-specific metadata */}
                      {event.type === 'status_change' && event.metadata?.from_status && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {event.metadata.from_status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-xs">
                            {event.metadata.to_status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}

                      {event.type === 'assignment' && event.metadata?.driver_name && (
                        <div className="flex items-center gap-2 mt-2">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Assigned to: {event.metadata.driver_name}
                          </span>
                        </div>
                      )}

                      {event.type === 'document' && event.metadata?.document_type && (
                        <div className="flex items-center gap-2 mt-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Document: {event.metadata.document_type}
                          </span>
                        </div>
                      )}

                      {event.type === 'location' && event.metadata?.location && (
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Location: {event.metadata.location}
                          </span>
                        </div>
                      )}

                      {event.type === 'payment' && event.metadata?.amount && (
                        <div className="flex items-center gap-2 mt-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Amount: ${event.metadata.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs text-muted-foreground ml-4">
                      <div>{format(new Date(event.timestamp), 'MMM dd, yyyy')}</div>
                      <div>{format(new Date(event.timestamp), 'h:mm a')}</div>
                    </div>
                  </div>

                  {event.user && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>by {event.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}