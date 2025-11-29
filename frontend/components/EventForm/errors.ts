export interface ErrorContext {
  mode: 'create' | 'edit';
  error: Error;
}

export interface ParsedError {
  message: string;
  shouldShowToast: boolean;
  shouldSetInlineError: boolean;
  shouldClearEventItem: boolean;
}

export function isStatusChangeError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('pending') || lowerMessage.includes('status');
}

export function isAuthorizationError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('not authorized')
  );
}

export function isDuplicateDateError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('duplicate') && lowerMessage.includes('date');
}

export function isApprovedEventError(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('approved event already exists') ||
    lowerMessage.includes('approved event')
  );
}

export function parseSubmissionError(context: ErrorContext): ParsedError {
  const { error } = context;
  const errorMessage = error.message;
  const lowerMessage = errorMessage.toLowerCase();

  if (isStatusChangeError(lowerMessage)) {
    return {
      message:
        'This event can no longer be edited because its status has changed. Only pending events can be edited.',
      shouldShowToast: true,
      shouldSetInlineError: true,
      shouldClearEventItem: false,
    };
  }

  if (isAuthorizationError(lowerMessage)) {
    return {
      message:
        'You are not authorized to edit this event. You can only edit events created by your company.',
      shouldShowToast: true,
      shouldSetInlineError: true,
      shouldClearEventItem: false,
    };
  }

  if (isDuplicateDateError(lowerMessage)) {
    return {
      message: errorMessage,
      shouldShowToast: false,
      shouldSetInlineError: true,
      shouldClearEventItem: false,
    };
  }

  if (isApprovedEventError(lowerMessage)) {
    return {
      message:
        'This event item already has an approved booking. Please choose a different event item.',
      shouldShowToast: true,
      shouldSetInlineError: true,
      shouldClearEventItem: true,
    };
  }

  return {
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    shouldShowToast: true,
    shouldSetInlineError: true,
    shouldClearEventItem: false,
  };
}
