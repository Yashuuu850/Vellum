import type { PipelineStep, ScannedDocument } from '../types/extraction';

export const pipelineSteps: PipelineStep[] = [
{ id: 'upload', label: 'Uploading document' },
{ id: 'raster', label: 'Rasterizing pages at 300 dpi' },
{ id: 'ocr', label: 'Running OCR text recognition' },
{ id: 'fields', label: 'Detecting fields and line items' },
{ id: 'score', label: 'Scoring extraction confidence' }];


export const sampleDocument: ScannedDocument = {
  fileName: 'northgate-invoice-NG-873401.pdf',
  fileSize: '1.4 MB',
  pageImage: "/20f95937-f3a8-4321-b6ba-8394080173da.jpg",

  pageCount: 1,
  docType: 'Invoice',
  model: 'ocr-vision-2',
  fields: [
  {
    id: 'f-invoice-number',
    key: 'invoice_number',
    label: 'Invoice number',
    value: 'NG-873401',
    confidence: 0.99,
    group: 'Document',
    format: 'text',
    box: { x: 75.5, y: 10.6, w: 15, h: 2.2 }
  },
  {
    id: 'f-invoice-date',
    key: 'invoice_date',
    label: 'Invoice date',
    value: '2023-10-14',
    confidence: 0.96,
    group: 'Document',
    format: 'date',
    box: { x: 76, y: 12.7, w: 14, h: 2.2 }
  },
  {
    id: 'f-due-date',
    key: 'due_date',
    label: 'Due date',
    value: '2023-11-13',
    confidence: 0.91,
    group: 'Document',
    format: 'date',
    box: { x: 76, y: 14.7, w: 14, h: 2.2 }
  },
  {
    id: 'f-vendor-name',
    key: 'vendor_name',
    label: 'Vendor name',
    value: 'Northgate Supply Co.',
    confidence: 0.98,
    group: 'Vendor',
    format: 'text',
    box: { x: 17, y: 7.2, w: 31, h: 2.8 }
  },
  {
    id: 'f-vendor-address',
    key: 'vendor_address',
    label: 'Vendor address',
    value: '45 Enterprise Way, Springfield, IL 62704',
    confidence: 0.87,
    group: 'Vendor',
    format: 'text',
    box: { x: 17, y: 10.5, w: 32, h: 2.2 }
  },
  {
    id: 'f-vendor-email',
    key: 'vendor_email',
    label: 'Vendor email',
    value: 'accounts@northgatesupply.com',
    confidence: 0.94,
    group: 'Vendor',
    format: 'text',
    box: { x: 17, y: 14.3, w: 32, h: 2.2 }
  },
  {
    id: 'f-customer-name',
    key: 'customer_name',
    label: 'Customer',
    value: 'Atlas Industries',
    confidence: 0.97,
    group: 'Bill to',
    format: 'text',
    box: { x: 10.5, y: 21.2, w: 20, h: 2.3 }
  },
  {
    id: 'f-customer-contact',
    key: 'customer_contact',
    label: 'Attention',
    value: 'Sarah Jenkins',
    confidence: 0.72,
    group: 'Bill to',
    format: 'text',
    box: { x: 10.5, y: 23.4, w: 22, h: 2.2 }
  },
  {
    id: 'f-customer-address',
    key: 'customer_address',
    label: 'Billing address',
    value: '789 Innovation Drive, Chicago, IL 60611',
    confidence: 0.89,
    group: 'Bill to',
    format: 'text',
    box: { x: 10.5, y: 25.5, w: 24, h: 4.6 }
  },
  {
    id: 'f-subtotal',
    key: 'subtotal',
    label: 'Subtotal',
    value: '739.50',
    confidence: 0.99,
    group: 'Totals',
    format: 'currency',
    box: { x: 77, y: 68.7, w: 13, h: 2.6 }
  },
  {
    id: 'f-tax-rate',
    key: 'tax_rate',
    label: 'Tax rate',
    value: '8.25',
    confidence: 0.68,
    group: 'Totals',
    format: 'percent',
    box: { x: 66, y: 71.9, w: 11, h: 2.6 }
  },
  {
    id: 'f-tax',
    key: 'tax_amount',
    label: 'Tax amount',
    value: '61.01',
    confidence: 0.81,
    group: 'Totals',
    format: 'currency',
    box: { x: 77, y: 71.9, w: 13, h: 2.6 }
  },
  {
    id: 'f-total',
    key: 'total_due',
    label: 'Total due',
    value: '800.51',
    confidence: 0.99,
    group: 'Totals',
    format: 'currency',
    box: { x: 77, y: 75.2, w: 13, h: 2.6 }
  },
  {
    id: 'f-terms',
    key: 'payment_terms',
    label: 'Payment terms',
    value: 'Net 30',
    confidence: 0.95,
    group: 'Payment',
    format: 'text',
    box: { x: 10.5, y: 84.4, w: 19, h: 2.2 }
  },
  {
    id: 'f-account',
    key: 'bank_account',
    label: 'Bank account',
    value: '34567890',
    confidence: 0.76,
    group: 'Payment',
    format: 'text',
    box: { x: 37, y: 89.1, w: 14, h: 2.3 }
  },
  {
    id: 'f-routing',
    key: 'routing_number',
    label: 'Routing number',
    value: '071000021',
    confidence: 0.83,
    group: 'Payment',
    format: 'text',
    box: { x: 56, y: 89.1, w: 16, h: 2.3 }
  }],

  lineItems: [
  {
    id: 'li-1',
    description: 'Office Printer Paper (A4, 5 reams)',
    quantity: '5',
    unitPrice: '12.50',
    amount: '62.50',
    confidence: 0.97,
    box: { x: 10.5, y: 36.1, w: 79, h: 3.5 }
  },
  {
    id: 'li-2',
    description: 'Toner Cartridge (HP 58X)',
    quantity: '2',
    unitPrice: '110.00',
    amount: '220.00',
    confidence: 0.95,
    box: { x: 10.5, y: 39.7, w: 79, h: 3.5 }
  },
  {
    id: 'li-3',
    description: 'Shipping Boxes (18x12x12, 50-pack)',
    quantity: '3',
    unitPrice: '45.00',
    amount: '135.00',
    confidence: 0.79,
    box: { x: 10.5, y: 43.3, w: 79, h: 3.5 }
  },
  {
    id: 'li-4',
    description: 'Packing Tape (Standard, 6-pack)',
    quantity: '4',
    unitPrice: '18.00',
    amount: '72.00',
    confidence: 0.93,
    box: { x: 10.5, y: 46.9, w: 79, h: 3.5 }
  },
  {
    id: 'li-5',
    description: 'Heavy-Duty Shelving Unit',
    quantity: '1',
    unitPrice: '250.00',
    amount: '250.00',
    confidence: 0.9,
    box: { x: 10.5, y: 50.5, w: 79, h: 3.5 }
  }],

  rawText: `Northgate Supply Co.
45 Enterprise Way | Springfield, IL 62704
Phone: (217) 555-0190
Email: accounts@northgatesupply.com

INVOICE
Invoice #: NG-873401
Date: Oct 14, 2023
Due Date: Nov 13, 2023

Bill To:
ATLAS INDUSTRIES
Attn: Sarah Jenkins
789 Innovation Drive
Chicago, IL 60611

Description                              Qty   Unit Price   Amount
1. Office Printer Paper (A4, 5 reams)      5       $12.50    $62.50
2. Toner Cartridge (HP 58X)                2      $110.00   $220.00
3. Shipping Boxes (18x12x12, 50-pack)      3       $45.00   $135.00
4. Packing Tape (Standard, 6-pack)         4       $18.00    $72.00
5. Heavy-Duty Shelving Unit                1      $250.00   $250.00

Subtotal:   $739.50
Tax (8.25%): $61.01
TOTAL:      $800.51

Payment Terms: Net 30
Make checks payable to Northgate Supply Co.
Bank Details: Chase Bank | Acct #: 34567890 | Routing: 071000021`
};