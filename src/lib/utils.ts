import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if the given string is a valid URL from supported video platforms
 */
export const isValidVideoUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    const validDomains = [
      'instagram.com',
      'tiktok.com',
      'youtube.com',
      'youtu.be',
      'facebook.com',
      'fb.watch',
      'vimeo.com',
    ]
    return validDomains.some((domain) =>
      parsed.hostname.toLowerCase().includes(domain),
    )
  } catch {
    return false
  }
}

export const CHECKERBOARD_BG = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='%23f0f0f0'/%3E%3Crect width='10' height='10' fill='%23e0e0e0'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e0e0e0'/%3E%3C/svg%3E")`
