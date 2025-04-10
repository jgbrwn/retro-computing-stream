import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract a year from text (looking for 4-digit years between 1970 and current year)
export function extractYear(text: string): number | null {
  if (!text) return null

  const currentYear = new Date().getFullYear()
  const yearRegex = /\b(19[7-9]\d|20[0-2]\d)\b/g
  const years = text.match(yearRegex)

  if (years && years.length > 0) {
    // Find the first year that's between 1970 and current year
    for (const year of years) {
      const yearNum = Number.parseInt(year)
      if (yearNum >= 1970 && yearNum <= currentYear) {
        return yearNum
      }
    }
  }

  return null
}

// Function to generate a Wikipedia URL based on a title
export function generateWikipediaUrl(title: string): string {
  // Clean up the title for Wikipedia
  const cleanTitle = title
    .replace(/$$[^)]*$$/g, "") // Remove content in parentheses
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .split(" ")
    .slice(0, 3) // Take first 3 words for better matches
    .join(" ")

  // Check for common retro computing terms to improve Wikipedia matching
  const computingTerms = [
    "computer",
    "computing",
    "pc",
    "macintosh",
    "apple",
    "ibm",
    "commodore",
    "atari",
    "amiga",
    "trs",
    "sinclair",
    "spectrum",
    "altair",
    "osborne",
  ]

  let searchTerm = cleanTitle

  // If the title doesn't contain any computing terms, add "computer" to the search
  if (!computingTerms.some((term) => cleanTitle.toLowerCase().includes(term))) {
    searchTerm += " computer"
  }

  return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(searchTerm)}`
}
