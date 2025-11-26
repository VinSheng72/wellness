import { DashboardSkeleton } from '../components/LoadingSkeleton';

/**
 * Loading state for Vendor Dashboard
 * Displayed while the server component is fetching data
 */
export default function Loading() {
  return <DashboardSkeleton />;
}
