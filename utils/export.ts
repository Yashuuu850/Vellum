import type { ExtractedField, LineItem } from '../types/extraction'

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCsv(fields: ExtractedField[], lineItems: LineItem[]): string {
  const rows: string[] = ['section,key,label,value,confidence']

  fields.forEach((field) => {
    rows.push(
      [
        escapeCsv(field.group),
        escapeCsv(field.key),
        escapeCsv(field.label),
        escapeCsv(field.value),
        field.confidence.toFixed(2),
      ].join(','),
    )
  })

  lineItems.forEach((item, index) => {
    rows.push(
      [
        'Line items',
        `line_item_${index + 1}`,
        escapeCsv(item.description),
        escapeCsv(`${item.quantity} x ${item.unitPrice} = ${item.amount}`),
        item.confidence.toFixed(2),
      ].join(','),
    )
  })

  return rows.join('\n')
}

export function buildJson(
  fileName: string,
  docType: string,
  fields: ExtractedField[],
  lineItems: LineItem[],
): string {
  const payload = {
    source: fileName,
    documentType: docType,
    extractedAt: new Date().toISOString(),
    fields: fields.reduce<Record<string, { value: string; confidence: number }>>((acc, field) => {
      acc[field.key] = { value: field.value, confidence: Number(field.confidence.toFixed(2)) }
      return acc
    }, {}),
    lineItems: lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
      confidence: Number(item.confidence.toFixed(2)),
    })),
  }

  return JSON.stringify(payload, null, 2)
}

export function downloadFile(fileName: string, mimeType: string, content: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

