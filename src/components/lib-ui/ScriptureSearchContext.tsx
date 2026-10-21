import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useForm } from "react-hook-form"

import { Sermon, SermonDTO } from "@/dtos/sermon.dto"
import { SpeakerDTO } from "@/dtos/speaker.dto"
import { getCollections } from "@/services/collections"
import { getSpeakers } from "@/services/speakers"
import { getBibleChapters, getVideos } from "@/services/videos"
import { allBooks, newTestament, oldTestament } from "@/shared/books"
import { DateRange } from "react-day-picker"
import { SPEAKER_TYPE } from "@/types/speaker"
import type { BibleStudyCollection } from "@/types/collection"

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
  collections: BibleStudyCollection[]
  collectionsLoading: boolean
  collectionsError: string | null
  showOther: boolean
  total: number
  page: number
  pageSize: number
  type: string
  speaker: string
  preachers: SpeakerDTO[]
  teachers: SpeakerDTO[]
  selectedTag: string | null
  selectedDateRange: DateRange | undefined
  setSelectedDateRange: (range: DateRange | undefined) => void
  handleTestamentChange: (value: string) => void
  handleBookChange: (value: string) => void
  handleChapterChange: (value: number) => void
  handleSpeakerChange: (value: string) => void
  handleTagChange: (value: string) => void
  reloadCollections: () => void
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
  enabled?: boolean
  collectionsEnabled?: boolean
  setLoading: (loading: boolean) => void
  page: number
  pageSize: number
  type: string
  selectedTag: string | null
  selectedDateRange: DateRange | undefined
  onSetSelectedTag: (tag: string | null) => void
  onSetSelectedDateRange: (range: DateRange | undefined) => void
  onResetPage: () => void
  children: ReactNode
}

export function ScriptureSearchProvider({
  enabled = true,
  collectionsEnabled = false,
  setLoading,
  page,
  pageSize,
  type,
  selectedTag,
  selectedDateRange,
  onSetSelectedTag,
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
  const [collections, setCollections] = useState<BibleStudyCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)
  const [collectionsReloadKey, setCollectionsReloadKey] = useState(0)
  const [showOther, setShowOther] = useState(false)
  const [total, setTotal] = useState(0)
  const [speaker, setSpeaker] = useState('')
  const [teachers, setTeachers] = useState<SpeakerDTO[]>([])
  const [preachers, setPreachers] = useState<SpeakerDTO[]>([])

  const reloadCollections = useCallback(() => {
    setCollectionsReloadKey((current) => current + 1)
  }, [])

  const resetForm = (optionSelected: string[]) => {
    form.reset()
    setBooks(optionSelected)
    setSpeaker('')
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

  const handleSpeakerChange = (value: string) => {
    setSpeaker(value)
    setSelectedChapter(0)
    setSermons([])
    setTotal(0)
    onResetPage()
  }

  const handleTagChange = (value: string) => {
    onSetSelectedTag(value)
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
    setSpeaker('')
    if (!enabled || (type !== SPEAKER_TYPE.SERMONS && type !== SPEAKER_TYPE.ALL)) {
      setPreachers([])
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const nextPreachers = await getSpeakers(SPEAKER_TYPE.SERMONS)
        if (!cancelled) setPreachers(nextPreachers)
      } catch (error) {
        console.error("Failed to load preachers", error)
        if (!cancelled) setPreachers([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, type])

  useEffect(() => {
    setSpeaker('')
    const shouldLoadTeachers =
      collectionsEnabled ||
      (enabled && type === SPEAKER_TYPE.BIBLE_STUDIES)

    if (!shouldLoadTeachers) {
      setTeachers([])
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const nextTeachers = await getSpeakers(SPEAKER_TYPE.BIBLE_STUDIES)
        if (!cancelled) setTeachers(nextTeachers)
      } catch (error) {
        console.error("Failed to load teachers", error)
        if (!cancelled) setTeachers([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [collectionsEnabled, enabled, type])

  useEffect(() => {
    if (!enabled && !collectionsEnabled) {
      setChapters([])
      return
    }
    if (showOther) {
      setChapters([])
      return
    }
    if (selectedBook === "") {
      setChapters([])
      return
    }

    ;(async () => {
      try {
        const response = await getBibleChapters(selectedBook)
        const nextChapters = response.data.items.map((item) => item.chapterNumber).sort((a, b) => a - b)
        setChapters(nextChapters)
      } catch (error) {
        console.error("Failed to load chapters", error)
        setChapters([])
      }
    })()
  }, [collectionsEnabled, enabled, sermons, showOther, selectedBook])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    ;(async () => {
      setLoading(true)
      // const book = showOther ? "others" : selectedBook === "" ? null : selectedBook
      let book: string | null = null
      if (showOther) {
        book = "others"
      } else if (selectedBook === 'all') {
        book = null
      } else if (selectedBook !== "") {
        book = selectedBook
      }
      const testament =
        selectedTestament === "old" || selectedTestament === "new"
          ? selectedTestament
          : null
      const hasFilters =
        showOther || testament || selectedBook !== "" || speaker !== "" || dateFrom || dateTo || selectedTag ? 1 : 0
      const {
        data: { videos, total },
      } = await getVideos(
        book,
        page,
        pageSize,
        speaker,
        hasFilters,
        type,
        dateFrom,
        dateTo,
        selectedTag ? [selectedTag] : '',
        testament,
        selectedChapter
      )
      setTotal(total)
      setSermons(videos.map((sermon: Sermon) => SermonDTO.from(sermon)))
      setLoading(false)
    })()
  }, [enabled, page, pageSize, selectedBook, selectedTestament, showOther, setLoading, speaker, type, dateFrom, dateTo, selectedTag, selectedChapter])

  useEffect(() => {
    if (!collectionsEnabled) {
      setCollections([])
      setCollectionsError(null)
      setCollectionsLoading(false)
      return
    }

    const controller = new AbortController()

    ;(async () => {
      setCollectionsLoading(true)
      setCollectionsError(null)

      let book: string | null = null
      if (showOther) {
        book = "others"
      } else if (selectedBook !== "" && selectedBook !== "all") {
        book = selectedBook
      }

      const testament =
        selectedTestament === "old" || selectedTestament === "new"
          ? selectedTestament
          : null

      try {
        const nextCollections = await getCollections(
          {
            book,
            chapter: selectedChapter || null,
            testament,
            preacher: speaker || null,
            dateFrom,
            dateTo,
          },
          controller.signal
        )
        setCollections(nextCollections)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Failed to load Bible study collections", error)
        setCollectionsError(
          "We could not load the collections. Please try again."
        )
      } finally {
        if (!controller.signal.aborted) setCollectionsLoading(false)
      }
    })()

    return () => controller.abort()
  }, [
    collectionsEnabled,
    collectionsReloadKey,
    dateFrom,
    dateTo,
    selectedBook,
    selectedChapter,
    selectedTestament,
    showOther,
    speaker,
  ])

  const contextValue: ScriptureSearchContextValue = {
    form,
    chapters,
    selectedTestament,
    selectedChapter,
    selectedBook,
    books,
    speaker,
    preachers,
    teachers,
    selectedTag,
    sermons,
    collections,
    collectionsLoading,
    collectionsError,
    showOther,
    total,
    page,
    pageSize,
    type,
    handleTestamentChange,
    handleBookChange,
    handleChapterChange,
    handleSpeakerChange,
    handleTagChange,
    reloadCollections,
    selectedDateRange,
    setSelectedDateRange: onSetSelectedDateRange,

  }

  return (
    <ScriptureSearchContext.Provider value={contextValue}>
      {children}
    </ScriptureSearchContext.Provider>
  )
}
