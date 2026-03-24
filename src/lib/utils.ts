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
