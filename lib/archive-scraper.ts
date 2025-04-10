import type { RetroItem } from "@/components/retro-computing-stream"

// Function to search Archive.org and extract retro computing items
export async function searchArchiveItems(
  searchTerm: string,
  cursor: string | null = null,
): Promise<{ items: RetroItem[]; cursor: string | null }> {
  try {
    // Build the API URL
    let apiUrl = `/api/archive-search?query=${encodeURIComponent(searchTerm)}`
    if (cursor) {
      apiUrl += `&cursor=${cursor}`
    }

    // Fetch results from our API route
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Filter out items without images or with placeholder images
    const validItems = data.items.filter(
      (item: RetroItem) => item.imageUrl && !item.imageUrl.includes("placeholder") && item.title && item.archiveUrl,
    )

    return {
      items: validItems,
      cursor: data.cursor,
    }
  } catch (error) {
    console.error("Error searching Archive.org:", error)
    return {
      items: [],
      cursor: null,
    }
  }
}

// Function to fetch item details from an Archive.org page
export async function fetchItemDetails(url: string): Promise<Partial<RetroItem> | null> {
  try {
    const response = await fetch(`/api/archive-item?url=${encodeURIComponent(url)}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching item details:", error)
    return null
  }
}
