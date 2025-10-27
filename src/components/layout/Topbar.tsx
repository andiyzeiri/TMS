'use client';

import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';

interface TopbarProps {
  onToggleSidebar?: () => void;
  className?: string;
}

export function Topbar({ onToggleSidebar, className }: TopbarProps) {
  const { permissions, isLoading } = usePermissions();

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
  };

  const handleProfileClick = () => {
    // Navigate to profile or show profile menu
    console.log('Profile clicked');
  };

  const handleSearchClick = () => {
    // Implement search functionality
    console.log('Search clicked');
  };

  const handleNotificationsClick = () => {
    // Show notifications
    console.log('Notifications clicked');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4',
        className
      )}
    >
      {/* Left side - Mobile menu button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleSearchClick}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <button
          onClick={handleNotificationsClick}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Notification badge - you can add logic to show unread count */}
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-xs flex items-center justify-center">
            <span className="sr-only">Unread notifications</span>
          </span>
        </button>

        {/* User menu */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleProfileClick}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="User profile"
            disabled={isLoading}
          >
            <User className="h-4 w-4" />
          </button>

          {/* User info - shown on larger screens */}
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {isLoading ? 'Loading...' : 'John Doe'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {isLoading ? '' : `${permissions.length} permissions`}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}