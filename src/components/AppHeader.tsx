import React from 'react';

// Provide minimal JSX typings when project-wide React types are missing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react/jsx-runtime';
import { ScanTextIcon } from 'lucide-react';
import type { Stage } from '../types/extraction';

interface AppHeaderProps {
  stage: Stage;
  fileName: string;
  onReset: () => void;
}

export function AppHeader({ stage, fileName, onReset }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-surface">
          <ScanTextIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">OCR READER OCR</span>
        <span className="ml-1 hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint sm:inline">
          ocr-vision-2
        </span>
      </div>

      {stage !== 'idle' &&
      <div className="flex items-center gap-4">
          <span className="hidden max-w-[280px] truncate font-mono text-xs text-ink-soft md:inline">
            {fileName}
          </span>
          <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 ease-out hover:border-line-strong hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          
            New scan
          </button>
        </div>
      }
    </header>);

}