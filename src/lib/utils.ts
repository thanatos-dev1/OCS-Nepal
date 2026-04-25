import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
//test
export function cn(...inputs: ClassValue[]) {

  return twMerge(clsx(inputs));
}
