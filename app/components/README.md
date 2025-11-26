# Error Handling and Loading States

This directory contains reusable components for error handling, loading states, and user feedback throughout the application.

## Components

### ErrorBoundary

A React Error Boundary component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

**Usage:**
```tsx
import ErrorBoundary from '@/app/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches runtime errors in child components
- Displays user-friendly error message
- Shows error details in development
- Provides "Refresh Page" button
- Logs errors to console for debugging

### Toast Notifications

A lightweight toast notification system for displaying temporary messages to users.

**Usage:**
```tsx
import { useToast } from '@/app/components/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Operation successful!', 'success');
  };

  const handleError = () => {
    showToast('Something went wrong', 'error');
  };

  return <button onClick={handleSuccess}>Save</button>;
}
```

**Toast Types:**
- `success` - Green toast for successful operations
- `error` - Red toast for errors
- `warning` - Yellow toast for warnings
- `info` - Blue toast for informational messages (default)

**Features:**
- Auto-dismisses after 5 seconds
- Manual dismiss with close button
- Stacks multiple toasts
- Accessible with ARIA attributes
- Positioned at top-right of screen

### Loading Skeletons

Skeleton loading components that provide visual feedback during async operations.

**Available Skeletons:**
- `TableSkeleton` - For data tables
- `FormSkeleton` - For forms
- `DashboardSkeleton` - For full dashboard pages
- `CardSkeleton` - For card components

**Usage:**
```tsx
import { TableSkeleton, FormSkeleton } from '@/app/components/LoadingSkeleton';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <TableSkeleton />;
  }

  return <DataTable data={data} />;
}
```

**Features:**
- Animated pulse effect
- Matches layout of actual content
- Improves perceived performance
- Reduces layout shift

## Next.js Error Handling

### Error Pages

The application includes specialized error pages:

- `app/error.tsx` - Global error handler
- `app/not-found.tsx` - 404 page
- `app/hr-dashboard/error.tsx` - HR dashboard errors
- `app/vendor-dashboard/error.tsx` - Vendor dashboard errors

### Loading Pages

Loading states for route segments:

- `app/login/loading.tsx` - Login page loading
- `app/hr-dashboard/loading.tsx` - HR dashboard loading
- `app/vendor-dashboard/loading.tsx` - Vendor dashboard loading

## Form Validation

Enhanced form validation with user-friendly error messages:

### EventForm Validation
- Event type selection required
- Exactly 3 proposed dates required
- Dates must be in the future
- Postal code and street name required
- Real-time validation feedback
- Toast notifications for validation errors

### EventModal Validation
- Confirmed date selection required for approval
- Non-empty remarks required for rejection
- Inline error messages
- Toast notifications for success/failure

## Best Practices

1. **Always wrap async operations with loading states**
   ```tsx
   const [loading, setLoading] = useState(false);
   
   const handleSubmit = async () => {
     setLoading(true);
     try {
       await saveData();
       showToast('Saved!', 'success');
     } catch (error) {
       showToast('Failed to save', 'error');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Use toast notifications for user feedback**
   - Success: Confirm completed actions
   - Error: Explain what went wrong
   - Warning: Alert about potential issues
   - Info: Provide helpful information

3. **Provide clear error messages**
   - Be specific about what failed
   - Suggest how to fix the issue
   - Avoid technical jargon

4. **Use loading skeletons for better UX**
   - Match the skeleton to the actual content layout
   - Use for operations taking > 300ms
   - Prefer skeletons over spinners for content loading

5. **Handle errors gracefully**
   - Never show raw error messages to users
   - Always provide a way to recover (retry, go back)
   - Log errors for debugging

## Testing

All error handling components include comprehensive tests:

- `ErrorBoundary.test.tsx` - Error boundary functionality
- `Toast.test.tsx` - Toast notification system
- `LoadingSkeleton.test.tsx` - Loading skeleton rendering

Run tests with:
```bash
npm test app/components/__tests__
```
