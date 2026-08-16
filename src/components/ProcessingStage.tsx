import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import { pipelineSteps } from '../data/sampleDocument';

interface ProcessingStageProps {
  fileName: string;
  fileSize: string;
  stepIndex: number;
  progress: number;
}

export function ProcessingStage({
  fileName,
  fileSize,
  stepIndex,
  progress
}: ProcessingStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-1 items-center justify-center px-6 py-12"
      aria-live="polite">
      
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-7 shadow-panel">
        <p className="truncate font-mono text-[13px] text-ink">{fileName}</p>
        <p className="mt-1 font-mono text-xs text-ink-faint">
          {fileSize} · extracting fields
        </p>

        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }} />
          
        </div>

        <ol className="mt-6 space-y-3">
          {pipelineSteps.map((step, index) => {
            const done = index < stepIndex;
            const active = index === stepIndex;
            return (
              <li key={step.id} className="flex items-center gap-3 text-[13px]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {done ?
                  <CheckIcon className="h-3.5 w-3.5 text-good" aria-hidden="true" /> :
                  active ?
                  <Loader2Icon className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden="true" /> :

                  <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
                  }
                </span>
                <span className={done || active ? 'text-ink' : 'text-ink-faint'}>{step.label}</span>
              </li>);

          })}
        </ol>
      </div>
    </motion.div>);

}