import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useForm } from "react-hook-form"

import { Sermon, SermonDTO } from "@/dtos/sermon.dto"
import { getVideos } from "@/services/videos"
import { allBooks, newTestament, oldTestament } from "@/shared/books"
import { DateRange } from "react-day-picker"

function formatDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

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
  preacher: string
  selectedDateRange: DateRange | undefined
  setSelectedDateRange: (range: DateRange | undefined) => void
  handleTestamentChange: (value: string) => void
  handleBookChange: (value: string) => void
  handleChapterChange: (value: number) => void
  handlePreacherChange: (value: string) => void
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
  page: number
  pageSize: number
  type: string
  selectedDateRange: DateRange | undefined
  onSetSelectedDateRange: (range: DateRange | undefined) => void
  onResetPage: () => void
  children: ReactNode
}

export function ScriptureSearchProvider({
  setLoading,
  page,
  pageSize,
  type,
  selectedDateRange,
  onSetSelectedDateRange,
  onResetPage,
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
  const [preacher, setPreacher] = useState('')

  const resetForm = (optionSelected: string[]) => {
    form.reset()
    setBooks(optionSelected)
    setPreacher('')
    setChapters([])
    setSelectedBook("")
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
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
    onResetPage()
    setSelectedTestament(value)
  }

  const handleBookChange = (value: string) => {
    setShowOther(false)
    setSelectedBook(value)
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
    onResetPage()
  }

  const handleChapterChange = (value: number) => {
    setSelectedChapter(value)
  }

  const handlePreacherChange = (value: string) => {
    setPreacher(value)
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
    onResetPage()
  }

  const dateFrom = selectedDateRange?.from
    ? formatDateParam(selectedDateRange.from)
    : null
  const dateTo = selectedDateRange?.to ? formatDateParam(selectedDateRange.to) : null

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
      const hasFilters =
        showOther || selectedBook !== "" || preacher !== "" || dateFrom || dateTo ? 1 : 0
      const {
        data: { videos, total },
      } = await getVideos(book, page, pageSize, preacher, hasFilters, type, dateFrom, dateTo)
      setTotal(total)
      setSermons(videos.map((sermon: Sermon) => SermonDTO.from(sermon)))
      setLoading(false)
    })()
  }, [page, pageSize, selectedBook, showOther, setLoading, preacher, type, dateFrom, dateTo])

  const contextValue: ScriptureSearchContextValue = {
    form,
    chapters,
    selectedTestament,
    selectedChapter,
    selectedBook,
    books,
    preacher,
    sermons,
    showOther,
    total,
    page,
    pageSize,
    handleTestamentChange,
    handleBookChange,
    handleChapterChange,
    handlePreacherChange,
    selectedDateRange,
    setSelectedDateRange: onSetSelectedDateRange,

  }

  return (
    <ScriptureSearchContext.Provider value={contextValue}>
      {children}
    </ScriptureSearchContext.Provider>
  )
}
