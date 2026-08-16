import React from 'react'
import type { LineItem } from '../types/extraction'
import { isLowConfidence } from '../utils/confidence'
import { ConfidenceBadge } from './ConfidenceBadge'

interface LineItemsTableProps {
  lineItems: LineItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function LineItemsTable({ lineItems, selectedId, onSelect }: LineItemsTableProps) {
  const total = lineItems.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="p-4">
      <table className="w-full border-separate border-spacing-0 text-left">
        <caption className="sr-only">Line items detected on the invoice</caption>
        <thead>
          <tr className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            <th scope="col" className="pb-2 font-medium">Description</th>
            <th scope="col" className="pb-2 text-right font-medium">Qty</th>
            <th scope="col" className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => {
            const flagged = isLowConfidence(item.confidence)
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`cursor-pointer align-top transition-colors duration-150 ease-out ${
                  selectedId === item.id ? 'bg-accent-soft' : 'hover:bg-canvas'
                }`}
              >
                <td className="border-t border-line py-2.5 pr-3 text-[13px] text-ink">
                  {item.description}
                  {flagged && (
                    <span className="mt-1 block">
                      <ConfidenceBadge confidence={item.confidence} />
                    </span>
                  )}
                </td>
                <td className="border-t border-line py-2.5 text-right font-mono text-[13px] tabular-nums text-ink-soft">
                  {item.quantity}
                </td>
                <td className="border-t border-line py-2.5 text-right font-mono text-[13px] tabular-nums text-ink">
                  ${item.amount}
                </td>
              </tr>
            )
          })}
          <tr>
            <td className="border-t border-line-strong py-2.5 text-[13px] font-semibold text-ink" colSpan={2}>
              Line item total
            </td>
            <td className="border-t border-line-strong py-2.5 text-right font-mono text-[13px] font-semibold tabular-nums text-ink">
              ${total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

