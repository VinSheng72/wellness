import { isPastDate, findDuplicateDates } from '@/lib/utils/date';

export interface FormData {
  selectedEventItem: string;
  proposedDates: (Date | undefined)[];
  postalCode: string;
  streetName: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEventItem(eventItemId: string): ValidationResult {
  if (!eventItemId) {
    return {
      isValid: false,
      error: 'Please select an event type from the dropdown',
    };
  }

  return { isValid: true };
}

export function validateProposedDates(dates: (Date | undefined)[]): ValidationResult {
  const filledDates = dates.filter((date): date is Date => date !== undefined);
  
  if (filledDates.length === 0) {
    return {
      isValid: false,
      error: 'Please provide 3 proposed dates for the event',
    };
  }

  if (filledDates.length < 3) {
    return {
      isValid: false,
      error: `Please provide all 3 proposed dates (${filledDates.length}/3 provided)`,
    };
  }

  const dateMap = findDuplicateDates(filledDates);

  const duplicates: string[] = [];
  dateMap.forEach((indices, date) => {
    if (indices.length > 1) {
      duplicates.push(`Date ${indices.join(' and ')} (${date})`);
    }
  });

  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: `Duplicate dates detected: ${duplicates.join(', ')}. All three dates must be unique.`,
    };
  }

  const pastDates = filledDates.filter(date => isPastDate(date));
  if (pastDates.length > 0) {
    return {
      isValid: false,
      error: 'All proposed dates must be in the future',
    };
  }

  return { isValid: true };
}

export function validateLocation(postalCode: string, streetName: string): ValidationResult {
  if (!postalCode.trim()) {
    return {
      isValid: false,
      error: 'Please provide a postal code',
    };
  }

  if (!streetName.trim()) {
    return {
      isValid: false,
      error: 'Please provide a street name (use Lookup button or enter manually)',
    };
  }

  return { isValid: true };
}

export function validateEventForm(formData: FormData): ValidationResult {
  const eventItemResult = validateEventItem(formData.selectedEventItem);
  if (!eventItemResult.isValid) {
    return eventItemResult;
  }

  const datesResult = validateProposedDates(formData.proposedDates);
  if (!datesResult.isValid) {
    return datesResult;
  }

  const locationResult = validateLocation(formData.postalCode, formData.streetName);
  if (!locationResult.isValid) {
    return locationResult;
  }

  return { isValid: true };
}
