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

type Video = {
    title: string
    name: string
    description: string
    chapter: number
}

type SearchByScriptureProps = {
    setLoading: (loading: boolean) => void
}

function SearchByScripture({ setLoading }: SearchByScriptureProps) {
    const form = useForm()
    const [chapters, setChapters] = useState<number[]>([])
    const [selectedChapter, setSelectedChapter] = useState<number>(0)
    const [selectedBook, setSelectedBook] = useState('')
    const [books, setBooks] = useState<string[]>([])
    const [videos, setVideos] = useState<Video[]>([])
    const [showOther, setShowOther] = useState(false)

    const resetForm = (optionSelected: string[]) => {
        form.reset()
        setBooks(optionSelected)
        setChapters([])
        setSelectedBook('')
        setSelectedChapter(0)
        setVideos([])
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
            setVideos(videos)
            setLoading(false)
        }
    }

    const handleBookChange = async (value: string) => {
        setSelectedBook(value)
        const {
            data: { videos }
        } = await getVideos(value)
        setVideos(videos)
    }

    const handleChapterChange = (value: number) => {
        setSelectedChapter(value)
    }

    useEffect(() => {
        if (showOther) {
            return
        }
        const chapters = videos.map((video: any) => video.chapter)
        console.log(chapters)
        setChapters([...new Set(chapters)].sort((a, b) => a - b))
    }, [videos])

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
                        {videos
                            .filter(
                                (video) =>
                                    video.chapter === selectedChapter ||
                                    showOther
                            )
                            .map((video, index) => (
                                <ListItem
                                    key={`${video.title}-${index}`}
                                    itemId={`${video.title}-${index}`}
                                    title={video.name}
                                    description={video.description}
                                >
                                    <div className="flex gap-4">
                                        <Button
                                            className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                            variant={'secondary'}
                                            size={'icon'}
                                        >
                                            <Headphones />
                                        </Button>
                                        <Button
                                            className="inline-flex h-12 w-12 items-center justify-center !rounded-full "
                                            onClick={async () =>
                                                await getFileNoteDownloadLink(
                                                    video.title
                                                )
                                            }
                                            variant={'secondary'}
                                            size={'icon'}
                                        >
                                            <NotebookText />
                                        </Button>
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
                                            <VideoModal id={video.title} />
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
