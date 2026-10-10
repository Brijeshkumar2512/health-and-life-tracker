/**
 * Utility to calculate current streak and longest streak from an array of 'YYYY-MM-DD' dates.
 */

// Formats a Date object to 'YYYY-MM-DD' in local time
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Gets date string for N days before or after reference date
const getOffsetDateStr = (dateStr, offsetDays) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  return formatDateStr(date);
};

const calculateStreaks = (completedDates = [], targetDateStr = formatDateStr(new Date())) => {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Filter unique dates and sort ascending
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  const dateSet = new Set(uniqueDates);

  // 1. Calculate longest streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDateStr = null;

  for (const dateStr of uniqueDates) {
    if (!prevDateStr) {
      currentRun = 1;
    } else {
      const expectedNext = getOffsetDateStr(prevDateStr, 1);
      if (dateStr === expectedNext) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDateStr = dateStr;
  }

  // 2. Calculate current streak relative to target date (typically today)
  let currentStreak = 0;
  const todayStr = targetDateStr;
  const yesterdayStr = getOffsetDateStr(todayStr, -1);

  // Determine starting point:
  // If completed today, walk backwards from today.
  // If not completed today, but completed yesterday, walk backwards from yesterday.
  let checkDate = null;
  if (dateSet.has(todayStr)) {
    checkDate = todayStr;
  } else if (dateSet.has(yesterdayStr)) {
    checkDate = yesterdayStr;
  }

  if (checkDate) {
    while (dateSet.has(checkDate)) {
      currentStreak += 1;
      checkDate = getOffsetDateStr(checkDate, -1);
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
};

module.exports = {
  formatDateStr,
  getOffsetDateStr,
  calculateStreaks,
};
