import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircleIcon, FileTextIcon, UploadCloudIcon } from 'lucide-react';

interface UploadStageProps {
  error: string | null;
  onFile: (file: File | null) => void;
}

const EXTRACTS = [
'Invoice number, dates and terms',
'Vendor and bill-to parties',
'Line items with quantity and amount',
'Subtotal, tax and total due'];


export function UploadStage({ error, onFile }: UploadStageProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12">
      
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <div>
          <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[34px]">
            Turn a scanned PDF into structured, checkable data.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Upload an invoice, receipt or form. OCR reads the page, detects the fields, and hands
            you an editable record with a confidence score behind every value.
          </p>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              onFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={`mt-8 rounded-xl border-2 border-dashed bg-surface p-10 text-center transition-colors duration-150 ease-out ${
            dragging ? 'border-accent bg-accent-soft' : 'border-line-strong'}`
            }>
            
            <UploadCloudIcon
              className={`mx-auto h-8 w-8 ${dragging ? 'text-accent' : 'text-ink-faint'}`}
              aria-hidden="true" />
            
            <p className="mt-4 text-[15px] font-medium text-ink">
              Drop a PDF here, or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-accent underline underline-offset-4 transition-colors duration-150 ease-out hover:text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                
                browse your files
              </button>
            </p>
            <p className="mt-1.5 font-mono text-xs text-ink-faint">PDF · up to 20 MB · 25 pages</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
            
          </div>

          {error &&
          <p
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-md bg-flag-soft px-3 py-2 text-[13px] text-flag">
            
              <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          }

          <button
            type="button"
            onClick={() => onFile(null)}
            className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft transition-colors duration-150 ease-out hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            
            <FileTextIcon className="h-4 w-4" aria-hidden="true" />
            No file handy? Scan a sample invoice
          </button>
        </div>

        <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="text-[13px] font-semibold text-ink">What gets extracted</h2>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-ink-soft">
            {EXTRACTS.map((item) =>
            <li key={item} className="flex gap-2.5">
                <span
                aria-hidden="true"
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              
                {item}
              </li>
            )}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            Anything the model reads below 85% confidence is flagged for your review before export.
          </p>
        </aside>
      </div>
    </motion.div>);

}