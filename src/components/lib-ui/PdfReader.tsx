import { getFileNoteViewLink } from '@/services/videos'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Spinner from './Spinner'

type PdfPlayerProps = {
    url: string
}

function PdfReader({ url: fileUrl }: PdfPlayerProps) {
    const isMobile = useMediaQuery({ query: '(max-width: 640px)' })
    const [url, setUrl] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        ;(async () => {
            if (!fileUrl) return

            try {
                setError('')
                const { data } = await getFileNoteViewLink(fileUrl)
                setUrl(data.url || '')
            } catch {
                setUrl('')
                setError('Unable to load this PDF in the embedded viewer.')
            }
        })()
    }, [fileUrl])

    if (error) {
        return <div className="text-sm text-red-600">{error}</div>
    }

    return (
        <div className={`${isMobile && 'relative pt-[56.25%]'}`}>
            {url ? (
                <embed
                    src={`${url}`}
                    style={{ width: '100%', minHeight: 800, minWidth: 1000 }}
                    type="application/pdf"
                />
            ) : (
                <div className="text-sm text-muted-foreground min-h-[800px] min-w-[1000px] flex items-center justify-center">
                    <div className=' flex flex-col items-center justify-center gap-4'>
                    <p className='text-lg font-bold'>Loading PDF...</p>
                    <Spinner />
                    </div>
                </div>
            )}
        </div>
    )
}

export default PdfReader
