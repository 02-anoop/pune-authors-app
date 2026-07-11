export const checkIsPastEvent = (eventDate: string | Date, duration: string) => {
  if (!eventDate) return false;
  const startDate = new Date(eventDate);
  if (isNaN(startDate.getTime())) return false;

  let totalDays = 1;

  if (duration) {
    const daysMatch = duration.match(/(\d+)\s*Days?/i);
    const hoursMatch = duration.match(/(\d+)\s*Hours?/i);

    let days = daysMatch ? parseInt(daysMatch[1]) : 0;
    let hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;

    if (days === 0 && hours > 0) {
      totalDays = 1;
    } else if (days > 0) {
      totalDays = days;
    }
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (totalDays - 1));
  endDate.setHours(23, 59, 59, 999);

  return Date.now() > endDate.getTime();
};
