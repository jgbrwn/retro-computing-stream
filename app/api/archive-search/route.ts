import { type NextRequest, NextResponse } from "next/server"
import { extractYear, generateWikipediaUrl } from "@/lib/archive-search"

// Define interfaces for better type safety
interface ArchiveSearchResponse {
  responseHeader: object
  response: {
    numFound: number
    start: number
    docs: ArchiveItem[]
  }
}

interface ArchiveItem {
  identifier: string
  title?: string
  description?: string
  mediatype: string
  year?: string
  date?: string
  format?: string[] // Formats listed in search result
}

interface ArchiveMetadataResponse {
  metadata: {
    identifier: string
    title?: string
    description?: string
    mediatype: string
    year?: string
    date?: string
    // ... other metadata fields
  }
  files?: ArchiveFile[] // Array of files within the item
}

interface ArchiveFile {
  name: string // The actual filename
  source: string
  format: string // e.g., 'JPEG', 'PNG', 'GIF'
  size?: string // Size in bytes as a string
  md5?: string
}

// Function to truncate text to a specific word limit
function truncateText(text: string, wordLimit = 50): string {
  if (!text) return ""

  const words = text.split(/\s+/)
  if (words.length <= wordLimit) return text

  // Get the first N words
  const truncated = words.slice(0, wordLimit).join(" ")

  // Add ellipsis
  return truncated + "..."
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || "vintage computer"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const rows = 10 // Number of items to fetch per page

    // Construct the search URL for Archive.org Advanced Search API
    const searchApiUrl = new URL("https://archive.org/advancedsearch.php")
    searchApiUrl.searchParams.set("q", `${query} AND (mediatype:image OR mediatype:texts)`)
    searchApiUrl.searchParams.append("fl[]", "identifier")
    searchApiUrl.searchParams.append("fl[]", "title")
    searchApiUrl.searchParams.append("fl[]", "description")
    searchApiUrl.searchParams.append("fl[]", "mediatype")
    searchApiUrl.searchParams.append("fl[]", "date")
    searchApiUrl.searchParams.append("fl[]", "year")
    searchApiUrl.searchParams.set("rows", rows.toString())
    searchApiUrl.searchParams.set("page", page.toString())
    searchApiUrl.searchParams.set("output", "json")
    searchApiUrl.searchParams.set("sort[]", "downloads desc") // Sort by popularity

    console.log(`Searching Archive.org with URL: ${searchApiUrl.toString()}`)

    // Fetch search results
    const searchResponse = await fetch(searchApiUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!searchResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch from Archive.org" }, { status: 500 })
    }

    const searchData = (await searchResponse.json()) as ArchiveSearchResponse
    const items = searchData.response?.docs || []

    if (items.length === 0) {
      return NextResponse.json({ items: [], total: 0 })
    }

    // Process each item to get image URLs
    const processedItems = []
    const imageFormats = ["jpeg", "jpg", "png", "gif", "tif", "tiff", "bmp"]

    for (const item of items) {
      try {
        // Fetch metadata for this item to get file details
        const metadataApiUrl = `https://archive.org/metadata/${item.identifier}`
        const metadataResponse = await fetch(metadataApiUrl)

        if (!metadataResponse.ok) {
          console.warn(`Could not fetch metadata for ${item.identifier}: ${metadataResponse.status}`)
          continue
        }

        const metadataData = (await metadataResponse.json()) as ArchiveMetadataResponse

        // Find image files in the metadata
        let imageUrl = ""
        let thumbnailUrl = ""

        if (metadataData?.files) {
          // First, try to find a thumbnail image
          const thumbnailFile = metadataData.files.find(
            (file) => file.name.includes("_thumb") || file.name.includes("thumbnail") || file.name === "__ia_thumb.jpg",
          )

          if (thumbnailFile) {
            thumbnailUrl = `https://archive.org/download/${item.identifier}/${encodeURIComponent(thumbnailFile.name)}`
          }

          // Then look for any image file
          for (const file of metadataData.files) {
            // Check if the file format is a known image type (case-insensitive)
            if (
              (file.format && imageFormats.includes(file.format.toLowerCase())) ||
              (file.name && imageFormats.some((ext) => file.name.toLowerCase().endsWith(`.${ext}`)))
            ) {
              // Ensure filename is valid
              if (file.name && !file.name.startsWith("./") && file.name.includes(".")) {
                // Construct the direct download URL
                imageUrl = `https://archive.org/download/${item.identifier}/${encodeURIComponent(file.name)}`
                break
              }
            }
          }
        }

        // If no specific image found, try using the thumbnail
        if (!imageUrl && thumbnailUrl) {
          imageUrl = thumbnailUrl
        }

        // If still no image, try a predictable URL pattern
        if (!imageUrl) {
          imageUrl = `https://archive.org/services/img/${item.identifier}`
        }

        // Skip items without images
        if (!imageUrl) continue

        // Extract year from metadata or title
        const year =
          metadataData.metadata?.year ||
          item.year ||
          extractYear(item.date || "") ||
          extractYear(item.title || "") ||
          extractYear(metadataData.metadata?.description || "")

        // Generate Wikipedia URL
        const wikipediaUrl = generateWikipediaUrl(item.title || "")

        // Create enhanced description if none exists
        const description =
          item.description ||
          metadataData.metadata?.description ||
          `${item.title || "Retro computing item"} - A piece of computing history from the Archive.org collection.`

        // Make sure description is a string before processing
        let cleanDescription =
          typeof description === "string"
            ? cleanHtml(description)
            : `${item.title || "Retro computing item"} - A piece of computing history from the Archive.org collection.`

        // Truncate the description to 100 words
        cleanDescription = truncateText(cleanDescription, 100)

        processedItems.push({
          id: `archive-${item.identifier}`,
          title: item.title || "Untitled Archive.org Item",
          year: year ? Number.parseInt(year) : null,
          imageUrl,
          archiveUrl: `https://archive.org/details/${item.identifier}`,
          wikipediaUrl,
          description: cleanDescription,
        })
      } catch (err) {
        console.error(`Error processing item ${item.identifier}:`, err)
        // Continue to the next item
      }
    }

    return NextResponse.json({
      items: processedItems,
      total: processedItems.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to clean HTML text
function cleanHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") {
    return ""
  }

  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim() // Trim whitespace
}
