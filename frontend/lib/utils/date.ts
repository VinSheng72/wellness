export const formatDate = (dateString: string, format: 'long' | 'short' = 'long') => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format,
    day: 'numeric',
  });
};


export const normalizeToCalendarDay = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const findDuplicateDates = (dates: Date[]): Map<string, number[]> => {
  const dateMap = new Map<string, number[]>();
  
  dates.forEach((date, index) => {
    const normalized = normalizeToCalendarDay(date);
    if (!dateMap.has(normalized)) {
      dateMap.set(normalized, []);
    }
    dateMap.get(normalized)!.push(index + 1);
  });
  
  return dateMap;
};
