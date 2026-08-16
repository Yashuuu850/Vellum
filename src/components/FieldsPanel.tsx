import React, { useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import type { ExtractedField, FieldGroup, LineItem } from '../types/extraction';
import { FieldRow } from './FieldRow';
import { LineItemsTable } from './LineItemsTable';

type Tab = 'fields' | 'items' | 'raw';

interface FieldsPanelProps {
  groups: {group: FieldGroup;fields: ExtractedField[];}[];
  lineItems: LineItem[];
  rawText: string;
  verified: string[];
  needsReview: ExtractedField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onToggleVerified: (id: string) => void;
  onNextFlagged: () => void;
}

const TABS: {id: Tab;label: string;}[] = [
{ id: 'fields', label: 'Fields' },
{ id: 'items', label: 'Line items' },
{ id: 'raw', label: 'Raw text' }];


export function FieldsPanel({
  groups,
  lineItems,
  rawText,
  verified,
  needsReview,
  selectedId,
  onSelect,
  onChange,
  onToggleVerified,
  onNextFlagged
}: FieldsPanelProps) {
  const [tab, setTab] = useState<Tab>('fields');

  return (
    <section
      aria-label="Extracted data"
      className="flex w-full min-h-0 shrink-0 flex-col bg-surface max-lg:h-[65vh] lg:w-[440px]">
      
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-line px-3" role="tablist">
        {TABS.map((item) =>
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          onClick={() => setTab(item.id)}
          className={`rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          tab === item.id ? 'bg-canvas text-ink' : 'text-ink-soft hover:text-ink'}`
          }>
          
            {item.label}
            {item.id === 'items' &&
          <span className="ml-1.5 font-mono text-[11px] text-ink-faint">{lineItems.length}</span>
          }
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'fields' &&
        <div>
            {groups.map((entry) =>
          <div key={entry.group}>
                <h3 className="sticky top-0 z-10 border-b border-line bg-canvas px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                  {entry.group}
                </h3>
                <div className="divide-y divide-line">
                  {entry.fields.map((field) =>
              <FieldRow
                key={field.id}
                field={field}
                verified={verified.includes(field.id)}
                selected={selectedId === field.id}
                onSelect={onSelect}
                onChange={onChange}
                onToggleVerified={onToggleVerified} />

              )}
                </div>
              </div>
          )}
          </div>
        }

        {tab === 'items' &&
        <LineItemsTable lineItems={lineItems} selectedId={selectedId} onSelect={onSelect} />
        }

        {tab === 'raw' &&
        <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-relaxed text-ink-soft">
            {rawText}
          </pre>
        }
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3">
        {needsReview.length > 0 ?
        <>
            <p className="text-[13px] text-ink">
              <span className="font-semibold">{needsReview.length}</span>{' '}
              {needsReview.length === 1 ? 'field needs' : 'fields need'} review
            </p>
            <button
            type="button"
            onClick={onNextFlagged}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[13px] font-medium text-surface transition-colors duration-150 ease-out hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            
              Go to next
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </> :

        <p className="text-[13px] font-medium text-good">
            All flagged fields reviewed — ready to export.
          </p>
        }
      </div>
    </section>);

}