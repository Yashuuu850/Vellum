import React from 'react'
import { motion } from 'framer-motion'
import { DownloadIcon } from 'lucide-react'
import { useExtraction } from '../hooks/useExtraction'
import type { ScannedDocument } from '../types/extraction'
import { formatConfidence } from '../utils/confidence'
import { buildCsv, buildJson, downloadFile } from '../utils/export'
import { FieldsPanel } from './FieldsPanel'
import { PageViewer } from './PageViewer'

interface ReviewStageProps {
  document: ScannedDocument
}

export function ReviewStage({ document }: ReviewStageProps) {
  const {
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
  } = useExtraction(document)

  const baseName = document.fileName.replace(/\.pdf$/i, '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink">{baseName}</h1>
            <span className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              {document.docType}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
            {document.fileSize} · {document.pageCount}{' '}
            {document.pageCount === 1 ? 'page' : 'pages'} · read via {document.readMethod} ·{' '}
            {fields.length} fields · {lineItems.length} line items · avg confidence{' '}
            {formatConfidence(overallConfidence)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`${baseName}.csv`, 'text/csv', buildCsv(fields, lineItems))}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 ease-out hover:border-line-strong hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            CSV
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(
                `${baseName}.json`,
                'application/json',
                buildJson(document.fileName, document.docType, fields, lineItems),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <PageViewer
          pages={document.pages}
          fields={fields}
          lineItems={lineItems}
          verified={verified}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <FieldsPanel
          groups={groups}
          lineItems={lineItems}
          rawText={document.rawText}
          verified={verified}
          needsReview={needsReview}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={updateValue}
          onToggleVerified={toggleVerified}
          onNextFlagged={selectNextFlagged}
        />
      </div>
    </motion.div>
  )
}

