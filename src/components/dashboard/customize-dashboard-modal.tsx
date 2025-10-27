"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Settings, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { WIDGET_CONFIGS } from "@/types/dashboard";
import type { DashboardPreferences } from "@/types/dashboard";

interface SortableWidgetItemProps {
  id: string;
  widget: {
    key: string;
    title: string;
    group: "ops" | "finance";
    isVisible: boolean;
  };
  onToggleVisibility: (key: string) => void;
}

function SortableWidgetItem({ id, widget, onToggleVisibility }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const groupColorMap = {
    ops: "text-blue-600 bg-blue-50",
    finance: "text-green-600 bg-green-50",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        isDragging ? "shadow-lg opacity-80" : "shadow-sm"
      }`}
      role="listitem"
      aria-label={`${widget.title} widget - ${widget.isVisible ? 'visible' : 'hidden'}`}
    >
      {/* Drag handle */}
      <button
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${widget.title}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Widget info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{widget.title}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${groupColorMap[widget.group]}`}>
            {widget.group}
          </span>
        </div>
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`widget-${widget.key}`}
          checked={widget.isVisible}
          onCheckedChange={() => onToggleVisibility(widget.key)}
          aria-label={`${widget.isVisible ? 'Hide' : 'Show'} ${widget.title} widget`}
        />
        <label
          htmlFor={`widget-${widget.key}`}
          className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
        >
          {widget.isVisible ? (
            <>
              <Eye className="h-4 w-4" />
              Visible
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              Hidden
            </>
          )}
        </label>
      </div>
    </div>
  );
}

interface CustomizeDashboardModalProps {
  children?: React.ReactNode;
}

export function CustomizeDashboardModal({ children }: CustomizeDashboardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch current preferences
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = useQuery({
    queryKey: ["dashboard", "preferences"],
    queryFn: () => apiClient.getDashboardPreferences(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Local state for managing changes
  const [localWidgetOrder, setLocalWidgetOrder] = useState<string[]>([]);
  const [localHiddenWidgets, setLocalHiddenWidgets] = useState<Set<string>>(new Set());

  // Initialize local state when preferences load
  React.useEffect(() => {
    if (preferences) {
      setLocalWidgetOrder(preferences.widget_order || []);
      setLocalHiddenWidgets(new Set(preferences.hidden_widgets || []));
    }
  }, [preferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: (data: { hidden_widgets: string[]; widget_order: string[] }) =>
      apiClient.updateDashboardPreferences(data),
    onSuccess: () => {
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "Dashboard customized",
        description: "Your dashboard layout has been saved.",
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to save dashboard preferences";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggleVisibility = (widgetKey: string) => {
    setLocalHiddenWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetKey)) {
        next.delete(widgetKey);
      } else {
        next.add(widgetKey);
      }
      return next;
    });
  };

  const handleSave = () => {
    saveMutation.mutate({
      hidden_widgets: Array.from(localHiddenWidgets),
      widget_order: localWidgetOrder,
    });
  };

  const hasChanges = React.useMemo(() => {
    if (!preferences) return false;

    const originalHidden = new Set(preferences.hidden_widgets || []);
    const originalOrder = preferences.widget_order || [];

    const hiddenChanged =
      originalHidden.size !== localHiddenWidgets.size ||
      [...originalHidden].some(w => !localHiddenWidgets.has(w));

    const orderChanged =
      originalOrder.length !== localWidgetOrder.length ||
      originalOrder.some((w, i) => w !== localWidgetOrder[i]);

    return hiddenChanged || orderChanged;
  }, [preferences, localHiddenWidgets, localWidgetOrder]);

  // Prepare widget data for display
  const widgets = React.useMemo(() => {
    if (!preferences) return [];

    return localWidgetOrder.map((key) => {
      const config = WIDGET_CONFIGS[key];
      return {
        key,
        title: config?.title || key,
        group: config?.group || "ops" as const,
        isVisible: !localHiddenWidgets.has(key),
      };
    });
  }, [localWidgetOrder, localHiddenWidgets, preferences]);

  const resetToDefaults = () => {
    if (preferences) {
      setLocalWidgetOrder(preferences.available_widgets || []);
      setLocalHiddenWidgets(new Set());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Customize
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-labelledby="customize-dialog-title"
        aria-describedby="customize-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="customize-dialog-title">Customize Dashboard</DialogTitle>
          <DialogDescription id="customize-dialog-description">
            Drag to reorder widgets and use checkboxes to show or hide them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {preferencesLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading preferences...</div>
            </div>
          )}

          {preferencesError && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-red-600">
                Failed to load dashboard preferences. Please try again.
              </div>
            </div>
          )}

          {preferences && widgets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {widgets.filter(w => w.isVisible).length} of {widgets.length} widgets visible
                </p>
                <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                  Reset to defaults
                </Button>
              </div>

              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={localWidgetOrder} strategy={verticalListSortingStrategy}>
                    <div
                      className="space-y-2"
                      role="list"
                      aria-label="Dashboard widgets list"
                    >
                      {widgets.map((widget) => (
                        <SortableWidgetItem
                          key={widget.key}
                          id={widget.key}
                          widget={widget}
                          onToggleVisibility={handleToggleVisibility}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {hasChanges && "You have unsaved changes"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}