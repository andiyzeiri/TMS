# TMS Frontend - Transportation Management System

A modern, responsive web application built with Next.js 14, TypeScript, and Tailwind CSS for managing transportation operations.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with httpOnly cookies and refresh tokens
- **Load Management**: Complete CRUD operations with status tracking and document upload
- **Customer Management**: Comprehensive customer database with search and filtering
- **Order Management**: Create and manage transportation orders
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Optimistic updates with React Query
- **File Upload**: Direct S3 upload with progress indicators
- **Professional UI**: Built with shadcn/ui components

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Playwright E2E tests
- **Authentication**: JWT with httpOnly cookies

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── loads/             # Load management pages
│   ├── customers/         # Customer management
│   ├── orders/            # Order management
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities and API client
├── providers/             # React providers
└── types/                 # TypeScript type definitions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- TMS API backend running (see backend README)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd tms-frontend
   npm install
   ```

2. **Configure environment**:
   ```bash
   # Create .env.local with your API URL
   echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" > .env.local
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests headless
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

### Test Coverage

The E2E tests cover:
- ✅ Authentication flow
- ✅ Load management (list, detail, status updates)
- ✅ Customer CRUD operations
- ✅ Order management
- ✅ Responsive design
- ✅ Navigation and routing

## 🔐 Authentication

The app uses a secure authentication system:

1. **Login**: JWT tokens stored in httpOnly cookies
2. **Auto-refresh**: Silent token refresh before expiration
3. **Route Protection**: Middleware redirects unauthenticated users
4. **Logout**: Secure token cleanup

### Login Flow

```typescript
// Default test credentials (configure in your backend)
{
  email: "admin@example.com",
  password: "password123"
}
```

## 📱 Key Features

### Load Management
- **List View**: Filterable table with pagination
- **Detail View**: Complete load information with stops timeline
- **Status Updates**: Real-time status changes with optimistic updates
- **Document Upload**: Direct S3 upload with progress tracking
- **Driver Assignment**: Assign drivers to loads

### Customer Management
- **CRUD Operations**: Create, read, update, delete customers
- **Search & Filter**: Real-time search functionality
- **Validation**: Comprehensive form validation with Zod

### Order Management
- **Order Creation**: Multi-step form with origin/destination
- **Status Tracking**: Order lifecycle management
- **Customer Integration**: Link orders to customers

## 🎨 UI/UX Features

### Design System
- **Consistent Components**: Using shadcn/ui for consistency
- **Dark Mode Ready**: CSS variables for theme switching
- **Responsive**: Mobile-first responsive design
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: Toast notifications for user feedback

### Mobile Experience
- **Touch-Friendly**: Optimized for mobile interactions
- **Responsive Tables**: Horizontal scroll on mobile
- **Mobile Navigation**: Collapsible sidebar menu
- **Form Optimization**: Mobile-friendly form inputs

## 🔧 Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Optional (for production)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

### API Integration

The app expects the following API endpoints:

```
POST /api/auth/login          # User authentication
POST /api/auth/refresh        # Token refresh
GET  /api/auth/me            # Current user info
GET  /api/loads              # List loads with filters
GET  /api/loads/:id          # Get load details
POST /api/loads/:id/status   # Update load status
GET  /api/customers          # List customers
POST /api/customers          # Create customer
GET  /api/orders            # List orders
POST /api/orders            # Create order
POST /api/upload/url        # Get S3 upload URL
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Vercel Deployment

This app is optimized for Vercel deployment:

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

## 🔍 Monitoring & Performance

### Built-in Features
- **React Query DevTools**: Debug API calls in development
- **Next.js Analytics**: Performance monitoring
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loaders and suspense

### Performance Optimizations
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Automatic code splitting
- **Prefetching**: Link prefetching for navigation
- **Caching**: React Query caching with stale-while-revalidate

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is part of the TMS system - see the main project license for details.

---

**Need Help?** Check the backend API documentation or open an issue for support.
# TMS
