import React from 'react';
import { formatConfidence, isLowConfidence } from '../utils/confidence';

interface ConfidenceBadgeProps {
  confidence: number;
  verified?: boolean;
}

export function ConfidenceBadge({ confidence, verified = false }: ConfidenceBadgeProps) {
  const low = isLowConfidence(confidence) && !verified;
  const tone = verified ?
  'bg-good-soft text-good' :
  low ?
  'bg-flag-soft text-flag' :
  'bg-canvas text-ink-soft';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums ${tone}`}
      title={`OCR confidence ${formatConfidence(confidence)}`}>
      
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
        verified ? 'bg-good' : low ? 'bg-flag' : 'bg-ink-faint'}`
        } />
      
      {verified ? 'verified' : formatConfidence(confidence)}
    </span>);

}