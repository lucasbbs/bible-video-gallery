import { getFileNoteDownloadLink, getFileNoteViewLink } from '@/services/videos'
import { isAxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Download, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import Spinner from './Spinner'
import { Button } from '../ui/button'
import {
    PDFViewer,
    ZoomMode,
    type EmbedPdfContainer,
} from '@embedpdf/react-pdf-viewer'
import pdfReaderStyles from './pdf-reader.css?inline'
import { useUiSettings } from './UiSettingsContext'

const MAX_PDF_LINK_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 500
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const PDF_READER_SHADOW_STYLE_SELECTOR = 'style[data-pdf-reader-shadow-style]'

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

const injectPdfReaderStyles = (container: EmbedPdfContainer) => {
    const shadowRoot = container.shadowRoot

    if (!shadowRoot) {
        return
    }

    let styleElement = shadowRoot.querySelector<HTMLStyleElement>(
        PDF_READER_SHADOW_STYLE_SELECTOR
    )

    if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.setAttribute('data-pdf-reader-shadow-style', 'true')
        shadowRoot.appendChild(styleElement)
    }

    styleElement.textContent = pdfReaderStyles
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
    const { textSize } = useUiSettings()
    const [url, setUrl] = useState('')
    const [error, setError] = useState('')
    const [downloadError, setDownloadError] = useState('')
    const [fullscreenError, setFullscreenError] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isViewerContainerReady, setIsViewerContainerReady] = useState(false)
    const readerContainerRef = useRef<HTMLDivElement>(null)
    const viewerContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const abortController = new AbortController()

        const loadPdf = async () => {
            if (!fileUrl) {
                setUrl('')
                setError('')
                setDownloadError('')
                setFullscreenError('')
                return
            }

            try {
                setError('')
                setDownloadError('')
                setFullscreenError('')
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

    useEffect(() => {
        const syncFullscreenState = () => {
            setIsFullscreen(document.fullscreenElement === readerContainerRef.current)
        }

        syncFullscreenState()
        document.addEventListener('fullscreenchange', syncFullscreenState)

        return () => {
            document.removeEventListener('fullscreenchange', syncFullscreenState)
        }
    }, [])

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

    const handleToggleFullscreen = async () => {
        const container = readerContainerRef.current

        if (!container) {
            return
        }

        try {
            setFullscreenError('')

            if (document.fullscreenElement === container) {
                await document.exitFullscreen()
                return
            }

            if (!document.fullscreenEnabled) {
                throw new Error('Fullscreen is unavailable')
            }

            await container.requestFullscreen()
        } catch {
            setFullscreenError('Unable to switch the PDF viewer to fullscreen.')
        }
    }

    const controlLabelFontSize = `${Number((textSize * 0.7).toFixed(2))}px`

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>
    }

    return (
        <div
            ref={readerContainerRef}
            className={`flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-background ${
                isFullscreen ? 'border-0 rounded-none' : 'rounded-md border'
            }`}
        >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                <div className="min-w-0">
                    {downloadError ? (
                        <p className="text-xs text-red-600">{downloadError}</p>
                    ) : null}
                    {fullscreenError ? (
                        <p className="text-xs text-red-600">{fullscreenError}</p>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleToggleFullscreen}
                        disabled={!fileUrl}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                        <span style={{ fontSize: controlLabelFontSize }}>
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </span>
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDownload}
                        disabled={!fileUrl || isDownloading}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        aria-label={isDownloading ? 'Preparing PDF download' : 'Download PDF'}
                    >
                        {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                        <span style={{ fontSize: controlLabelFontSize }}>
                            {isDownloading ? 'Preparing...' : 'Download PDF'}
                        </span>
                    </Button>
                </div>
            </div>
            <div
                ref={viewerContainerRef}
                className="h-full w-full min-h-0 min-w-0 flex-1 overflow-hidden"
            >
                {url && isViewerContainerReady ? (
                    <PDFViewer
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                        onInit={injectPdfReaderStyles}
                        config={{
                            src: url,
                            theme: { preference: 'system' },
                            disabledCategories: ['annotation', 'annotation-stamp', 'redaction', 'panel', 'document', 'form', 'insert', 'spread', 'rotate', 'scroll', 'page-settings'],
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
