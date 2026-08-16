import * as pdfjsLib from 'pdfjs-dist'
import type { TextLine } from '../types/extraction'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs'

export interface RenderedPage {
  index: number
  src: string
  width: number
  height: number
  textLines: TextLine[]
}

const MAX_RENDER_WIDTH = 1500

interface RawItem {
  text: string
  left: number
  top: number
  width: number
  height: number
}

function toTextLines(items: RawItem[], pageWidth: number, pageHeight: number, pageIndex: number): TextLine[] {
  const sorted = [...items].sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top))
  const clusters: RawItem[][] = []

  sorted.forEach((item) => {
    const cluster = clusters[clusters.length - 1]
    const reference = cluster?.[0]
    if (reference && Math.abs(item.top - reference.top) < Math.max(4, reference.height * 0.6)) {
      cluster.push(item)
    } else {
      clusters.push([item])
    }
  })

  return clusters
    .map((cluster, clusterIndex) => {
      const ordered = [...cluster].sort((a, b) => a.left - b.left)
      let text = ''
      let cursor = ordered[0].left

      ordered.forEach((item, index) => {
        const gap = item.left - cursor
        if (index > 0 && gap > item.height * 0.3 && !text.endsWith(' ')) text += ' '
        text += item.text
        cursor = item.left + item.width
      })

      const left = Math.min(...ordered.map((item) => item.left))
      const right = Math.max(...ordered.map((item) => item.left + item.width))
      const top = Math.min(...ordered.map((item) => item.top))
      const bottom = Math.max(...ordered.map((item) => item.top + item.height))

      return {
        text: text.replace(/\s+/g, ' ').trim(),
        confidence: 1,
        pageIndex,
        source: 'text-layer' as const,
        box: {
          x: (left / pageWidth) * 100,
          y: (top / pageHeight) * 100,
          w: (Math.max(right - left, 6) / pageWidth) * 100,
          h: (Math.max(bottom - top, 8) / pageHeight) * 100,
        },
        key: clusterIndex,
      }
    })
    .filter((line) => line.text.length > 0)
    .map(({ key, ...line }) => line)
}

export async function renderPdfPages(
  file: File,
  maxPages: number,
  onPage: (pageNumber: number, total: number, src: string) => void,
): Promise<RenderedPage[]> {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const total = Math.min(pdf.numPages, maxPages)
  const pages: RenderedPage[] = []

  for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const base = page.getViewport({ scale: 1 })
    const scale = Math.min(2.2, MAX_RENDER_WIDTH / base.width)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not render this PDF.')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: context, viewport }).promise

    const src = canvas.toDataURL('image/jpeg', 0.85)

    const content = await page.getTextContent()
    const items: RawItem[] = (content.items as unknown[])
      .map((entry) => entry as { str?: string; transform?: number[]; width?: number })
      .filter((entry) => typeof entry.str === 'string' && entry.str.trim().length > 0 && entry.transform)
      .map((entry) => {
        const matrix = pdfjsLib.Util.transform(viewport.transform, entry.transform as number[])
        const height = Math.hypot(matrix[2], matrix[3]) || 10
        return {
          text: entry.str as string,
          left: matrix[4],
          top: matrix[5] - height,
          width: (entry.width ?? 0) * scale,
          height,
        }
      })

    pages.push({
      index: pageNumber - 1,
      src,
      width: canvas.width,
      height: canvas.height,
      textLines: toTextLines(items, canvas.width, canvas.height, pageNumber - 1),
    })

    onPage(pageNumber, total, src)
  }

  return pages
}

export function pageHasUsableText(page: RenderedPage): boolean {
  const characters = page.textLines.reduce((sum, line) => sum + line.text.length, 0)
  return page.textLines.length >= 3 && characters >= 60
}

