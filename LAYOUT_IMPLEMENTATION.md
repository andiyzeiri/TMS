# Role-Aware Layout Implementation

## Overview

A comprehensive role-based navigation system for the TMS Next.js application with:
- Role-aware sidebar with permission-based visibility
- Responsive design with mobile support
- Keyboard navigation and accessibility
- Prefetch-on-hover optimization
- Comprehensive test coverage

## Components Created

### 1. Layout Components

```typescript
src/components/layout/
├── Sidebar.tsx           # Role-aware navigation sidebar
├── Topbar.tsx            # Application header with user actions
├── PageContainer.tsx     # Main content wrapper
└── __tests__/
    └── sidebar.test.tsx  # Comprehensive test suite
```

### 2. Hooks & Configuration

```typescript
src/hooks/use-permissions.ts  # React Query hook for user permissions
src/config/routes.ts          # Route configuration with permissions
```

### 3. Layout Integration

```typescript
src/app/(auth)/layout.tsx     # Auth layout wrapper
```

## Features Implemented

### ✅ Role-Based Visibility

Menu items are shown/hidden based on user permissions:

- **Always visible**: Dashboard
- **Operations (`view:ops`)**: Loads, Drivers, Fleet, Customers
- **Finance (`view:finance`)**: Paycheck, Accounting, Invoices
- **Admin (`admin:*`)**: API Connections, Settings

### ✅ Responsive Design

- **Desktop (≥1024px)**: Full sidebar with collapse toggle
- **Mobile (<1024px)**: Overlay sidebar with backdrop
- **Smooth transitions** and animations

### ✅ Keyboard Navigation

- **Arrow Up/Down**: Navigate between menu items
- **Enter**: Activate focused item
- **Escape**: Close sidebar/lose focus
- **Tab**: Standard tab navigation

### ✅ Accessibility Features

- ARIA labels and roles
- `aria-current` for active page
- Screen reader support
- Focus management
- Keyboard shortcuts

### ✅ Performance Optimizations

- **Prefetch on hover** for route optimization
- **React Query caching** for permissions
- **Minimal re-renders** with proper memoization

## Usage

### 1. Wrap Pages in Auth Layout

Move pages to the `(auth)` route group:

```bash
# Example: Move dashboard
mkdir -p src/app/(auth)/dashboard
mv src/app/dashboard/page.tsx src/app/(auth)/dashboard/
```

### 2. Permission Configuration

Define route permissions in `src/config/routes.ts`:

```typescript
{
  id: 'loads',
  label: 'Loads',
  href: '/loads',
  icon: Truck,
  requiredPermissions: ['view:ops'],
}
```

### 3. API Integration

Ensure your `/me` endpoint returns:

```typescript
{
  id: string;
  username: string;
  permissions: string[]; // e.g., ['view:ops', 'view:finance', 'admin:*']
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- --testPathPatterns=sidebar.test.tsx
```

### Test Coverage

- ✅ Permission-based visibility (5 test cases)
- ✅ Loading states
- ✅ Keyboard navigation (3 scenarios)
- ✅ Accessibility compliance (3 checks)
- ✅ Responsive behavior (2 cases)

## Styling

Uses shadcn/ui classes with Tailwind CSS:

- **Colors**: `bg-background`, `text-foreground`, `hover:bg-accent`
- **Spacing**: Consistent padding and margins
- **Transitions**: Smooth hover and focus states
- **Responsive**: Mobile-first breakpoints

## Next Steps

1. **Move existing pages** to `(auth)` layout
2. **Implement logout** functionality in Topbar
3. **Add search** functionality
4. **Configure prefetch** strategies for your data fetching
5. **Customize styling** to match your brand

## File Structure After Implementation

```
src/
├── app/
│   ├── (auth)/                 # Protected routes
│   │   ├── layout.tsx         # Main layout wrapper
│   │   └── dashboard/         # Example moved page
│   └── login/                 # Public routes (outside auth)
├── components/layout/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── PageContainer.tsx
│   └── __tests__/
├── hooks/
│   └── use-permissions.ts
└── config/
    └── routes.ts
```

## Permission Examples

```typescript
// Full access user
permissions: ['view:ops', 'view:finance', 'admin:*']

// Operations user
permissions: ['view:ops']

// Finance user
permissions: ['view:finance']

// Basic user (dashboard only)
permissions: []
```

This implementation provides a solid foundation for role-based access control in your TMS application with excellent user experience and accessibility support.