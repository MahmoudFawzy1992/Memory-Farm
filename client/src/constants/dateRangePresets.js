import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subDays, 
  subWeeks, 
  subMonths
} from 'date-fns';

/**
 * Predefined date range presets
 */
export const DATE_PRESETS = {
  today: {
    label: 'Today',
    icon: '📅',
    getDates: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    }
  },
  yesterday: {
    label: 'Yesterday', 
    icon: '📆',
    getDates: () => {
      const yesterday = subDays(new Date(), 1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  thisWeek: {
    label: 'This Week',
    icon: '📋',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfWeek(now, { weekStartsOn: 1 }), 
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      };
    }
  },
  lastWeek: {
    label: 'Last Week',
    icon: '📊',
    getDates: () => {
      const lastWeek = subWeeks(new Date(), 1);
      return { 
        startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
        endDate: endOfWeek(lastWeek, { weekStartsOn: 1 })
      };
    }
  },
  thisMonth: {
    label: 'This Month',
    icon: '🗓️',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfMonth(now), 
        endDate: endOfMonth(now)
      };
    }
  },
  lastMonth: {
    label: 'Last Month',
    icon: '📝',
    getDates: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { 
        startDate: startOfMonth(lastMonth), 
        endDate: endOfMonth(lastMonth)
      };
    }
  },
  thisYear: {
    label: 'This Year',
    icon: '🗃️',
    getDates: () => {
      const now = new Date();
      return { 
        startDate: startOfYear(now), 
        endDate: endOfYear(now)
      };
    }
  }
};