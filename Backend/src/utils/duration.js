const calculateDuration = (start, end) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.max(ms / 36e5, 0);
  return {
    totalHours: Number(hours.toFixed(2)),
    totalDays: Number((hours / 24).toFixed(2))
  };
};

module.exports = { calculateDuration };
