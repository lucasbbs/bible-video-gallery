import { Headphones, MonitorPlay, NotebookText, FileText } from 'lucide-react'
import { useScriptureSearch } from '@/components/lib-ui/ScriptureSearchContext'
import {
    ListItem,
    ListItemAccordionProvider,
} from '../../components/lib-ui/ListItem'
import { Dialog, DialogTrigger } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { VideoModal } from '../../components/lib-ui/VideoModal'
import { PaginationWithLinks } from './VideosPagination'
import { MediaModal } from './MediaModal'
import { PdfModal } from './PdfModal'

function SearchByScripture() {
    const {
        sermons,
        selectedBook,
        selectedChapter,
        showOther,
        total,
        page,
        pageSize,
        selectedTag,
        handleTagChange
    } = useScriptureSearch()

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
                                    bibleVerse={sermon.book !== 'others' ? `${sermon.book} ${sermon.chapter}:${sermon.verses}` : undefined }
                                    description={sermon.description}
                                    type={sermon.type}
                                    tags={selectedTag ? [] : sermon.tags}
                                    onTagClick={handleTagChange}
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {sermon.type ==='sermons' ? <Dialog>
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
                                        </Dialog> : null }
                                        {sermon.audioUrl ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                className="h-12 rounded-full px-4"
                                                variant="secondary">
                                                <Headphones className="size-5" />
                                                <span>Audio</span>
                                            </Button>
                                            </DialogTrigger>
                                            <MediaModal url={sermon.audioUrl} />
                                            </Dialog>
                                        ) : null}
                                        {sermon.sermonPdfUrl ? (
                                            <Dialog modal={false}>
                                                <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                className="h-12 rounded-full px-4"
                                                variant="secondary"
                                            >
                                                <NotebookText className="size-5" />
                                                <span>Notes</span>
                                            </Button>
                                            </DialogTrigger>
                                            <PdfModal url={sermon.sermonPdfUrl} />
                                            </Dialog>
                                        ) : null}
                                        {sermon.sermonBulletinUrl ? (
                                            <Dialog modal={false}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        className="h-12 rounded-full px-4"
                                                        variant="secondary"
                                                    >
                                                        <FileText className="size-5" />
                                                        <span>Bulletin</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <PdfModal url={sermon.sermonBulletinUrl} />
                                            </Dialog>
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
