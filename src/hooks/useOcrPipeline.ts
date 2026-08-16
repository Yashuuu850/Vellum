import { useCallback, useEffect, useRef, useState } from 'react';
import { pipelineSteps, sampleDocument } from '../data/sampleDocument';
import type { Stage } from '../types/extraction';

const STEP_DURATION = 750;

interface PipelineState {
  stage: Stage;
  fileName: string;
  fileSize: string;
  stepIndex: number;
  progress: number;
  error: string | null;
  start: (file: File | null) => void;
  reset: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useOcrPipeline(): PipelineState {
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState(sampleDocument.fileName);
  const [fileSize, setFileSize] = useState(sampleDocument.fileSize);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const start = useCallback(
    (file: File | null) => {
      if (file) {
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
          setError('That file is not a PDF. Upload a PDF to run OCR extraction.');
          return;
        }
        setFileName(file.name);
        setFileSize(formatSize(file.size));
      } else {
        setFileName(sampleDocument.fileName);
        setFileSize(sampleDocument.fileSize);
      }

      clearTimers();
      setError(null);
      setStepIndex(0);
      setProgress(0);
      setStage('processing');

      pipelineSteps.forEach((_, index) => {
        const id = window.setTimeout(() => {
          setStepIndex(index);
          setProgress(Math.round((index + 1) / pipelineSteps.length * 100));
        }, index * STEP_DURATION);
        timers.current.push(id);
      });

      const done = window.setTimeout(() => {
        setStage('review');
      }, pipelineSteps.length * STEP_DURATION + 350);
      timers.current.push(done);
    },
    [clearTimers]
  );

  const reset = useCallback(() => {
    clearTimers();
    setStage('idle');
    setStepIndex(0);
    setProgress(0);
    setError(null);
  }, [clearTimers]);

  return { stage, fileName, fileSize, stepIndex, progress, error, start, reset };
}