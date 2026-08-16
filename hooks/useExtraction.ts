import { useCallback, useMemo, useState } from 'react'
import type { ExtractedField, LineItem, ScannedDocument } from '../types/extraction'
import { averageConfidence, isLowConfidence } from '../utils/confidence'

export function useExtraction(document: ScannedDocument) {
  const [fields, setFields] = useState<ExtractedField[]>(document.fields)
  const lineItems: LineItem[] = document.lineItems
  const [verified, setVerified] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const updateValue = useCallback((id: string, value: string) => {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, value } : field)))
    setVerified((current) => (current.includes(id) ? current : [...current, id]))
  }, [])

  const toggleVerified = useCallback((id: string) => {
    setVerified((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }, [])

  const groups = useMemo(() => {
    const order: string[] = []
    fields.forEach((field) => {
      if (!order.includes(field.group)) order.push(field.group)
    })
    return order.map((group) => ({
      group,
      fields: fields.filter((field) => field.group === group),
    }))
  }, [fields])

  const needsReview = useMemo(
    () =>
      fields.filter((field) => isLowConfidence(field.confidence) && !verified.includes(field.id)),
    [fields, verified],
  )

  const overallConfidence = useMemo(
    () =>
      averageConfidence([
        ...fields.map((field) => field.confidence),
        ...lineItems.map((item) => item.confidence),
      ]),
    [fields, lineItems],
  )

  const selectNextFlagged = useCallback(() => {
    if (needsReview.length === 0) return
    const currentIndex = needsReview.findIndex((field) => field.id === selectedId)
    const next = needsReview[(currentIndex + 1) % needsReview.length]
    setSelectedId(next.id)
  }, [needsReview, selectedId])

  return {
    fields,
    lineItems,
    groups,
    verified,
    needsReview,
    overallConfidence,
    selectedId,
    setSelectedId,
    updateValue,
    toggleVerified,
    selectNextFlagged,
  }
}

