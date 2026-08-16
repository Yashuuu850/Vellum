import type { ExtractedField, FieldFormat, LineItem, TextLine } from '../types/extraction'

interface Matcher {
  key: string
  label: string
  group: string
  format: FieldFormat
  patterns: RegExp[]
}

const MONEY = '\\$?\\s*([\\d.,]+[.,]\\d{2}|\\d+)'

const MATCHERS: Matcher[] = [
  {
    key: 'document_number',
    label: 'Document number',
    group: 'Document',
    format: 'text',
    patterns: [
      /(?:invoice|receipt|order|statement|ref(?:erence)?)\s*(?:#|no\.?|num(?:ber)?)?\s*[:#]\s*([A-Za-z0-9][A-Za-z0-9\-\/_]{2,})/i,
      /(?:invoice|receipt|order)\s*(?:#|no\.?|number)\s+([A-Za-z0-9][A-Za-z0-9\-\/_]{2,})/i,
    ],
  },
  {
    key: 'issue_date',
    label: 'Issue date',
    group: 'Document',
    format: 'date',
    patterns: [
      /(?:invoice\s*date|issue\s*date|date\s*issued)\s*[:]?\s*([A-Za-z0-9][A-Za-z0-9,\/\-. ]{4,24})/i,
      /(?:^|\s)date\s*[:]\s*([A-Za-z0-9][A-Za-z0-9,\/\-. ]{4,24})/i,
    ],
  },
  {
    key: 'due_date',
    label: 'Due date',
    group: 'Document',
    format: 'date',
    patterns: [/due\s*(?:date|on|by)?\s*[:]?\s*([A-Za-z0-9][A-Za-z0-9,\/\-. ]{4,24})/i],
  },
  {
    key: 'purchase_order',
    label: 'PO number',
    group: 'Document',
    format: 'text',
    patterns: [/(?:p\.?o\.?|purchase\s*order)\s*(?:#|no\.?|number)?\s*[:#]?\s*([A-Za-z0-9\-\/]{3,})/i],
  },
  {
    key: 'contact_email',
    label: 'Email',
    group: 'Contact',
    format: 'text',
    patterns: [/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/],
  },
  {
    key: 'contact_phone',
    label: 'Phone',
    group: 'Contact',
    format: 'text',
    patterns: [/(?:phone|tel|mobile)\s*[:.]?\s*([+()\d][\d\-().\s]{7,17}\d)/i],
  },
  {
    key: 'subtotal',
    label: 'Subtotal',
    group: 'Totals',
    format: 'currency',
    patterns: [new RegExp(`sub\\s*-?total\\s*[:]?\\s*${MONEY}`, 'i')],
  },
  {
    key: 'tax_rate',
    label: 'Tax rate',
    group: 'Totals',
    format: 'percent',
    patterns: [/(?:tax|vat|gst)\s*\(?\s*([\d.]{1,5})\s*%/i],
  },
  {
    key: 'tax_amount',
    label: 'Tax amount',
    group: 'Totals',
    format: 'currency',
    patterns: [new RegExp(`(?:tax|vat|gst)[^\\d%]{0,14}${MONEY}\\s*$`, 'i')],
  },
  {
    key: 'discount',
    label: 'Discount',
    group: 'Totals',
    format: 'currency',
    patterns: [new RegExp(`discount\\s*[:]?\\s*-?${MONEY}`, 'i')],
  },
  {
    key: 'total_due',
    label: 'Total',
    group: 'Totals',
    format: 'currency',
    patterns: [
      new RegExp(`(?:total\\s*due|amount\\s*due|balance\\s*due|grand\\s*total)\\s*[:]?\\s*${MONEY}`, 'i'),
      new RegExp(`(?:^|\\s)total\\s*[:]?\\s*${MONEY}\\s*$`, 'i'),
    ],
  },
  {
    key: 'payment_terms',
    label: 'Payment terms',
    group: 'Payment',
    format: 'text',
    patterns: [/(?:payment\s*)?terms\s*[:]?\s*([A-Za-z0-9][A-Za-z0-9 \-\/]{1,28})/i],
  },
  {
    key: 'bank_account',
    label: 'Bank account',
    group: 'Payment',
    format: 'text',
    patterns: [/(?:acct|account)\s*(?:#|no\.?|number)?\s*[:#]?\s*(\d[\d\- ]{4,20})/i],
  },
  {
    key: 'routing_number',
    label: 'Routing number',
    group: 'Payment',
    format: 'text',
    patterns: [/routing\s*(?:#|no\.?|number)?\s*[:#]?\s*(\d[\d\- ]{5,14})/i],
  },
]

const LINE_ITEM_PATTERN =
  /^(?:\d{1,2}[.)]\s*)?(.{3,60}?[A-Za-z].{0,60}?)\s+(\d{1,4})\s+\$?\s*([\d,]+\.\d{2})\s+\$?\s*([\d,]+\.\d{2})$/

const NOISE = /^(sub\s*-?total|total|tax|vat|balance|amount due|qty|description)/i

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/[|·•]+$/, '').trim()
}

function detectDocType(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('purchase order')) return 'Purchase order'
  if (lower.includes('invoice')) return 'Invoice'
  if (lower.includes('receipt')) return 'Receipt'
  if (lower.includes('statement')) return 'Statement'
  if (lower.includes('packing slip')) return 'Packing slip'
  if (lower.includes('agreement') || lower.includes('contract')) return 'Agreement'
  return 'Document'
}

function toField(
  matcher: Pick<Matcher, 'key' | 'label' | 'group' | 'format'>,
  value: string,
  line: TextLine,
): ExtractedField {
  return {
    id: `f-${matcher.key}`,
    key: matcher.key,
    label: matcher.label,
    value: clean(value),
    confidence: line.confidence,
    group: matcher.group,
    format: matcher.format,
    pageIndex: line.pageIndex,
    box: line.box,
  }
}

function findParties(lines: TextLine[]): ExtractedField[] {
  const fields: ExtractedField[] = []
  const firstPage = lines.filter((line) => line.pageIndex === 0)

  const heading = firstPage.find(
    (line) => line.text.length > 2 && line.text.length < 60 && /[A-Za-z]{3}/.test(line.text),
  )
  if (heading) {
    fields.push(
      toField(
        { key: 'issuer', label: 'Issued by', group: 'Parties', format: 'text' },
        heading.text,
        heading,
      ),
    )
  }

  const billToIndex = firstPage.findIndex((line) =>
    /^(bill\s*to|billed\s*to|sold\s*to|customer|client)\b/i.test(line.text),
  )
  if (billToIndex >= 0) {
    const inline = firstPage[billToIndex].text.replace(/^[^:]*:\s*/, '')
    const source =
      inline && inline !== firstPage[billToIndex].text
        ? firstPage[billToIndex]
        : firstPage[billToIndex + 1]
    if (source) {
      fields.push(
        toField(
          { key: 'bill_to', label: 'Billed to', group: 'Parties', format: 'text' },
          inline && inline !== firstPage[billToIndex].text ? inline : source.text,
          source,
        ),
      )
    }
  }

  return fields
}

function findGenericPairs(lines: TextLine[], taken: Set<string>): ExtractedField[] {
  const fields: ExtractedField[] = []

  lines.forEach((line) => {
    if (fields.length >= 16) return
    const match = line.text.match(/^([A-Za-z][A-Za-z0-9 &\/#.\-]{1,32})\s*[:]\s*(.{1,80})$/)
    if (!match) return
    const key = match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
    if (!key || taken.has(key)) return
    taken.add(key)
    fields.push(
      toField(
        {
          key,
          label: match[1].trim().replace(/\b\w/g, (char) => char.toUpperCase()),
          group: 'Detected fields',
          format: 'text',
        },
        match[2],
        line,
      ),
    )
  })

  return fields
}

export function parseFields(lines: TextLine[]): ExtractedField[] {
  const fields: ExtractedField[] = []
  const used = new Set<string>()

  MATCHERS.forEach((matcher) => {
    for (const line of lines) {
      let captured: string | null = null
      for (const pattern of matcher.patterns) {
        const match = line.text.match(pattern)
        if (match?.[1]) {
          captured = match[1]
          break
        }
      }
      if (captured) {
        used.add(matcher.key)
        fields.push(toField(matcher, captured, line))
        break
      }
    }
  })

  const parties = findParties(lines)
  parties.forEach((field) => used.add(field.key))

  const result = [...parties, ...fields]

  if (result.length < 4) {
    result.push(...findGenericPairs(lines, used))
  }

  return result
}

export function parseLineItems(lines: TextLine[]): LineItem[] {
  const items: LineItem[] = []

  lines.forEach((line, index) => {
    if (items.length >= 40) return
    if (NOISE.test(line.text)) return
    const match = line.text.match(LINE_ITEM_PATTERN)
    if (!match) return
    items.push({
      id: `li-${line.pageIndex}-${index}`,
      description: clean(match[1]),
      quantity: match[2],
      unitPrice: match[3].replace(/,/g, ''),
      amount: match[4].replace(/,/g, ''),
      confidence: line.confidence,
      pageIndex: line.pageIndex,
      box: line.box,
    })
  })

  return items
}

export function buildRawText(lines: TextLine[]): string {
  const pages = new Map<number, string[]>()
  lines.forEach((line) => {
    const bucket = pages.get(line.pageIndex) ?? []
    bucket.push(line.text)
    pages.set(line.pageIndex, bucket)
  })

  return [...pages.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([pageIndex, texts]) =>
      pages.size > 1 ? `--- Page ${pageIndex + 1} ---\n${texts.join('\n')}` : texts.join('\n'),
    )
    .join('\n\n')
}

export function detectDocumentType(lines: TextLine[]): string {
  return detectDocType(lines.slice(0, 40).map((line) => line.text).join(' '))
}

