import { useCallback, useMemo, useState } from 'react';
import { sampleDocument } from '../data/sampleDocument';
import type { ExtractedField, FieldGroup, LineItem } from '../types/extraction';
import { averageConfidence, isLowConfidence } from '../utils/confidence';

const GROUP_ORDER: FieldGroup[] = ['Document', 'Vendor', 'Bill to', 'Totals', 'Payment'];

export function useExtraction() {
  const [fields, setFields] = useState<ExtractedField[]>(sampleDocument.fields);
  const [lineItems] = useState<LineItem[]>(sampleDocument.lineItems);
  const [verified, setVerified] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updateValue = useCallback((id: string, value: string) => {
    setFields((current) =>
    current.map((field) => field.id === id ? { ...field, value } : field)
    );
    setVerified((current) => current.includes(id) ? current : [...current, id]);
  }, []);

  const toggleVerified = useCallback((id: string) => {
    setVerified((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);

  const groups = useMemo(
    () =>
    GROUP_ORDER.map((group) => ({
      group,
      fields: fields.filter((field) => field.group === group)
    })).filter((entry) => entry.fields.length > 0),
    [fields]
  );

  const needsReview = useMemo(
    () => fields.filter((field) => isLowConfidence(field.confidence) && !verified.includes(field.id)),
    [fields, verified]
  );

  const overallConfidence = useMemo(
    () =>
    averageConfidence([
    ...fields.map((field) => field.confidence),
    ...lineItems.map((item) => item.confidence)]
    ),
    [fields, lineItems]
  );

  const selectNextFlagged = useCallback(() => {
    if (needsReview.length === 0) return;
    const currentIndex = needsReview.findIndex((field) => field.id === selectedId);
    const next = needsReview[(currentIndex + 1) % needsReview.length];
    setSelectedId(next.id);
  }, [needsReview, selectedId]);

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
    selectNextFlagged
  };
}