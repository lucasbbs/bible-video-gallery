import { useEffect, useState } from 'react'
import { PaginationWithLinks } from './VideosPagination'
import { useLocation } from 'react-router'
import { getFileNoteDownloadLink, getVimeoVideos } from '@/services/videos'
import { ListItem, ListItemAccordionProvider } from './ListItem'
import { Dialog, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { VideoModal } from './VideoModal'
import { MonitorPlayIcon, NotebookTextIcon, HeadphonesIcon } from 'lucide-react'
import { Sermon, SermonDTO } from '@/dtos/sermon.dto'

type AllVideosProps = {
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

function AllVideos({ loading, setLoading }: AllVideosProps) {
    const [sermons, setSermons] = useState<SermonDTO[]>([])
    const [total, setTotal] = useState(0)

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    useEffect(() => {
        ;(async () => {
            setLoading(true)
            const { data } = await getVimeoVideos(page, pageSize)
            setTotal(data.data.total)
            setSermons(
                data.data.data.map((sermon: Sermon) => SermonDTO.from(sermon))
            )
            setLoading(false)
        })()
    }, [pageSize, page])

    return (
        <div className="grid gap-4 px-8">
            <ListItemAccordionProvider>
                {!loading &&
                    sermons.map((sermon) => (
                        <ListItem
                            key={sermon.uri}
                            itemId={sermon.uri}
                            title={sermon.name}
                            description={sermon.description}
                        >
                            <div className="flex gap-4">
                                {sermon.audioUrl ? (
                                    <Button
                                        className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                        variant={'secondary'}
                                        onClick={() => {
                                            window.open(
                                                sermon.audioUrl,
                                                '_blank'
                                            )
                                        }}
                                        size={'icon'}
                                    >
                                        <HeadphonesIcon />
                                    </Button>
                                ) : null}
                                {sermon.sermonPdfUrl ? (
                                    <Button
                                        className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                        variant={'secondary'}
                                        onClick={async () => {
                                            const { data } =
                                                await getFileNoteDownloadLink(
                                                    sermon.sermonPdfUrl || ''
                                                )
                                            window.open(data.url, '_blank')
                                        }}
                                        size={'icon'}
                                    >
                                        <NotebookTextIcon />
                                    </Button>
                                ) : null}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                            variant={'secondary'}
                                            size={'icon'}
                                        >
                                            <MonitorPlayIcon />
                                        </Button>
                                    </DialogTrigger>
                                    <VideoModal
                                        id={sermon.uri?.replace('/videos/', '')}
                                    />
                                </Dialog>
                            </div>
                        </ListItem>
                    ))}
            </ListItemAccordionProvider>
            <div className="mt-12">
                <PaginationWithLinks
                    page={page}
                    pageSize={pageSize}
                    totalCount={total}
                    pageSizeSelectOptions={{
                        pageSizeOptions: [5, 10, 15, 20, 25]
                    }}
                />
            </div>
        </div>
    )
}

export default AllVideos
