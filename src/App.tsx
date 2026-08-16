import React from 'react';
import { AppHeader } from './components/AppHeader';
import { ProcessingStage } from './components/ProcessingStage';
import { ReviewStage } from './components/ReviewStage';
import { UploadStage } from './components/UploadStage';
import { useOcrPipeline } from './hooks/useOcrPipeline';

export function App() {
  const { stage, fileName, fileSize, stepIndex, progress, error, start, reset } = useOcrPipeline();

  return (
    <div className="flex h-full min-h-screen w-full flex-col bg-canvas font-sans text-ink">
      <AppHeader stage={stage} fileName={fileName} onReset={reset} />
      <main className="flex min-h-0 flex-1 flex-col">
        {stage === 'idle' && <UploadStage error={error} onFile={start} />}
        {stage === 'processing' &&
        <ProcessingStage
          fileName={fileName}
          fileSize={fileSize}
          stepIndex={stepIndex}
          progress={progress} />

        }
        {stage === 'review' && <ReviewStage fileName={fileName} fileSize={fileSize} />}
      </main>
    </div>);

}