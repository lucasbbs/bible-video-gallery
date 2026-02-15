import { Headphones, MonitorPlay, NotebookText } from 'lucide-react'
import { useScriptureSearch } from '@/components/lib-ui/ScriptureSearchContext'
import {
    ListItem,
    ListItemAccordionProvider,
} from '../../components/lib-ui/ListItem'
import { getFileNoteDownloadLink } from '../../services/videos'
import { Dialog, DialogTrigger } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { VideoModal } from '../../components/lib-ui/VideoModal'
import { PaginationWithLinks } from './VideosPagination'

function SearchByScripture() {
    const { sermons, selectedBook, selectedChapter, showOther, total, page, pageSize } =
        useScriptureSearch()

    return (
        <div>
            <div className="relative !py-6 h-2/4">
                <div className="grid gap-4">
                    <ListItemAccordionProvider>
                    {sermons
                        .filter(
                            (video) =>{
                                if (showOther) return true
                                if (selectedBook === '') return true
                                if (selectedChapter === 0) return true
                                return video.chapter === selectedChapter
                        })
                        .map((sermon) => (
                            <ListItem
                                key={`${sermon._id}`}
                                itemId={`${sermon._id}`}
                                title={sermon.name}
                                createdTime={new Intl.DateTimeFormat('en-CA', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }).format(new Date(sermon.createdAt))}
                                description={sermon.description}
                                passage={sermon.description}
                            >
                                <div className="flex gap-4">
                                    {sermon.audioUrl ? (
                                        <Button
                                            className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                            variant={'secondary'}
                                            onClick={() => {
                                                window.open(sermon.audioUrl)
                                            }}
                                            size={'icon'}
                                        >
                                            <Headphones />
                                        </Button>
                                    ) : null}
                                    {sermon.sermonPdfUrl ? (
                                        <Button
                                            className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                            onClick={async () => {
                                                const { data } =
                                                    await getFileNoteDownloadLink(
                                                        sermon.sermonPdfUrl ||
                                                            ''
                                                    )
                                                window.open(data.url)
                                            }}
                                            variant={'secondary'}
                                            size={'icon'}
                                        >
                                            <NotebookText />
                                        </Button>
                                    ) : null}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                                    variant={'secondary'}
                                                    size={'icon'}
                                                >
                                                    <MonitorPlay />
                                                </Button>
                                            </DialogTrigger>
                                            <VideoModal id={sermon.uri} />
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
            </div>
        </div>
    )
}

export default SearchByScripture
