import React, { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, EyeOffIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import type { BoundingBox, DocumentPage, ExtractedField, LineItem } from '../types/extraction'
import { isLowConfidence } from '../utils/confidence'

interface Region {
  id: string
  label: string
  box: BoundingBox
  confidence: number
  pageIndex: number
}

interface PageViewerProps {
  pages: DocumentPage[]
  fields: ExtractedField[]
  lineItems: LineItem[]
  verified: string[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const ZOOM_LEVELS = [1, 1.35, 1.75]

export function PageViewer({
  pages,
  fields,
  lineItems,
  verified,
  selectedId,
  onSelect,
}: PageViewerProps) {
  const [zoomIndex, setZoomIndex] = useState(0)
  const [showBoxes, setShowBoxes] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)

  const regions: Region[] = [
    ...fields.map((field) => ({
      id: field.id,
      label: field.label,
      box: field.box,
      confidence: field.confidence,
      pageIndex: field.pageIndex,
    })),
    ...lineItems.map((item) => ({
      id: item.id,
      label: item.description,
      box: item.box,
      confidence: item.confidence,
      pageIndex: item.pageIndex,
    })),
  ]

  useEffect(() => {
    if (!selectedId) return
    const region = regions.find((entry) => entry.id === selectedId)
    if (region && region.pageIndex !== pageIndex) setPageIndex(region.pageIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const page = pages[Math.min(pageIndex, pages.length - 1)]
  const pageRegions = regions.filter((region) => region.pageIndex === page.index)

  return (
    <section
      aria-label="Scanned page"
      className="flex min-h-0 flex-1 flex-col border-line bg-stage max-lg:h-[55vh] max-lg:border-b lg:border-r"
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="font-mono text-xs text-white/55">
            Page {page.index + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}
            disabled={pageIndex >= pages.length - 1}
            aria-label="Next page"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="ml-2 hidden font-mono text-xs text-white/40 sm:inline">
            {pageRegions.length} regions
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowBoxes((value) => !value)}
            aria-pressed={showBoxes}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            {showBoxes ? (
              <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            overlay
          </button>
          <button
            type="button"
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            <ZoomOutIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-10 text-center font-mono text-[11px] tabular-nums text-white/55">
            {Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomIndex((index) => Math.min(ZOOM_LEVELS.length - 1, index + 1))}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            <ZoomInIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div
          className="relative mx-auto shadow-2xl"
          style={{
            width: `${Math.min(100, 100 * ZOOM_LEVELS[zoomIndex])}%`,
            maxWidth: `${640 * ZOOM_LEVELS[zoomIndex]}px`,
          }}
        >
          <img
            src={page.src}
            alt={`Page ${page.index + 1} of the uploaded document`}
            className="block w-full select-none"
            draggable={false}
          />
          {showBoxes &&
            pageRegions.map((region) => {
              const selected = region.id === selectedId
              const flagged = isLowConfidence(region.confidence) && !verified.includes(region.id)
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onSelect(region.id)}
                  aria-label={`${region.label} on page`}
                  className={`absolute rounded-[3px] border transition-colors duration-150 ease-out focus:outline-none ${
                    selected
                      ? 'border-accent bg-accent/25 ring-2 ring-accent/60'
                      : flagged
                        ? 'border-flag bg-flag/15 hover:bg-flag/25'
                        : 'border-accent/45 bg-accent/5 hover:bg-accent/15'
                  }`}
                  style={{
                    left: `${region.box.x}%`,
                    top: `${region.box.y}%`,
                    width: `${region.box.w}%`,
                    height: `${region.box.h}%`,
                  }}
                />
              )
            })}
        </div>
      </div>
    </section>
  )
}

