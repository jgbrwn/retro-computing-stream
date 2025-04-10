"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowUpCircle, ExternalLink, Loader2, RefreshCw, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { searchArchiveForRetroComputing } from "@/lib/archive-search"

export type RetroItem = {
  id: string
  title: string
  year: number | null
  imageUrl: string
  archiveUrl: string
  wikipediaUrl: string
  description: string
}

// Fallback items in case the dynamic search fails
const FALLBACK_ITEMS: RetroItem[] = [
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
]

export default function RetroComputingStream() {
  const [items, setItems] = useState<RetroItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [page, setPage] = useState(1)
  const streamRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<RetroItem[]>([])
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fetchingRef = useRef(false)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // Initial load
  useEffect(() => {
    const loadInitialItems = async () => {
      try {
        setLoading(true)
        let initialItems = await searchArchiveForRetroComputing(1)

        // If no items found, retry with different search terms
        while (initialItems.length === 0 && retryCountRef.current < maxRetries) {
          console.log(`Retry ${retryCountRef.current + 1}/${maxRetries} for initial items`)
          retryCountRef.current++
          initialItems = await searchArchiveForRetroComputing(1)
        }

        // If still no items, use fallback
        if (initialItems.length === 0) {
          console.log("Using fallback items for initial load")
          initialItems = FALLBACK_ITEMS.map((item) => ({
            ...item,
            id: `${item.id}-${Date.now()}`, // Ensure unique IDs
          }))
        }

        setItems(initialItems)

        // Pre-fetch the next batch to have them ready
        fetchingRef.current = true
        retryCountRef.current = 0
        let nextBatch = await searchArchiveForRetroComputing(2)

        // If no items found, retry with different search terms
        while (nextBatch.length === 0 && retryCountRef.current < maxRetries) {
          console.log(`Retry ${retryCountRef.current + 1}/${maxRetries} for next batch`)
          retryCountRef.current++
          nextBatch = await searchArchiveForRetroComputing(2)
        }

        queueRef.current = nextBatch
        fetchingRef.current = false

        setPage(2)
        setLoading(false)
      } catch (err) {
        console.error("Error loading initial items:", err)
        setError("Failed to load retro computing items. Please try again later.")
        setLoading(false)
      }
    }

    loadInitialItems()

    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current)
      }
    }
  }, [])

  // Set up auto-scrolling
  useEffect(() => {
    if (autoScroll) {
      scrollTimerRef.current = setInterval(() => {
        if (streamRef.current) {
          streamRef.current.scrollBy({
            top: 1,
            behavior: "smooth",
          })
        }
      }, 30)
    } else if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current)
    }

    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current)
      }
    }
  }, [autoScroll])

  // Handle infinite scrolling
  useEffect(() => {
    const handleScroll = async () => {
      if (!streamRef.current || loading || fetchingRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = streamRef.current

      // If we're near the bottom, add more items
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        // Add the pre-fetched items from the queue
        if (queueRef.current.length > 0) {
          setItems((prev) => [...prev, ...queueRef.current])
          queueRef.current = []

          // Fetch the next batch for the queue
          fetchingRef.current = true
          retryCountRef.current = 0
          try {
            const nextPage = page + 1
            let nextBatch = await searchArchiveForRetroComputing(nextPage)

            // If no items found, retry with different search terms
            while (nextBatch.length === 0 && retryCountRef.current < maxRetries) {
              console.log(`Retry ${retryCountRef.current + 1}/${maxRetries} for page ${nextPage}`)
              retryCountRef.current++
              nextBatch = await searchArchiveForRetroComputing(nextPage)
            }

            // If still no items after retries, use fallback items
            if (nextBatch.length === 0) {
              console.log("Using fallback items for page", nextPage)
              nextBatch = FALLBACK_ITEMS.map((item) => ({
                ...item,
                id: `${item.id}-${nextPage}-${Date.now()}`, // Ensure unique IDs
              }))
            }

            queueRef.current = nextBatch
            setPage(nextPage)
          } catch (err) {
            console.error("Error fetching next batch:", err)
          } finally {
            fetchingRef.current = false
          }
        }
      }
    }

    const scrollContainer = streamRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [loading, page])

  const scrollToTop = () => {
    if (streamRef.current) {
      streamRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  const refreshStream = async () => {
    try {
      setLoading(true)
      setPage(1)
      retryCountRef.current = 0

      let freshItems = await searchArchiveForRetroComputing(1)

      // If no items found, retry with different search terms
      while (freshItems.length === 0 && retryCountRef.current < maxRetries) {
        console.log(`Retry ${retryCountRef.current + 1}/${maxRetries} for refresh`)
        retryCountRef.current++
        freshItems = await searchArchiveForRetroComputing(1)
      }

      // If still no items, use fallback
      if (freshItems.length === 0) {
        console.log("Using fallback items for refresh")
        freshItems = FALLBACK_ITEMS.map((item) => ({
          ...item,
          id: `${item.id}-refresh-${Date.now()}`, // Ensure unique IDs
        }))
      }

      setItems(freshItems)

      // Pre-fetch the next batch
      fetchingRef.current = true
      retryCountRef.current = 0
      let nextBatch = await searchArchiveForRetroComputing(2)

      // If no items found, retry with different search terms
      while (nextBatch.length === 0 && retryCountRef.current < maxRetries) {
        console.log(`Retry ${retryCountRef.current + 1}/${maxRetries} for next batch after refresh`)
        retryCountRef.current++
        nextBatch = await searchArchiveForRetroComputing(2)
      }

      queueRef.current = nextBatch
      fetchingRef.current = false

      setPage(2)
      setLoading(false)

      if (streamRef.current) {
        streamRef.current.scrollTo({
          top: 0,
          behavior: "auto",
        })
      }
    } catch (err) {
      console.error("Error refreshing stream:", err)
      setError("Failed to refresh the stream. Please try again.")
      setLoading(false)
    }
  }

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-900 rounded-lg p-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={refreshStream}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={toggleAutoScroll}
          title={autoScroll ? "Pause scrolling" : "Resume scrolling"}
        >
          {autoScroll ? <Pause className="h-5 w-5 text-blue-400" /> : <Play className="h-5 w-5 text-green-400" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={scrollToTop}
          title="Scroll to top"
        >
          <ArrowUpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={refreshStream}
          title="Refresh stream"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div
        ref={streamRef}
        className="h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.length === 0 && loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Searching the archives for retro computing treasures...</p>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 cursor-pointer transition-all ${
                    !autoScroll ? "ring-2 ring-blue-500/50" : ""
                  }`}
                  onClick={toggleAutoScroll}
                >
                  <div className="relative aspect-video bg-gray-800">
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=400&width=600"}
                      alt={item.title}
                      fill
                      className="object-contain"
                      unoptimized
                      onError={(e) => {
                        // Fallback to a placeholder if the image fails to load
                        const target = e.target as HTMLImageElement
                        console.warn(`Image failed to load: ${item.imageUrl}`)
                        target.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <div className="flex justify-between items-end">
                          <h2 className="text-xl font-bold text-white">{item.title}</h2>
                          {item.year && <span className="text-3xl font-mono text-yellow-400">{item.year}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={item.archiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm bg-blue-900 hover:bg-blue-800 text-blue-100 px-3 py-1 rounded-full transition-colors"
                        onClick={(e) => e.stopPropagation()} // Prevent toggling scroll when clicking links
                      >
                        <span>Archive.org</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href={item.wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded-full transition-colors"
                        onClick={(e) => e.stopPropagation()} // Prevent toggling scroll when clicking links
                      >
                        <span>Wikipedia</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {fetchingRef.current && (
              <div className="space-y-2">
                <Skeleton className="h-64 w-full bg-gray-800" />
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
              </div>
            )}
          </div>
        )}
      </div>

      {autoScroll && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 pointer-events-none flex items-center justify-center">
          <p className="text-blue-400 text-sm animate-pulse">Auto-scrolling active • Click any item to pause</p>
        </div>
      )}

      {!autoScroll && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 pointer-events-none flex items-center justify-center">
          <p className="text-yellow-400 text-sm">Scrolling paused • Click any item to resume</p>
        </div>
      )}
    </div>
  )
}
