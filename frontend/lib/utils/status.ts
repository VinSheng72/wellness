import { CheckCircle2, XCircle, AlertCircle, LucideIcon } from 'lucide-react';
import { EventStatus } from '@/lib/enums/event-status.enum';

export type StatusConfig = {
  icon: LucideIcon;
  className: string;
  variant: 'default' | 'destructive' | 'secondary' | 'outline';
};

export const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case EventStatus.APPROVED:
      return {
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-800 border-green-200',
        variant: 'default' as const,
      };
    case EventStatus.REJECTED:
      return {
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        variant: 'destructive' as const,
      };
    case EventStatus.PENDING:
      return {
        icon: AlertCircle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        variant: 'secondary' as const,
      };
    default:
      return {
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        variant: 'secondary' as const,
      };
  }
};

export const getStatusVariant = (status: string): "success" | "error" | "warning" | "default" => {
  switch (status) {
    case EventStatus.APPROVED:
      return 'success';
    case EventStatus.REJECTED:
      return 'error';
    case EventStatus.PENDING:
      return 'warning';
    default:
      return 'default';
  }
};
