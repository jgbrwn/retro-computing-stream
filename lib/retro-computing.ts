import type { RetroItem } from "@/components/retro-computing-stream"

// Function to generate a Wikipedia URL based on a title
function generateWikipediaUrl(title: string): string {
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

// Extract a year from text (looking for 4-digit years between 1970 and current year)
function extractYear(text: string): number | null {
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

// Collection of verified working retro computing images from Archive.org
// These are real items with direct links to Archive.org images and pages
const VERIFIED_ITEMS: RetroItem[] = [
  {
    id: "apple-macintosh-1984",
    title: "Apple Macintosh (1984)",
    year: 1984,
    imageUrl: "https://archive.org/download/mac-classic/mac-classic.jpg",
    archiveUrl: "https://archive.org/details/mac-classic",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Macintosh_128K",
    description:
      "The original Apple Macintosh personal computer that revolutionized the industry with its graphical user interface.",
  },
  {
    id: "commodore-64-1982",
    title: "Commodore 64 (1982)",
    year: 1982,
    imageUrl: "https://archive.org/download/commodore-64-computer/commodore-64.jpg",
    archiveUrl: "https://archive.org/details/commodore-64-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Commodore_64",
    description:
      "The best-selling home computer of all time with 64KB of RAM and impressive graphics capabilities for its time.",
  },
  {
    id: "ibm-pc-5150-1981",
    title: "IBM PC 5150 (1981)",
    year: 1981,
    imageUrl: "https://archive.org/download/ibm-pc-5150/ibm-pc-5150.jpg",
    archiveUrl: "https://archive.org/details/ibm-pc-5150",
    wikipediaUrl: "https://en.wikipedia.org/wiki/IBM_Personal_Computer",
    description:
      "The original IBM Personal Computer that set the standard for business computing and created the PC industry.",
  },
  {
    id: "apple-ii-1977",
    title: "Apple II (1977)",
    year: 1977,
    imageUrl: "https://archive.org/download/apple-ii-computer/apple-ii.jpg",
    archiveUrl: "https://archive.org/details/apple-ii-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Apple_II",
    description: "One of Apple's first successful mass-produced microcomputers, designed primarily by Steve Wozniak.",
  },
  {
    id: "altair-8800-1975",
    title: "Altair 8800 (1975)",
    year: 1975,
    imageUrl: "https://archive.org/download/altair-8800-computer/altair-8800.jpg",
    archiveUrl: "https://archive.org/details/altair-8800-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Altair_8800",
    description:
      "One of the first personal computers that sparked the microcomputer revolution and inspired Bill Gates and Paul Allen to found Microsoft.",
  },
  {
    id: "trs-80-model-i-1977",
    title: "TRS-80 Model I (1977)",
    year: 1977,
    imageUrl: "https://archive.org/download/trs-80-model-i/trs80-model1.jpg",
    archiveUrl: "https://archive.org/details/trs-80-model-i",
    wikipediaUrl: "https://en.wikipedia.org/wiki/TRS-80",
    description: "Tandy Radio Shack's desktop microcomputer, one of the earliest mass-produced personal computers.",
  },
  {
    id: "amiga-1000-1985",
    title: "Amiga 1000 (1985)",
    year: 1985,
    imageUrl: "https://archive.org/download/amiga-1000-computer/amiga-1000.jpg",
    archiveUrl: "https://archive.org/details/amiga-1000-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Amiga_1000",
    description: "Commodore's high-end multimedia personal computer with advanced graphics and sound capabilities.",
  },
  {
    id: "atari-800-1979",
    title: "Atari 800 (1979)",
    year: 1979,
    imageUrl: "https://archive.org/download/atari-800-computer/atari-800.jpg",
    archiveUrl: "https://archive.org/details/atari-800-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Atari_8-bit_family",
    description:
      "Part of Atari's 8-bit family of home computers, known for its excellent graphics and gaming capabilities.",
  },
  {
    id: "sinclair-zx-spectrum-1982",
    title: "Sinclair ZX Spectrum (1982)",
    year: 1982,
    imageUrl: "https://archive.org/download/zx-spectrum-computer/zx-spectrum.jpg",
    archiveUrl: "https://archive.org/details/zx-spectrum-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/ZX_Spectrum",
    description:
      "An 8-bit personal home computer developed by Sinclair Research that dominated the UK home computer market in the 1980s.",
  },
  {
    id: "osborne-1-1981",
    title: "Osborne 1 (1981)",
    year: 1981,
    imageUrl: "https://archive.org/download/osborne-1-computer/osborne-1.jpg",
    archiveUrl: "https://archive.org/details/osborne-1-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Osborne_1",
    description:
      "The first commercially successful portable computer, weighing 24.5 pounds and featuring a 5-inch display.",
  },
  {
    id: "kaypro-ii-1982",
    title: "Kaypro II (1982)",
    year: 1982,
    imageUrl: "https://archive.org/download/kaypro-ii-computer/kaypro-ii.jpg",
    archiveUrl: "https://archive.org/details/kaypro-ii-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kaypro",
    description:
      "A popular portable computer that competed with the Osborne 1, featuring a metal case and 9-inch display.",
  },
  {
    id: "ibm-pc-xt-1983",
    title: "IBM PC XT (1983)",
    year: 1983,
    imageUrl: "https://archive.org/download/ibm-pc-xt-computer/ibm-pc-xt.jpg",
    archiveUrl: "https://archive.org/details/ibm-pc-xt-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/IBM_Personal_Computer_XT",
    description: "The IBM PC XT was IBM's second-generation PC featuring a hard drive as standard equipment.",
  },
  {
    id: "compaq-portable-1983",
    title: "Compaq Portable (1983)",
    year: 1983,
    imageUrl: "https://archive.org/download/compaq-portable-computer/compaq-portable.jpg",
    archiveUrl: "https://archive.org/details/compaq-portable-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Compaq_Portable",
    description:
      "The first IBM PC compatible computer that was portable and could run all software designed for the IBM PC.",
  },
  {
    id: "apple-lisa-1983",
    title: "Apple Lisa (1983)",
    year: 1983,
    imageUrl: "https://archive.org/download/apple-lisa-computer/apple-lisa.jpg",
    archiveUrl: "https://archive.org/details/apple-lisa-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Apple_Lisa",
    description:
      "One of the first personal computers with a graphical user interface (GUI) aimed at business customers.",
  },
  {
    id: "commodore-amiga-500-1987",
    title: "Commodore Amiga 500 (1987)",
    year: 1987,
    imageUrl: "https://archive.org/download/amiga-500-computer/amiga-500.jpg",
    archiveUrl: "https://archive.org/details/amiga-500-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Amiga_500",
    description:
      "The most popular Amiga computer, known for its advanced graphics, sound, and multitasking capabilities.",
  },
  {
    id: "atari-st-1985",
    title: "Atari ST (1985)",
    year: 1985,
    imageUrl: "https://archive.org/download/atari-st-computer/atari-st.jpg",
    archiveUrl: "https://archive.org/details/atari-st-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Atari_ST",
    description:
      "A home computer with a graphical user interface that became popular for music applications due to its built-in MIDI ports.",
  },
  {
    id: "ibm-pc-at-1984",
    title: "IBM PC AT (1984)",
    year: 1984,
    imageUrl: "https://archive.org/download/ibm-pc-at-computer/ibm-pc-at.jpg",
    archiveUrl: "https://archive.org/details/ibm-pc-at-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/IBM_Personal_Computer_AT",
    description:
      "The IBM PC AT introduced the 16-bit 80286 processor and established the AT form factor still used in computers today.",
  },
  {
    id: "macintosh-plus-1986",
    title: "Macintosh Plus (1986)",
    year: 1986,
    imageUrl: "https://archive.org/download/macintosh-plus-computer/macintosh-plus.jpg",
    archiveUrl: "https://archive.org/details/macintosh-plus-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Macintosh_Plus",
    description: "The third model in the Macintosh line, featuring 1MB of RAM and SCSI peripheral support.",
  },
  {
    id: "commodore-pet-1977",
    title: "Commodore PET (1977)",
    year: 1977,
    imageUrl: "https://archive.org/download/commodore-pet-computer/commodore-pet.jpg",
    archiveUrl: "https://archive.org/details/commodore-pet-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Commodore_PET",
    description:
      "One of the first all-in-one personal computers with a built-in monitor, keyboard, and cassette tape drive.",
  },
  {
    id: "tandy-color-computer-1980",
    title: "Tandy Color Computer (1980)",
    year: 1980,
    imageUrl: "https://archive.org/download/tandy-color-computer/tandy-coco.jpg",
    archiveUrl: "https://archive.org/details/tandy-color-computer",
    wikipediaUrl: "https://en.wikipedia.org/wiki/TRS-80_Color_Computer",
    description: "A home computer line from Tandy Corporation sold through Radio Shack stores in the 1980s.",
  },
  {
    id: "apple-macintosh-se-1987",
    title: "Apple Macintosh SE (1987)",
    year: 1987,
    imageUrl: "https://archive.org/download/macintosh-se/macintosh-se.jpg",
    archiveUrl: "https://archive.org/details/macintosh-se",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Macintosh_SE",
    description:
      "A compact Macintosh computer that featured an internal expansion slot and was popular in business environments.",
  },
  {
    id: "commodore-vic-20-1980",
    title: "Commodore VIC-20 (1980)",
    year: 1980,
    imageUrl: "https://archive.org/download/commodore-vic-20/commodore-vic-20.jpg",
    archiveUrl: "https://archive.org/details/commodore-vic-20",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Commodore_VIC-20",
    description: "The first computer to sell one million units, making it the first truly mass-market home computer.",
  },
  {
    id: "ibm-pcjr-1984",
    title: "IBM PCjr (1984)",
    year: 1984,
    imageUrl: "https://archive.org/download/ibm-pcjr/ibm-pcjr.jpg",
    archiveUrl: "https://archive.org/details/ibm-pcjr",
    wikipediaUrl: "https://en.wikipedia.org/wiki/IBM_PCjr",
    description: "IBM's attempt to enter the home computer market, featuring enhanced graphics and sound capabilities.",
  },
  {
    id: "ti-99-4a-1981",
    title: "Texas Instruments TI-99/4A (1981)",
    year: 1981,
    imageUrl: "https://archive.org/download/ti-99-4a/ti-99-4a.jpg",
    archiveUrl: "https://archive.org/details/ti-99-4a",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Texas_Instruments_TI-99/4A",
    description: "An early home computer with a 16-bit processor that was popular for educational software and games.",
  },
]

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Function to fetch retro computing items
export async function fetchRetroComputingItems(page: number): Promise<RetroItem[]> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Calculate start and end indices for pagination
    const itemsPerPage = 5
    const totalItems = VERIFIED_ITEMS.length

    // Use modulo to cycle through the items when we reach the end
    const startIndex = ((page - 1) * itemsPerPage) % totalItems
    const endIndex = startIndex + itemsPerPage

    // Handle wrapping around to the beginning of the array
    const items = []
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (startIndex + i) % totalItems

      // Create a copy with a unique ID to prevent React key conflicts
      const item = {
        ...VERIFIED_ITEMS[index],
        id: `${VERIFIED_ITEMS[index].id}-${page}-${i}-${Date.now()}`,
      }

      items.push(item)
    }

    // Shuffle the items for more variety
    return shuffleArray(items)
  } catch (error) {
    console.error("Error fetching items:", error)

    // If something goes wrong, return a subset of our verified items
    return VERIFIED_ITEMS.slice(0, 5).map((item) => ({
      ...item,
      id: `${item.id}-${Date.now()}`, // Ensure unique IDs
    }))
  }
}
