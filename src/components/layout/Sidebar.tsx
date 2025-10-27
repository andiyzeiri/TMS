'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { routeConfig, getVisibleRoutes } from '@/config/routes';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyPermission, isLoading } = usePermissions();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const visibleRoutes = getVisibleRoutes(routeConfig, hasAnyPermission);

  // Prefetch data for routes on hover
  const prefetchRoute = (href: string) => {
    // This would typically prefetch the page data
    // Implementation depends on your data fetching strategy
    console.log(`Prefetching route: ${href}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (visibleRoutes.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev < visibleRoutes.length - 1 ? prev + 1 : 0;
          itemRefs.current[nextIndex]?.focus();
          return nextIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev > 0 ? prev - 1 : visibleRoutes.length - 1;
          itemRefs.current[nextIndex]?.focus();
          return nextIndex;
        });
        break;
      case 'Enter':
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
          itemRefs.current[focusedIndex]?.click();
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        sidebarRef.current?.blur();
        break;
    }
  };

  // Reset focus when routes change
  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = itemRefs.current.slice(0, visibleRoutes.length);
  }, [visibleRoutes.length]);

  if (isLoading) {
    return (
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          collapsed && 'lg:w-16',
          className
        )}
      >
        <div className="flex h-16 items-center justify-center border-b">
          <div className="h-6 w-6 animate-pulse bg-muted rounded" />
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse bg-muted rounded-md" />
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        collapsed && 'lg:w-16',
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn('flex items-center space-x-2', collapsed && 'lg:justify-center')}>
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TMS</span>
          </div>
          {!collapsed && (
            <h2 className="text-lg font-semibold text-foreground">Transport MS</h2>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent',
            collapsed && 'rotate-180'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {visibleRoutes.map((route, index) => {
          const Icon = route.icon;
          const isActive = pathname === route.href || pathname.startsWith(route.href + '/');

          return (
            <Link
              key={route.id}
              href={route.href}
              ref={el => (itemRefs.current[index] = el)}
              onMouseEnter={() => prefetchRoute(route.href)}
              onFocus={() => setFocusedIndex(index)}
              className={cn(
                'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                isActive && 'bg-accent text-accent-foreground',
                collapsed && 'lg:justify-center lg:px-2'
              )}
              aria-label={route.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && (
                <span className="truncate">{route.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile overlay toggle */}
      <div className="lg:hidden">
        <button
          onClick={onToggleCollapse}
          className="absolute -right-12 top-4 flex h-10 w-10 items-center justify-center rounded-r-md bg-background border border-l-0 shadow-sm"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}