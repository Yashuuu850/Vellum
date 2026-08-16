import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import type { BoundingBox, ExtractedField, LineItem } from '../types/extraction';
import { isLowConfidence } from '../utils/confidence';

interface Region {
  id: string;
  label: string;
  box: BoundingBox;
  confidence: number;
}

interface PageViewerProps {
  pageImage: string;
  pageCount: number;
  fields: ExtractedField[];
  lineItems: LineItem[];
  verified: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ZOOM_LEVELS = [1, 1.35, 1.75];

export function PageViewer({
  pageImage,
  pageCount,
  fields,
  lineItems,
  verified,
  selectedId,
  onSelect
}: PageViewerProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [showBoxes, setShowBoxes] = useState(true);

  const regions: Region[] = [
  ...fields.map((field) => ({
    id: field.id,
    label: field.label,
    box: field.box,
    confidence: field.confidence
  })),
  ...lineItems.map((item) => ({
    id: item.id,
    label: item.description,
    box: item.box,
    confidence: item.confidence
  }))];


  return (
    <section
      aria-label="Scanned page"
      className="flex min-h-0 flex-1 flex-col border-line bg-stage max-lg:h-[55vh] max-lg:border-b lg:border-r">
      
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <span className="font-mono text-xs text-white/55">
          Page 1 of {pageCount} · {regions.length} regions detected
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowBoxes((value) => !value)}
            aria-pressed={showBoxes}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60">
            
            {showBoxes ?
            <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

            <EyeOffIcon className="h-3.5 w-3.5" aria-hidden="true" />
            }
            overlay
          </button>
          <button
            type="button"
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60">
            
            <ZoomOutIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-10 text-center font-mono text-[11px] tabular-nums text-white/55">
            {Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomIndex((index) => Math.min(ZOOM_LEVELS.length - 1, index + 1))}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
            className="rounded-md p-1.5 text-white/70 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60">
            
            <ZoomInIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div
          className="relative mx-auto shadow-2xl"
          style={{ width: `${Math.min(100, 100 * ZOOM_LEVELS[zoomIndex])}%`, maxWidth: `${640 * ZOOM_LEVELS[zoomIndex]}px` }}>
          
          <img
            src={pageImage}
            alt="Scanned invoice page rendered from the uploaded PDF"
            className="block w-full select-none"
            draggable={false} />
          
          {showBoxes &&
          regions.map((region) => {
            const selected = region.id === selectedId;
            const flagged = isLowConfidence(region.confidence) && !verified.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelect(region.id)}
                aria-label={`${region.label} on page`}
                className={`absolute rounded-[3px] border transition-colors duration-150 ease-out focus:outline-none ${
                selected ?
                'border-accent bg-accent/25 ring-2 ring-accent/60' :
                flagged ?
                'border-flag bg-flag/15 hover:bg-flag/25' :
                'border-accent/45 bg-accent/5 hover:bg-accent/15'}`
                }
                style={{
                  left: `${region.box.x}%`,
                  top: `${region.box.y}%`,
                  width: `${region.box.w}%`,
                  height: `${region.box.h}%`
                }} />);


          })}
        </div>
      </div>
    </section>);

}