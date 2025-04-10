import type { RetroItem } from "@/components/retro-computing-stream"

// Comprehensive list of retro computing search terms for variety
const SEARCH_TERMS = [
  "vintage computer",
  "retro computing",
  "classic computer",
  "8-bit computer",
  "16-bit computer",
  "microcomputer",
  "home computer 1980s",
  "personal computer history",
  "early computing",
  "computer museum",
  "apple ii",
  "commodore 64",
  "atari computer",
  "ibm pc",
  "amiga computer",
  "trs-80",
  "sinclair spectrum",
  "macintosh classic",
  "altair 8800",
  "osborne computer",
  "kaypro computer",
  "tandy computer",
  "acorn computer",
  "zx spectrum",
  "vic-20",
  "apple lisa",
  "next computer",
  "ibm pc xt",
  "ibm pc at",
  "compaq portable",
  "commodore pet",
  "ti-99/4a",
  "msx computer",
  "bbc micro",
  "amstrad cpc",
  "dragon 32",
  "oric computer",
  "sharp x68000",
  "pc jr",
  "atari st",
]

// Keep track of used search terms to avoid repetition
const usedSearchTerms: Set<string> = new Set()
let currentSearchTermIndex = 0

// Function to get the next search term
function getNextSearchTerm(): string {
  // Reset if we've used all terms
  if (usedSearchTerms.size >= SEARCH_TERMS.length) {
    usedSearchTerms.clear()
  }

  // Find an unused term
  let searchTerm: string
  do {
    currentSearchTermIndex = (currentSearchTermIndex + 1) % SEARCH_TERMS.length
    searchTerm = SEARCH_TERMS[currentSearchTermIndex]
  } while (usedSearchTerms.has(searchTerm))

  // Mark as used
  usedSearchTerms.add(searchTerm)
  return searchTerm
}

// Keep track of items we've already shown to avoid duplicates
const shownItems = new Set<string>()

// Function to search Archive.org and extract items
export async function searchArchiveForRetroComputing(page = 1): Promise<RetroItem[]> {
  try {
    // Get a search term for this request
    const searchTerm = getNextSearchTerm()
    console.log(`Searching Archive.org for: ${searchTerm} (page ${page})`)

    // Use the Archive.org Advanced Search API
    const apiUrl = `/api/archive-search?query=${encodeURIComponent(searchTerm)}&page=${page}`

    // Fetch results from our API route
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.warn("No items found in search results")
      return []
    }

    // Filter out items we've already shown and those without images
    const newItems = data.items.filter((item: RetroItem) => {
      // Skip if we've already shown this item or if it has no image
      if (shownItems.has(item.id) || !item.imageUrl) {
        return false
      }

      // Mark as shown
      shownItems.add(item.id)
      return true
    })

    console.log(`Found ${newItems.length} new items`)
    return newItems
  } catch (error) {
    console.error("Error searching Archive.org:", error)
    return []
  }
}

// Function to extract a year from text
export function extractYear(text: string): string | null {
  if (!text) return null

  // Look for years between 1970 and current year
  const currentYear = new Date().getFullYear()
  const yearRegex = /\b(19[7-9]\d|20[0-2]\d)\b/g
  const years = text.match(yearRegex)

  if (years && years.length > 0) {
    // Find the first year that's between 1970 and current year
    for (const year of years) {
      const yearNum = Number.parseInt(year)
      if (yearNum >= 1970 && yearNum <= currentYear) {
        return year
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
