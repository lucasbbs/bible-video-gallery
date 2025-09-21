import { useForm } from 'react-hook-form'
import { Headphones, MonitorPlay, NotebookText } from 'lucide-react'
import { oldTestament, newTestament, allBooks } from '../../shared/books'
import { Form } from '@/components/ui/form'
import Selector from '../../components/lib-ui/Selector'
import {
    ListItem,
    ListItemAccordionProvider
} from '../../components/lib-ui/ListItem'
import { getFileNoteDownloadLink, getVideos } from '../../services/videos'
import { Dialog, DialogTrigger } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { VideoModal } from '../../components/lib-ui/VideoModal'
import { useEffect, useState } from 'react'
import { Sermon, SermonDTO } from '@/dtos/sermon.dto'

type SearchByScriptureProps = {
    setLoading: (loading: boolean) => void
}

function SearchByScripture({ setLoading }: SearchByScriptureProps) {
    const form = useForm()
    const [chapters, setChapters] = useState<number[]>([])
    const [selectedChapter, setSelectedChapter] = useState<number>(0)
    const [selectedBook, setSelectedBook] = useState('')
    const [books, setBooks] = useState<string[]>([])
    const [sermons, setSermons] = useState<SermonDTO[]>([])
    const [showOther, setShowOther] = useState(false)

    console.log({ sermons })

    const resetForm = (optionSelected: string[]) => {
        form.reset()
        setBooks(optionSelected)
        setChapters([])
        setSelectedBook('')
        setSelectedChapter(0)
        setSermons([])
    }

    const handleTestamentChange = async (value: string) => {
        if (value === 'old') {
            setShowOther(false)
            resetForm(oldTestament)
        } else if (value === 'new') {
            setShowOther(false)
            resetForm(newTestament)
        } else if (value === 'all') {
            setShowOther(false)
            resetForm(allBooks)
        } else {
            setShowOther(true)
            resetForm([])
            setLoading(true)
            const {
                data: { videos }
            } = await getVideos('others')
            setSermons(videos.map((sermon: Sermon) => SermonDTO.from(sermon)))
            setLoading(false)
        }
    }

    const handleBookChange = async (value: string) => {
        setSelectedBook(value)
        const {
            data: { videos }
        } = await getVideos(value)
        setSermons(videos.map((sermon: Sermon) => SermonDTO.from(sermon)))
    }

    const handleChapterChange = (value: number) => {
        setSelectedChapter(value)
    }

    useEffect(() => {
        if (showOther) {
            return
        }
        const chapters = sermons.map((video: SermonDTO) => video.chapter)
        setChapters([...new Set(chapters)].sort((a, b) => a - b))
    }, [sermons])

    return (
        <div>
            <div>
                <Form {...form}>
                    <form className="w-auto space-y-6">
                        <div className="flex gap-20 xs-gap-4 flex-wrap justify-center">
                            <Selector
                                form={form}
                                onChange={handleTestamentChange}
                                options={[
                                    { value: 'all', label: 'All' },
                                    { value: 'old', label: 'Old Testament' },
                                    { value: 'new', label: 'New Testament' },
                                    { value: 'others', label: 'Others' }
                                ]}
                                formLabel="By Testament*"
                                placeholder="Select Testament"
                            />
                            <Selector
                                form={form}
                                value={selectedBook}
                                onChange={handleBookChange}
                                options={books.map((book) => ({
                                    value: book,
                                    label: book
                                }))}
                                formLabel="Books"
                                placeholder="Select Book"
                            />
                            <Selector
                                form={form}
                                value={
                                    selectedChapter === 0
                                        ? ''
                                        : String(selectedChapter)
                                }
                                onChange={(value) =>
                                    handleChapterChange(parseInt(value))
                                }
                                options={chapters.map((chapter) => ({
                                    value: String(chapter),
                                    label: `Chapter ${chapter}`
                                }))}
                                formLabel="Chapters"
                                placeholder="Select Chapter"
                            />
                        </div>
                    </form>
                </Form>
            </div>
            <div className="card relative !px-8 !py-6 h-2/4">
                <div className="grid gap-4">
                    <ListItemAccordionProvider>
                        {sermons
                            .filter(
                                (video) =>
                                    video.chapter === selectedChapter ||
                                    showOther
                            )
                            .map((sermon) => (
                                <ListItem
                                    key={`${sermon._id}`}
                                    itemId={`${sermon._id}`}
                                    title={sermon.name}
                                    description={sermon.description}
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
                </div>
            </div>
        </div>
    )
}

export default SearchByScripture
