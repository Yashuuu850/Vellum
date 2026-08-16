export type Stage = 'idle' | 'processing' | 'review';

export type FieldGroup = 'Document' | 'Vendor' | 'Bill to' | 'Totals' | 'Payment';

export type FieldFormat = 'text' | 'date' | 'currency' | 'percent';

/** Position on the page, expressed as percentages of the page width / height. */
export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExtractedField {
  id: string;
  key: string;
  label: string;
  value: string;
  confidence: number;
  group: FieldGroup;
  format: FieldFormat;
  box: BoundingBox;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  confidence: number;
  box: BoundingBox;
}

export interface ScannedDocument {
  fileName: string;
  fileSize: string;
  pageImage: string;
  pageCount: number;
  docType: string;
  model: string;
  fields: ExtractedField[];
  lineItems: LineItem[];
  rawText: string;
}

export interface PipelineStep {
  id: string;
  label: string;
}