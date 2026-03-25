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

// Avatar rendering constants for simulating background removal (fundo falso)
// Updated to ensure Head-to-Shoulder Integrity (prevents floating head effect)
export const AVATAR_MASK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cpath d='M50 5 C32 5 22 20 22 40 C22 55 30 65 40 68 C25 70 5 80 5 100 L95 100 C95 80 75 70 60 68 C70 65 78 55 78 40 C78 20 68 5 50 5 Z' fill='black'/%3E%3C/svg%3E")`

export const CHECKERBOARD_BG = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='%23f0f0f0'/%3E%3Crect width='10' height='10' fill='%23e0e0e0'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e0e0e0'/%3E%3C/svg%3E")`
