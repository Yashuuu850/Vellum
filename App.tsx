import React from 'react'
import { AppHeader } from './components/AppHeader'
import { ProcessingStage } from './components/ProcessingStage'
import { ReviewStage } from './components/ReviewStage'
import { UploadStage } from './components/UploadStage'
import { useOcrPipeline } from './hooks/useOcrPipeline'

export function App() {
  const {
    stage,
    document,
    fileName,
    fileSize,
    status,
    completed,
    progress,
    preview,
    error,
    scanFile,
    scanSample,
    reset,
  } = useOcrPipeline()

  return (
    <div className="flex h-full min-h-screen w-full flex-col bg-canvas font-sans text-ink">
      <AppHeader stage={stage} fileName={fileName} onReset={reset} />
      <main className="flex min-h-0 flex-1 flex-col">
        {stage === 'idle' && (
          <UploadStage error={error} onFile={scanFile} onSample={scanSample} />
        )}
        {stage === 'processing' && (
          <ProcessingStage
            fileName={fileName}
            fileSize={fileSize}
            status={status}
            completed={completed}
            progress={progress}
            preview={preview}
          />
        )}
        {stage === 'review' && document && (
          <ReviewStage key={document.fileName + document.pageCount} document={document} />
        )}
      </main>
    </div>
  )
}

