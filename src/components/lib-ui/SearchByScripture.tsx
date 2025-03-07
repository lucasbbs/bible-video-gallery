import { useForm } from "react-hook-form"
import { MonitorPlay } from 'lucide-react';
import { oldTestament, newTestament, allBooks } from '../../shared/books'
import { toast } from "sonner"
import {
  Form,
} from "@/components/ui/form"
import Selector from '../../components/lib-ui/Selector'
import { ListItem } from '../../components/lib-ui/ListItem';
import { getVideos } from '../../services/videos';
import { Dialog, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { VideoModal } from '../../components/lib-ui/VideoModal';
import { useEffect, useState } from "react";

function onSubmit() {
  toast("Event has been created", {
    description: "Sunday, December 03, 2023 at 9:00 AM",
    action: {
      label: "Undo",
      onClick: () => console.log("Undo"),
    },
  })
}

type Video = {
  title: string,
  name: string,
  description: string
  chapter: number
}

function SearchByScripture() {
      const form = useForm()
      const [chapters, setChapters] = useState<number[]>([])
      const [selectedChapter, setSelectedChapter] = useState<number>(0)
      const [books, setBooks] = useState<string[]>([])
      const [videos, setVideos] = useState<Video[]>([])
    
      const handleTestamentChange = (value: string) => {
        if (value === 'old') {
          setBooks(oldTestament)
        } else if (value === 'new') {
          setBooks(newTestament)
        } else if (value === 'all') {
          setBooks(allBooks)
        } else {
          setBooks([])
        }
      }
    
      const handleBookChange = async (value: string) => {
        const { data: { videos } } = await getVideos(value);
        setVideos(videos)
      }
    
      const handleChapterChange = (value: number) => {
        setSelectedChapter(value)
      }
    
      useEffect(() => {
        if (videos.length) {
          const chapters = videos.map((video: any) => video.chapter)
          setChapters([...new Set(chapters)].sort((a, b) => a - b))
        }
      }, [videos])
    
    
    
  return (
    <div>
              <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-auto space-y-6">
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
              />
              <Selector
                form={form}
                onChange={handleBookChange}
                options={books.map((book) => ({ value: book, label: book }))}
                formLabel="Books"
              />
              <Selector
                form={form}
                onChange={(value) => handleChapterChange(parseInt(value))}
                options={chapters.map((chapter) => ({ value: String(chapter), label: `Chapter ${chapter}` }))}
                formLabel="Chapters"
              />
            </div>
          </form>
        </Form>
      </div>
      <div className="card relative p-10 h-2/4">
        <div className="grid gap-4">
          {videos.filter(video => video.chapter === selectedChapter).map((video, index) => (
            <ListItem
              key={index}
              title={video.name}
              description={video.description}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="inline-flex h-12 w-12 items-center justify-center !rounded-full " variant={"secondary"} size={"icon"}><MonitorPlay /></Button>
                </DialogTrigger>
                <VideoModal id={video.title} />
              </Dialog>
            </ListItem>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchByScripture