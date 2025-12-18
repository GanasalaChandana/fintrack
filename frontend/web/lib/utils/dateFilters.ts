// lib/utils/dateFilters.ts

export interface DateRange {
  start: Date;
  end: Date;
}

export const getDateRange = (filter: string): DateRange => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'this-week':
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last-week':
      const lastWeekStart = new Date(start);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7 - lastWeekStart.getDay() + 1);
      lastWeekStart.setHours(0, 0, 0, 0);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);
      return { start: lastWeekStart, end: lastWeekEnd };

    case 'this-month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last-month':
      start.setMonth(start.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last-30-days':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last-90-days':
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'this-year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last-year':
      start.setFullYear(start.getFullYear() - 1, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(end.getFullYear() - 1, 11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    case 'all-time':
      start.setFullYear(2000, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      // Default to this month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

export const formatDateRange = (start: Date, end: Date): string => {
  const now = new Date();
  const isToday = start.toDateString() === now.toDateString();
  const isThisYear = start.getFullYear() === now.getFullYear();

  if (isToday) {
    return 'Today';
  }

  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric',
  });

  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: isThisYear ? undefined : 'numeric',
  });

  return `${startStr} - ${endStr}`;
};