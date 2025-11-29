interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full border-solid border-blue-600 border-r-transparent ${sizeClasses[size]}`}></div>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
