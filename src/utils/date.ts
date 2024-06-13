export function formatAgo(date: Date) {
  const msAgo = Date.now() - +date;
  const yearsAgo = Math.floor(msAgo / (1000 * 60 * 60 * 24 * 365));
  if (yearsAgo > 0) return `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
  const daysAgo = Math.floor(msAgo / (1000 * 60 * 60 * 24));
  if (daysAgo > 0) return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  const hoursAgo = Math.floor(msAgo / (1000 * 60 * 60));
  if (hoursAgo > 0) return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  const minutesAgo = Math.floor(msAgo / (1000 * 60));
  if (minutesAgo > 0)
    return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
  const secondsAgo = Math.floor(msAgo / 1000);
  if (secondsAgo > 0)
    return `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`;
  return "now";
}

export function msUntilNextAgoFormatChange(date: Date) {
  const msAgo = Date.now() - +date;
  if (msAgo < 60 * 1000) return 1000;
  if (msAgo < 60 * 60 * 1000) return 60 * 1000;
  if (msAgo < 24 * 60 * 60 * 1000) return 60 * 60 * 1000;
  if (msAgo < 365 * 24 * 60 * 60 * 1000) return 24 * 60 * 60 * 1000;
  return 365 * 24 * 60 * 60 * 1000;
}
