# Design Document

## Overview

This design consolidates the duplicate header navigation into a single, unified Navigation component that displays all necessary information: application branding, dynamic page titles, user information, and logout functionality. The solution removes redundant page-level headers from dashboard pages while enhancing the Navigation component to accept and display dynamic content based on the current route and user context.

## Architecture

The architecture follows a centralized navigation pattern where:

1. The Navigation component in the root layout serves as the single source of truth for header content
2. The Navigation component uses Next.js routing hooks to determine the current page and display appropriate titles
3. The Navigation component uses the Auth context to access user information
4. Dashboard pages remove their redundant header elements and rely solely on the Navigation component

This approach maintains separation of concerns while eliminating duplication.

## Components and Interfaces

### Enhanced Navigation Component

**Location:** `frontend/app/components/Navigation.tsx`

**Responsibilities:**
- Display application branding
- Show dynamic page titles based on current route
- Display authenticated user information (username)
- Provide logout functionality
- Hide on login page

**Props:** None (uses hooks for routing and auth context)

**Key Methods:**
- `getPageTitle()`: Returns appropriate page title based on current pathname
- `handleLogout()`: Manages logout flow including API call and redirect

**Dependencies:**
- `useRouter` from `next/navigation`
- `usePathname` from `next/navigation`
- `useAuth` from `@/lib/auth`

### Modified Dashboard Pages

**HR Dashboard (`frontend/app/hr-dashboard/page.tsx`):**
- Remove the `<header>` element containing page title, username, and logout button
- Retain only the `<main>` content area with event forms and tables

**Vendor Dashboard (`frontend/app/vendor-dashboard/page.tsx`):**
- Remove the `<header>` element containing page title, username, and logout button
- Retain only the `<main>` content area with event tables

### Root Page Component

**Location:** `frontend/app/page.tsx`

**Responsibilities:**
- Check user authentication status
- Redirect unauthenticated users to login page
- Redirect authenticated users to their role-appropriate dashboard
- Display loading state during authentication check

**Props:** None (uses auth context)

**Key Logic:**
- Use `useAuth` hook to access user and loading state
- Use `useRouter` for programmatic navigation
- Implement redirect logic based on user role:
  - No user → `/login`
  - HR_ADMIN → `/hr-dashboard`
  - VENDOR_ADMIN → `/vendor-dashboard`

**Dependencies:**
- `useRouter` from `next/navigation`
- `useAuth` from `@/lib/auth`

## Data Models

No new data models are required. The component uses existing types:

```typescript
// From Auth Context
interface User {
  _id: string;
  username: string;
  role: 'HR_ADMIN' | 'VENDOR_ADMIN';
  companyId?: string;
  vendorId?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single header rendering
*For any* dashboard page view, the rendered DOM should contain exactly one header navigation element
**Validates: Requirements 1.1**

### Property 2: Header content completeness
*For any* authenticated dashboard page view, the header should contain all required elements: application branding, page title, username, and logout button
**Validates: Requirements 1.2**

### Property 3: Page title accuracy
*For any* dashboard route, the displayed page title should match the expected title for that route (HR Admin Dashboard for /hr-dashboard, Vendor Admin Dashboard for /vendor-dashboard)
**Validates: Requirements 2.1, 2.2**

### Property 4: Username display
*For any* authenticated user viewing a dashboard, the header should display their username
**Validates: Requirements 2.3**

### Property 5: Single logout button
*For any* dashboard page view, the rendered DOM should contain exactly one logout button
**Validates: Requirements 3.1**

### Property 6: Root redirect for unauthenticated users
*For any* unauthenticated user accessing the root path, the system should redirect to the login page
**Validates: Requirements 4.1**

### Property 7: Root redirect for authenticated users
*For any* authenticated user with a valid role, accessing the root path should redirect to their role-appropriate dashboard (HR_ADMIN → /hr-dashboard, VENDOR_ADMIN → /vendor-dashboard)
**Validates: Requirements 4.2, 4.3**

## Error Handling

The Navigation component already includes error handling for logout failures:

1. **Logout API Failure**: If the logout endpoint returns an error, the user is still redirected to the login page to ensure security
2. **Network Errors**: Caught in the try-catch block and handled by redirecting to login
3. **Auth Context Unavailable**: Component gracefully handles missing user data by not displaying user-specific information

No additional error handling is required for this refactoring.

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Navigation component renders correctly with authenticated user
- Navigation component displays correct page title for each route
- Navigation component displays username from auth context
- Navigation component hides on login page
- Dashboard pages no longer render duplicate headers

### Property-Based Testing

We will use **fast-check** (the standard property-based testing library for TypeScript/React) to implement property-based tests.

Each property-based test will:
- Run a minimum of 100 iterations
- Be tagged with a comment explicitly referencing the correctness property from this design document
- Use the format: `**Feature: duplicate-header-fix, Property {number}: {property_text}**`

Property-based tests will verify:
1. Single header rendering across different routes and user states
2. Header content completeness with various user data
3. Page title accuracy for all valid route combinations
4. Username display with different username formats
5. Single logout button presence across all dashboard views

The tests will generate random user data, route combinations, and authentication states to ensure the properties hold universally.
