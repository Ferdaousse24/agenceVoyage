export function formatDuration(duration: string): string {
    // Ex: PT2H30M
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);
  
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  
    const hoursText = hours > 0 ? `${hours}h` : '';
    const minutesText = minutes > 0 ? `${minutes}m` : '';
  
    return `${hoursText}${hours > 0 && minutes > 0 ? ' ' : ''}${minutesText}`.trim();
  }
  