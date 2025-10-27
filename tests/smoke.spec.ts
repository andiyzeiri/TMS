import { test, expect } from '@playwright/test';

// Mock API responses for testing
test.beforeEach(async ({ page }) => {
  // Mock auth endpoints
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token'
      })
    });
  });

  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      })
    });
  });

  // Mock loads endpoints
  await page.route('**/api/loads**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            load_number: 'LOAD-001',
            status: 'pending',
            origin_city: 'Los Angeles',
            origin_state: 'CA',
            destination_city: 'New York',
            destination_state: 'NY',
            pickup_date: '2024-01-15',
            rate: 5000,
            customer: { name: 'ABC Corp' },
            stops: [],
            documents: []
          }
        ],
        total: 1,
        total_pages: 1,
        page: 1,
        limit: 20
      })
    });
  });

  // Mock customers endpoints
  await page.route('**/api/customers**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            name: 'ABC Corp',
            email: 'contact@abc.com',
            phone: '555-1234',
            city: 'Los Angeles',
            state: 'CA'
          }
        ]
      })
    });
  });

  // Mock orders endpoints
  await page.route('**/api/orders**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            order_number: 'ORD-001',
            status: 'pending',
            origin_city: 'Los Angeles',
            origin_state: 'CA',
            destination_city: 'New York',
            destination_state: 'NY',
            pickup_date: '2024-01-15',
            rate: 5000,
            commodity: 'Electronics',
            customer: { name: 'ABC Corp' }
          }
        ]
      })
    });
  });
});

test('login flow works correctly', async ({ page }) => {
  await page.goto('/');

  // Should redirect to login page
  await expect(page).toHaveURL('/login');

  // Check login page elements
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();

  // Fill in login form
  await page.getByPlaceholder('Enter your email').fill('test@example.com');
  await page.getByPlaceholder('Enter your password').fill('password123');

  // Submit form
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Should redirect to loads page after successful login
  await expect(page).toHaveURL('/loads');
});

test('loads page displays correctly', async ({ page }) => {
  // Set authentication cookie to bypass login
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  await page.goto('/loads');

  // Check page header
  await expect(page.getByRole('heading', { name: 'Loads' })).toBeVisible();
  await expect(page.getByText('Manage and track your transportation loads')).toBeVisible();

  // Check filters section
  await expect(page.getByText('Filters')).toBeVisible();
  await expect(page.getByPlaceholder('All statuses')).toBeVisible();

  // Check if load appears in table
  await expect(page.getByText('LOAD-001')).toBeVisible();
  await expect(page.getByText('ABC Corp')).toBeVisible();
  await expect(page.getByText('Los Angeles, CA')).toBeVisible();
  await expect(page.getByText('New York, NY')).toBeVisible();
});

test('load detail page works', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  // Mock individual load endpoint
  await page.route('**/api/loads/1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        load_number: 'LOAD-001',
        status: 'pending',
        origin_address: '123 Main St',
        origin_city: 'Los Angeles',
        origin_state: 'CA',
        origin_zip: '90210',
        destination_address: '456 Broadway',
        destination_city: 'New York',
        destination_state: 'NY',
        destination_zip: '10001',
        pickup_date: '2024-01-15',
        rate: 5000,
        customer: { name: 'ABC Corp' },
        stops: [
          {
            id: '1',
            type: 'pickup',
            status: 'pending',
            address: '123 Main St',
            city: 'Los Angeles',
            state: 'CA',
            scheduled_time: '2024-01-15T08:00:00Z'
          }
        ],
        documents: []
      })
    });
  });

  await page.goto('/loads/1');

  // Check page header
  await expect(page.getByRole('heading', { name: 'Load LOAD-001' })).toBeVisible();

  // Check load details
  await expect(page.getByText('Load Details')).toBeVisible();
  await expect(page.getByText('123 Main St')).toBeVisible();
  await expect(page.getByText('456 Broadway')).toBeVisible();

  // Check status update section
  await expect(page.getByText('Update Status')).toBeVisible();

  // Check timeline
  await expect(page.getByText('Stops Timeline')).toBeVisible();
});

test('customers page works', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  await page.goto('/customers');

  // Check page header
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
  await expect(page.getByText('Manage your customer database')).toBeVisible();

  // Check new customer button
  await expect(page.getByRole('button', { name: 'New Customer' })).toBeVisible();

  // Check customer in table
  await expect(page.getByText('ABC Corp')).toBeVisible();
  await expect(page.getByText('contact@abc.com')).toBeVisible();
  await expect(page.getByText('Los Angeles, CA')).toBeVisible();

  // Test new customer dialog
  await page.getByRole('button', { name: 'New Customer' }).click();
  await expect(page.getByText('New Customer')).toBeVisible();
  await expect(page.getByPlaceholder('Enter company name')).toBeVisible();
});

test('orders page works', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  await page.goto('/orders');

  // Check page header
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  await expect(page.getByText('Manage your transportation orders')).toBeVisible();

  // Check new order button
  await expect(page.getByRole('button', { name: 'New Order' })).toBeVisible();

  // Check order in table
  await expect(page.getByText('ORD-001')).toBeVisible();
  await expect(page.getByText('Electronics')).toBeVisible();

  // Test new order dialog
  await page.getByRole('button', { name: 'New Order' }).click();
  await expect(page.getByText('New Order')).toBeVisible();
  await expect(page.getByText('Select customer')).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  await page.goto('/loads');

  // Check navigation items are visible (desktop)
  await expect(page.getByText('TMS')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Loads' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Customers' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();

  // Test navigation
  await page.getByRole('link', { name: 'Customers' }).click();
  await expect(page).toHaveURL('/customers');

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page).toHaveURL('/orders');

  await page.getByRole('link', { name: 'Loads' }).click();
  await expect(page).toHaveURL('/loads');
});

test('responsive design works on mobile', async ({ page }) => {
  await page.addInitScript(() => {
    document.cookie = 'access_token=mock-token';
  });

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/loads');

  // Mobile menu should be visible
  await expect(page.getByRole('button').first()).toBeVisible(); // Menu button

  // Open mobile menu
  await page.getByRole('button').first().click();

  // Navigation items should be visible in mobile menu
  await expect(page.getByRole('link', { name: 'Loads' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Customers' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
});