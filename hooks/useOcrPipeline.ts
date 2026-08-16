import { useCallback, useRef, useState } from 'react'
import { SAMPLE_SCAN } from '../data/sample'
import type { ScannedDocument, Stage } from '../types/extraction'
import { formatFileSize, processImage, processPdf } from '../utils/pipeline'

export function useOcrPipeline() {
  const [stage, setStage] = useState<Stage>('idle')
  const [document, setDocument] = useState<ScannedDocument | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [status, setStatus] = useState('')
  const [completed, setCompleted] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const runId = useRef(0)
  const lastStatus = useRef('')

  const run = useCallback(
    async (
      name: string,
      size: string,
      task: (
        onProgress: (update: { label: string; value: number; preview?: string }) => void,
      ) => Promise<ScannedDocument>,
    ) => {
      const id = runId.current + 1
      runId.current = id

      setError(null)
      setFileName(name)
      setFileSize(size)
      lastStatus.current = ''
      setStatus('Starting')
      setCompleted([])
      setProgress(0)
      setPreview(null)
      setDocument(null)
      setStage('processing')

      try {
        const result = await task((update) => {
          if (runId.current !== id) return
          const previous = lastStatus.current
          if (previous && previous !== update.label) {
            setCompleted((log) => (log.includes(previous) ? log : [...log, previous]))
          }
          lastStatus.current = update.label
          setStatus(update.label)
          setProgress(Math.min(100, Math.round(update.value)))
          if (update.preview) setPreview(update.preview)
        })

        if (runId.current !== id) return
        setDocument(result)
        setFileSize(result.fileSize)
        setStage('review')
      } catch (cause) {
        if (runId.current !== id) return
        setError(
          cause instanceof Error && cause.message
            ? cause.message
            : 'Something went wrong while reading that PDF.',
        )
        setStage('idle')
      }
    },
    [],
  )

  const scanFile = useCallback(
    (file: File | null) => {
      if (!file) return
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        setError('That file is not a PDF. Upload a PDF to run OCR extraction.')
        return
      }
      if (file.size > 25 * 1024 * 1024) {
        setError('That PDF is larger than 25 MB. Try a smaller file.')
        return
      }
      void run(file.name, formatFileSize(file.size), (onProgress) => processPdf(file, onProgress))
    },
    [run],
  )

  const scanSample = useCallback(() => {
    void run(SAMPLE_SCAN.fileName, 'sample', (onProgress) =>
      processImage(SAMPLE_SCAN.src, SAMPLE_SCAN.fileName, onProgress),
    )
  }, [run])

  const reset = useCallback(() => {
    runId.current += 1
    lastStatus.current = ''
    setStage('idle')
    setDocument(null)
    setProgress(0)
    setCompleted([])
    setStatus('')
    setPreview(null)
    setError(null)
  }, [])

  return {
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
  }
}

