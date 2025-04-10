import { type NextRequest, NextResponse } from "next/server"
import { extractYear, generateWikipediaUrl } from "@/lib/archive-search"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Fetch the item page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch item page" }, { status: 500 })
    }

    const html = await response.text()

    // Extract title - improved pattern to match actual Archive.org HTML structure
    const titleMatch =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ||
      html.match(/<div[^>]*class="[^"]*item-title[^"]*"[^>]*>([\s\S]*?)<\/div>/)
    const title = titleMatch ? cleanHtml(titleMatch[1]) : "Unknown Title"

    // Extract description - improved pattern to match actual Archive.org HTML structure
    const descMatch =
      html.match(/<div[^>]*class="[^"]*item-description[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
      html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)
    const description = descMatch
      ? descMatch[1].startsWith("<")
        ? cleanHtml(descMatch[1])
        : descMatch[1]
      : `${title} - A piece of computing history from the Archive.org collection.`

    // Extract year
    const yearMatch = html.match(/<div[^>]*class="[^"]*key-val-big[^"]*"[^>]*>([\s\S]*?)<\/div>/)
    const yearText = yearMatch ? cleanHtml(yearMatch[1]) : ""
    const year = extractYear(yearText) || extractYear(title) || extractYear(description)

    // Find image - improved patterns to match actual Archive.org HTML structure
    const imageMatch =
      html.match(/<img[^>]*class="[^"]*item-image[^"]*"[^>]*src="([^"]*)"/) ||
      // html.match(/<div[^>]*id="theatre-ia-wrap"[^ {2}|| // caused syntax error
	  // html.match(/<div[^>]*id="theatre-ia-wrap"[^ {2}/) || // try removing line altogether
      html.match(/<div[^>]*id="theatre-ia-wrap"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"/) ||
      html.match(/<div[^>]*class="[^"]*item-image-carousel[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"/)

    let imageUrl = imageMatch ? imageMatch[1] : ""

    // If no image found, try to find one in the file list
    if (!imageUrl) {
      const fileListPattern = /<a[^>]*href="([^"]*\.(jpg|jpeg|png|gif))"[^>]*>/gi
      let fileMatch

      while ((fileMatch = fileListPattern.exec(html)) !== null) {
        imageUrl = fileMatch[1]
        if (imageUrl) {
          break
        }
      }
    }

    // Ensure image URL is absolute
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `https://archive.org${imageUrl}`
    }

    // Generate Wikipedia URL
    const wikipediaUrl = generateWikipediaUrl(title)

    return NextResponse.json({
      title,
      year: year ? Number.parseInt(year) : null,
      imageUrl,
      description,
      wikipediaUrl,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to clean HTML text
function cleanHtml(html: string): string {
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
