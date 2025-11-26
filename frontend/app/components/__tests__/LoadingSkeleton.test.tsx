import { render, screen } from '@testing-library/react';
import { TableSkeleton, FormSkeleton, DashboardSkeleton, CardSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render TableSkeleton', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render FormSkeleton', () => {
    const { container } = render(<FormSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render DashboardSkeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render CardSkeleton', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
