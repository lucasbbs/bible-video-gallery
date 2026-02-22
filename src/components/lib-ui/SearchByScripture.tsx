import { Headphones, MonitorPlay, NotebookText, FileText } from 'lucide-react'
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
    const {
        sermons,
        selectedBook,
        selectedChapter,
        showOther,
        total,
        page,
        pageSize
    } = useScriptureSearch()

    const openPdfFile = async (fileUrl?: string) => {
        if (!fileUrl) return
        const { data } = await getFileNoteDownloadLink(fileUrl)
        window.open(data.url)
    }

    return (
        <div>
            <div className="relative !py-6 h-2/4">
                <div className="grid gap-4">
                    <ListItemAccordionProvider>
                        {sermons
                            .filter((sermon) => {
                                if (showOther) return true
                                if (selectedBook === '') return true
                                if (selectedChapter === 0) return true
                                return sermon.chapter === selectedChapter
                            })
                            .map((sermon) => (
                                <ListItem
                                    key={`${sermon._id}`}
                                    itemId={`${sermon._id}`}
                                    title={sermon.name}
                                    createdTime={new Intl.DateTimeFormat(
                                        'en-CA',
                                        {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }
                                    ).format(new Date(sermon.createdAt))}
                                    description={sermon.description}
                                    passage={sermon.description}
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-12 rounded-full bg-red-400 px-4 hover:bg-red-400/90" 
                                                >
                                                    <MonitorPlay className="size-5" />
                                                    <span>Video</span>
                                                </Button>
                                            </DialogTrigger>
                                            <VideoModal id={sermon.uri} />
                                        </Dialog>
                                        {sermon.sermonPdfUrl ? (
                                            <Button
                                                type="button"
                                                className="h-12 rounded-full px-4"
                                                onClick={async () => {
                                                    await openPdfFile(
                                                        sermon.sermonPdfUrl
                                                    )
                                                }}
                                                variant="secondary"
                                            >
                                                <NotebookText className="size-5" />
                                                <span>Notes</span>
                                            </Button>
                                        ) : null}
                                        {sermon.audioUrl ? (
                                            <Button
                                                type="button"
                                                className="h-12 rounded-full px-4"
                                                variant="secondary"
                                                onClick={() => {
                                                    window.open(
                                                        sermon.audioUrl
                                                    )
                                                }}
                                            >
                                                <Headphones className="size-5" />
                                                <span>Audio</span>
                                            </Button>
                                        ) : null}
                                        {sermon.sermonBulletinUrl ? (
                                            <Button
                                                type="button"
                                                className="h-12 rounded-full px-4"
                                                onClick={async () => {
                                                    await openPdfFile(
                                                        sermon.sermonBulletinUrl
                                                    )
                                                }}
                                                variant="secondary"
                                            >
                                                <FileText className="size-5" />
                                                <span>Bulletin</span>
                                            </Button>
                                        ) : null}
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
