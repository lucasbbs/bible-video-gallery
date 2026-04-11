import { getFileNoteDownloadLink, getFileNoteViewLink } from '@/services/videos'
import { isAxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import Spinner from './Spinner'
import { Button } from '../ui/button'
import { PDFViewer, ZoomMode } from '@embedpdf/react-pdf-viewer';

const MAX_PDF_LINK_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 500
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

const wait = (delayMs: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
            reject(new DOMException('Request aborted', 'AbortError'))
            return
        }

        const timeoutId = setTimeout(() => {
            signal.removeEventListener('abort', onAbort)
            resolve()
        }, delayMs)

        const onAbort = () => {
            clearTimeout(timeoutId)
            signal.removeEventListener('abort', onAbort)
            reject(new DOMException('Request aborted', 'AbortError'))
        }

        signal.addEventListener('abort', onAbort, { once: true })
    })

const isAbortError = (error: unknown) =>
    (error instanceof DOMException && error.name === 'AbortError') ||
    (isAxiosError(error) && error.code === 'ERR_CANCELED')

const shouldRetryPdfLinkRequest = (error: unknown) => {
    if (!isAxiosError(error) || error.code === 'ERR_CANCELED') {
        return false
    }

    const status = error.response?.status
    return status == null || RETRYABLE_STATUS_CODES.has(status)
}

const fetchPdfViewUrlWithRetry = async (
    fileUrl: string,
    signal: AbortSignal
) => {
    for (let attempt = 0; attempt <= MAX_PDF_LINK_RETRIES; attempt += 1) {
        try {
            const { data } = await getFileNoteViewLink(fileUrl, signal)
            return data.url || ''
        } catch (error) {
            const isLastAttempt = attempt === MAX_PDF_LINK_RETRIES

            if (isAbortError(error) || isLastAttempt || !shouldRetryPdfLinkRequest(error)) {
                throw error
            }

            const delayMs = INITIAL_RETRY_DELAY_MS * 2 ** attempt
            await wait(delayMs, signal)
        }
    }

    return ''
}

type PdfPlayerProps = {
    url: string
}

function PdfReader({ url: fileUrl }: PdfPlayerProps) {
    const [url, setUrl] = useState('')
    const [error, setError] = useState('')
    const [downloadError, setDownloadError] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [isViewerContainerReady, setIsViewerContainerReady] = useState(false)
    const viewerContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const abortController = new AbortController()

        const loadPdf = async () => {
            if (!fileUrl) {
                setUrl('')
                setError('')
                setDownloadError('')
                return
            }

            try {
                setError('')
                setDownloadError('')
                setUrl('')
                const nextUrl = await fetchPdfViewUrlWithRetry(
                    fileUrl,
                    abortController.signal
                )
                setUrl(nextUrl)
            } catch (error) {
                if (isAbortError(error)) {
                    return
                }

                setUrl('')
                setError('Unable to load this PDF in the embedded viewer.')
            }
        }

        void loadPdf()

        return () => {
            abortController.abort()
        }
    }, [fileUrl])

    useEffect(() => {
        if (!url) {
            setIsViewerContainerReady(false)
            return
        }

        const container = viewerContainerRef.current

        if (!container) {
            return
        }

        const syncViewerContainerReadyState = () => {
            setIsViewerContainerReady(
                container.clientWidth > 0 && container.clientHeight > 0
            )
        }

        const animationFrameId = window.requestAnimationFrame(
            syncViewerContainerReadyState
        )

        if (typeof ResizeObserver === 'undefined') {
            return () => {
                window.cancelAnimationFrame(animationFrameId)
            }
        }

        const resizeObserver = new ResizeObserver(
            syncViewerContainerReadyState
        )

        resizeObserver.observe(container)

        return () => {
            window.cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
        }
    }, [url])

    const handleDownload = async () => {
        if (!fileUrl || isDownloading) {
            return
        }

        try {
            setIsDownloading(true)
            setDownloadError('')

            const { data } = await getFileNoteDownloadLink(fileUrl)
            const downloadUrl = data?.url

            if (!downloadUrl) {
                throw new Error('Missing download URL')
            }

            window.open(downloadUrl, '_blank', 'noopener,noreferrer')
        } catch {
            setDownloadError('Unable to prepare the download link.')
        } finally {
            setIsDownloading(false)
        }
    }

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>
    }

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-md border">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                <div className="min-w-0">
                    {downloadError ? (
                        <p className="text-xs text-red-600">{downloadError}</p>
                    ) : null}
                </div>
                <Button
                    type="button"
                    onClick={handleDownload}
                    disabled={!fileUrl || isDownloading}
                    className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                >
                    {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                    {isDownloading ? 'Preparing...' : 'Download PDF'}
                </Button>
            </div>
            <div
                ref={viewerContainerRef}
                className="h-full w-full min-h-0 min-w-0 flex-1 overflow-hidden"
            >
                {url && isViewerContainerReady ? (
                    <PDFViewer
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                        config={{
                            src: url,
                            theme: { preference: 'system' },
                            disabledCategories: ['annotation', 'annotation-stamp', 'redaction', 'panel', 'document', 'form', 'insert', 'page'],
                            zoom: { defaultZoomLevel: ZoomMode.FitWidth },
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <p className="text-lg font-bold">Loading PDF...</p>
                            <Spinner />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PdfReader
