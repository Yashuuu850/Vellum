import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, Loader2Icon } from 'lucide-react'

interface ProcessingStageProps {
  fileName: string
  fileSize: string
  status: string
  completed: string[]
  progress: number
  preview: string | null
}

export function ProcessingStage({
  fileName,
  fileSize,
  status,
  completed,
  progress,
  preview,
}: ProcessingStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-1 items-center justify-center px-6 py-10"
      aria-live="polite"
    >
      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <div className="hidden aspect-[3/4] overflow-hidden rounded-lg border border-line bg-surface md:block">
          {preview ? (
            <img src={preview} alt="First page of the uploaded PDF" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full animate-pulse bg-canvas" />
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-panel">
          <p className="truncate font-mono text-[13px] text-ink">{fileName}</p>
          <p className="mt-1 font-mono text-xs text-ink-faint">{fileSize} · extracting data</p>

          <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="mt-5 space-y-2.5">
            {completed.map((step) => (
              <li key={step} className="flex items-center gap-3 text-[13px] text-ink-soft">
                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-good" aria-hidden="true" />
                {step}
              </li>
            ))}
            <li className="flex items-center gap-3 text-[13px] font-medium text-ink">
              <Loader2Icon className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" aria-hidden="true" />
              {status}
            </li>
          </ol>

          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            Everything runs in your browser — the file is never uploaded to a server. Scanned pages
            take longer than digital ones because each page has to be recognized character by
            character.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

