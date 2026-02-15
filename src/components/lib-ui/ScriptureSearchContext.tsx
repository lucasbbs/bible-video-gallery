import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"

import { Sermon, SermonDTO } from "@/dtos/sermon.dto"
import { getVideos } from "@/services/videos"
import { allBooks, newTestament, oldTestament } from "@/shared/books"

type ScriptureSearchContextValue = {
  form: ReturnType<typeof useForm>
  chapters: number[]
  selectedTestament: string
  selectedChapter: number
  selectedBook: string
  books: string[]
  sermons: SermonDTO[]
  showOther: boolean
  total: number
  page: number
  pageSize: number
  handleTestamentChange: (value: string) => void
  handleBookChange: (value: string) => void
  handleChapterChange: (value: number) => void
}

const ScriptureSearchContext =
  createContext<ScriptureSearchContextValue | null>(null)

export function useScriptureSearch() {
  const context = useContext(ScriptureSearchContext)
  if (!context) {
    throw new Error(
      "useScriptureSearch must be used within a ScriptureSearchProvider."
    )
  }

  return context
}

type ScriptureSearchProviderProps = {
  setLoading: (loading: boolean) => void
  children: ReactNode
}

export function ScriptureSearchProvider({
  setLoading,
  children,
}: ScriptureSearchProviderProps) {
  const form = useForm()
  const [chapters, setChapters] = useState<number[]>([])
  const [selectedTestament, setSelectedTestament] = useState("all")
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [selectedBook, setSelectedBook] = useState("")
  const [books, setBooks] = useState<string[]>(allBooks)
  const [sermons, setSermons] = useState<SermonDTO[]>([])
  const [showOther, setShowOther] = useState(false)
  const [total, setTotal] = useState(0)

  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const page = parseInt(searchParams.get("page") || "1")
  const pageSize = parseInt(searchParams.get("pageSize") || "5")

  const resetForm = (optionSelected: string[]) => {
    form.reset()
    setBooks(optionSelected)
    setChapters([])
    setSelectedBook("")
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
  }

  const resetPageInUrl = () => {
    const nextParams = new URLSearchParams(location.search)
    if (!nextParams.has("page")) {
      return
    }
    nextParams.delete("page")
    const qs = nextParams.toString()
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname)
  }

  const handleTestamentChange = (value: string) => {
    if (value === "old") {
      setShowOther(false)
      resetForm(oldTestament)
    } else if (value === "new") {
      setShowOther(false)
      resetForm(newTestament)
    } else if (value === "all") {
      setShowOther(false)
      resetForm(allBooks)
    } else {
      setShowOther(true)
      resetForm([])
    }
    resetPageInUrl()
    setSelectedTestament(value)
  }

  const handleBookChange = (value: string) => {
    setShowOther(false)
    setSelectedBook(value)
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
    resetPageInUrl()
  }

  const handleChapterChange = (value: number) => {
    setSelectedChapter(value)
  }

  useEffect(() => {
    if (showOther) {
      setChapters([])
      return
    }
    if (selectedBook === "") {
      setChapters([])
      return
    }
    const chapters = sermons.map((video: SermonDTO) => video.chapter)
    setChapters([...new Set(chapters)].sort((a, b) => a - b))
  }, [sermons, showOther, selectedBook])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const book = showOther ? "others" : selectedBook === "" ? null : selectedBook
      const hasFilters = showOther || selectedBook !== "" ? 1 : 0
      const {
        data: { videos, total },
      } = await getVideos(book, page, pageSize, hasFilters)
      setTotal(total)
      setSermons(videos.map((sermon: Sermon) => SermonDTO.from(sermon)))
      setLoading(false)
    })()
  }, [page, pageSize, selectedBook, showOther, setLoading])

  const contextValue: ScriptureSearchContextValue = {
    form,
    chapters,
    selectedTestament,
    selectedChapter,
    selectedBook,
    books,
    sermons,
    showOther,
    total,
    page,
    pageSize,
    handleTestamentChange,
    handleBookChange,
    handleChapterChange,
  }

  return (
    <ScriptureSearchContext.Provider value={contextValue}>
      {children}
    </ScriptureSearchContext.Provider>
  )
}
