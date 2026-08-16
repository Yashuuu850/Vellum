import type { DocumentPage, ScannedDocument, TextLine } from '../types/extraction'
import { ocrPages } from './ocr'
import { pageHasUsableText, renderPdfPages, type RenderedPage } from './pdf'
import { buildRawText, detectDocumentType, parseFields, parseLineItems } from './parseDocument'

export const MAX_PAGES = 8

export interface ProgressUpdate {
  label: string
  value: number
  preview?: string
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function finalize(
  fileName: string,
  fileSize: string,
  pages: DocumentPage[],
  lines: TextLine[],
  readMethod: string,
): ScannedDocument {
  const sorted = [...lines].sort((a, b) =>
    a.pageIndex === b.pageIndex ? a.box.y - b.box.y : a.pageIndex - b.pageIndex,
  )

  return {
    fileName,
    fileSize,
    pageCount: pages.length,
    pages,
    docType: detectDocumentType(sorted),
    readMethod,
    fields: parseFields(sorted),
    lineItems: parseLineItems(sorted),
    rawText: buildRawText(sorted),
  }
}

function toDocumentPages(pages: RenderedPage[]): DocumentPage[] {
  return pages.map((page) => ({
    index: page.index,
    src: page.src,
    width: page.width,
    height: page.height,
  }))
}

export async function processPdf(
  file: File,
  onProgress: (update: ProgressUpdate) => void,
): Promise<ScannedDocument> {
  onProgress({ label: 'Reading PDF file', value: 4 })

  const pages = await renderPdfPages(file, MAX_PAGES, (pageNumber, total, src) => {
    onProgress({
      label: `Rendering page ${pageNumber} of ${total}`,
      value: 4 + (pageNumber / total) * 26,
      preview: pageNumber === 1 ? src : undefined,
    })
  })

  if (pages.length === 0) throw new Error('This PDF has no readable pages.')

  const digitalPages = pages.filter(pageHasUsableText)
  const scannedPages = pages.filter((page) => !pageHasUsableText(page))
  const lines: TextLine[] = digitalPages.flatMap((page) => page.textLines)

  if (scannedPages.length > 0) {
    onProgress({ label: 'No text layer found — starting OCR', value: 32 })
    const ocrLines = await ocrPages(scannedPages, (ordinal, total, ratio) => {
      onProgress({
        label: `Recognizing text on page ${scannedPages[ordinal].index + 1} · ${Math.round(ratio * 100)}%`,
        value: 32 + ((ordinal + ratio) / total) * 56,
      })
    })
    lines.push(...ocrLines)
  } else {
    onProgress({ label: 'Embedded text layer found — skipping OCR', value: 72 })
  }

  onProgress({ label: 'Detecting fields and line items', value: 94 })

  const readMethod =
    scannedPages.length === 0 ? 'text layer' : digitalPages.length === 0 ? 'OCR' : 'text layer + OCR'

  const result = finalize(file.name, formatFileSize(file.size), toDocumentPages(pages), lines, readMethod)
  onProgress({ label: 'Scoring extraction confidence', value: 100 })
  return result
}

function loadImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Could not load the sample document.'))
    image.src = src
  })
}

/** Runs the same OCR path over a hosted page image (used by the sample scan). */
export async function processImage(
  src: string,
  fileName: string,
  onProgress: (update: ProgressUpdate) => void,
): Promise<ScannedDocument> {
  onProgress({ label: 'Loading sample page', value: 8, preview: src })
  const { width, height } = await loadImage(src)

  const page: RenderedPage = { index: 0, src, width, height, textLines: [] }

  onProgress({ label: 'Starting OCR', value: 24 })
  const lines = await ocrPages([page], (_ordinal, _total, ratio) => {
    onProgress({
      label: `Recognizing text on page 1 · ${Math.round(ratio * 100)}%`,
      value: 24 + ratio * 66,
    })
  })

  onProgress({ label: 'Detecting fields and line items', value: 94 })
  const result = finalize(fileName, 'sample', toDocumentPages([page]), lines, 'OCR')
  onProgress({ label: 'Scoring extraction confidence', value: 100 })
  return result
}

