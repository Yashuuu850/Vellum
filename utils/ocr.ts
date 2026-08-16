import { createWorker } from 'tesseract.js'
import type { TextLine } from '../types/extraction'
import type { RenderedPage } from './pdf'

interface OcrLine {
  text?: string
  confidence?: number
  bbox?: { x0: number; y0: number; x1: number; y1: number }
}

/** Tesseract v5 returns nested blocks; older shapes expose a flat `lines` array. */
function flattenLines(data: unknown): OcrLine[] {
  const payload = data as {
    lines?: OcrLine[]
    blocks?: { paragraphs?: { lines?: OcrLine[] }[] }[]
  }

  if (Array.isArray(payload.lines) && payload.lines.length > 0) return payload.lines

  const lines: OcrLine[] = []
  payload.blocks?.forEach((block) => {
    block.paragraphs?.forEach((paragraph) => {
      paragraph.lines?.forEach((line) => lines.push(line))
    })
  })
  return lines
}

export async function ocrPages(
  pages: RenderedPage[],
  onProgress: (pageOrdinal: number, total: number, ratio: number) => void,
): Promise<TextLine[]> {
  if (pages.length === 0) return []

  const cursor = { ordinal: 0 }
  const worker = await createWorker('eng', 1, {
    logger: (message: { status?: string; progress?: number }) => {
      if (message.status === 'recognizing text') {
        onProgress(cursor.ordinal, pages.length, message.progress ?? 0)
      }
    },
  })

  const results: TextLine[] = []

  try {
    for (let index = 0; index < pages.length; index += 1) {
      cursor.ordinal = index
      const page = pages[index]
      const { data } = await worker.recognize(page.src, {}, { blocks: true, text: true })

      flattenLines(data).forEach((line) => {
        const text = (line.text ?? '').replace(/\s+/g, ' ').trim()
        if (!text || !line.bbox) return
        results.push({
          text,
          confidence: Math.min(1, Math.max(0, (line.confidence ?? 0) / 100)),
          pageIndex: page.index,
          source: 'ocr',
          box: {
            x: (line.bbox.x0 / page.width) * 100,
            y: (line.bbox.y0 / page.height) * 100,
            w: ((line.bbox.x1 - line.bbox.x0) / page.width) * 100,
            h: ((line.bbox.y1 - line.bbox.y0) / page.height) * 100,
          },
        })
      })

      onProgress(index, pages.length, 1)
    }
  } finally {
    await worker.terminate()
  }

  return results
}

