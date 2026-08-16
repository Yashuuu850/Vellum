export type Stage = 'idle' | 'processing' | 'review'

export type FieldFormat = 'text' | 'date' | 'currency' | 'percent'

/** Position on the page, expressed as percentages of the page width / height. */
export interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
}

/** A single recognized line of text, from the PDF text layer or from OCR. */
export interface TextLine {
  text: string
  confidence: number
  pageIndex: number
  box: BoundingBox
  source: 'text-layer' | 'ocr'
}

export interface ExtractedField {
  id: string
  key: string
  label: string
  value: string
  confidence: number
  group: string
  format: FieldFormat
  pageIndex: number
  box: BoundingBox
}

export interface LineItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
  amount: string
  confidence: number
  pageIndex: number
  box: BoundingBox
}

export interface DocumentPage {
  index: number
  src: string
  width: number
  height: number
}

export interface ScannedDocument {
  fileName: string
  fileSize: string
  pageCount: number
  pages: DocumentPage[]
  docType: string
  /** How the text was recovered: embedded text layer, OCR, or a mix. */
  readMethod: string
  fields: ExtractedField[]
  lineItems: LineItem[]
  rawText: string
}

