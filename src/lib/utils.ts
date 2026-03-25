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
export const AVATAR_MASK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cpath d='M50 10 C35 10 25 20 25 35 C25 50 35 55 50 55 C65 55 75 50 75 35 C75 20 65 10 50 10 Z M5 100 C5 75 25 65 50 65 C75 65 95 75 95 100 Z' fill='black'/%3E%3C/svg%3E")`

export const CHECKERBOARD_BG = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='%23f0f0f0'/%3E%3Crect width='10' height='10' fill='%23e0e0e0'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e0e0e0'/%3E%3C/svg%3E")`
