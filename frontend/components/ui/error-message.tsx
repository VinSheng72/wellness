interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`rounded-md bg-red-50 p-4 border border-red-200 ${className}`}>
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}
