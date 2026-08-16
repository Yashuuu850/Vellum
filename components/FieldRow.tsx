import React, { useEffect, useRef } from 'react'
import { CheckIcon, TriangleAlertIcon } from 'lucide-react'
import type { ExtractedField } from '../types/extraction'
import { isLowConfidence } from '../utils/confidence'
import { ConfidenceBadge } from './ConfidenceBadge'

interface FieldRowProps {
  field: ExtractedField
  verified: boolean
  selected: boolean
  onSelect: (id: string) => void
  onChange: (id: string, value: string) => void
  onToggleVerified: (id: string) => void
}

const AFFIX: Record<ExtractedField['format'], { prefix?: string; suffix?: string }> = {
  text: {},
  date: {},
  currency: { prefix: '$' },
  percent: { suffix: '%' },
}

export function FieldRow({
  field,
  verified,
  selected,
  onSelect,
  onChange,
  onToggleVerified,
}: FieldRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const flagged = isLowConfidence(field.confidence) && !verified
  const affix = AFFIX[field.format]

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selected])

  return (
    <div
      ref={ref}
      onFocus={() => onSelect(field.id)}
      onClick={() => onSelect(field.id)}
      className={`border-l-2 px-4 py-3 transition-colors duration-150 ease-out ${
        selected
          ? 'border-l-accent bg-accent-soft'
          : flagged
            ? 'border-l-flag bg-flag-soft/60'
            : 'border-l-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={field.id}
          className="text-[12px] font-medium text-ink-soft"
        >
          {field.label}
        </label>
        <ConfidenceBadge confidence={field.confidence} verified={verified} />
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <div
          className={`flex flex-1 items-center rounded-md border bg-surface px-2.5 transition-colors duration-150 ease-out focus-within:border-accent ${
            flagged ? 'border-flag-line' : 'border-line'
          }`}
        >
          {affix.prefix && (
            <span className="font-mono text-[13px] text-ink-faint">{affix.prefix}</span>
          )}
          <input
            id={field.id}
            value={field.value}
            onChange={(event) => onChange(field.id, event.target.value)}
            className="w-full bg-transparent py-1.5 font-mono text-[13px] text-ink outline-none"
          />
          {affix.suffix && (
            <span className="font-mono text-[13px] text-ink-faint">{affix.suffix}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleVerified(field.id)}
          aria-pressed={verified}
          aria-label={`Mark ${field.label} as verified`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            verified
              ? 'border-good/30 bg-good-soft text-good'
              : 'border-line text-ink-faint hover:border-line-strong hover:text-ink'
          }`}
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {flagged && (
        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-flag">
          <TriangleAlertIcon className="h-3 w-3" aria-hidden="true" />
          low confidence — check against the page
        </p>
      )}
    </div>
  )
}

