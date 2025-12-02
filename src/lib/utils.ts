import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPerformingSchedule(dates: string[]): string {
  if (dates.length === 0) return "";
  if (dates.length === 1) {
    return format(new Date(dates[0]), "MM.dd (E)");
  }
  const firstDate = format(new Date(dates[0]), "MM.dd");
  const lastDate = format(new Date(dates[dates.length - 1]), "MM.dd (E)");
  return `${firstDate} - ${lastDate}`;
}

export function formatDateTime(dateString: string): string {
  try {
    return format(new Date(dateString), "MM.dd (E) HH:mm");
  } catch {
    return dateString;
  }
}
