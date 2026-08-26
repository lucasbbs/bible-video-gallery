import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Form } from "@/components/ui/form"
import Selector from "@/components/lib-ui/Selector"
import { useScriptureSearch } from "@/components/lib-ui/ScriptureSearchContext"
import { cn } from "@/lib/utils"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  LibraryBigIcon,
  SearchIcon,
  UserSearchIcon
} from "lucide-react"
import ChurchSVG from "@/assets/church.svg"
import DateRangePicker from "../ui/date-range-picker"
import { Link, useLocation } from "react-router"

const SIDEBAR_FILTERS_OPEN_KEY = "bible-video-gallery:sidebar-filters-open"
const LEGACY_SCRIPTURE_OPEN_KEY = "bible-video-gallery:sidebar-scripture-search"
const LEGACY_PREACHER_OPEN_KEY = "bible-video-gallery:sidebar-preacher-search"

const slugifyTeacherValue = (name: string) =>
  name.trim().toLocaleLowerCase().replace(/\s+/g, "_")

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  showFilters?: boolean
}

export function AppSidebar({ showFilters = true, ...props }: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const location = useLocation()
  const {
    form,
    books,
    preacher,
    chapters,
    selectedBook,
    selectedChapter,
    selectedTestament,
    teachers,
    type,
    handleBookChange,
    handleChapterChange,
    handlePreacherChange,
    handleTestamentChange,
    selectedDateRange,
    setSelectedDateRange
  } = useScriptureSearch()

  const [openFilters, setOpenFilters] = React.useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {}

      const nextState: Record<string, boolean> = {}

      try {
        const raw = localStorage.getItem(SIDEBAR_FILTERS_OPEN_KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (parsed && typeof parsed === "object") {
            for (const [key, value] of Object.entries(
              parsed as Record<string, unknown>
            )) {
              if (typeof value === "boolean") nextState[key] = value
            }
          }
        }
      } catch {
        // ignore
      }

      const legacyScripture = localStorage.getItem(LEGACY_SCRIPTURE_OPEN_KEY)
      if (legacyScripture !== null && nextState.scripture === undefined) {
        nextState.scripture = legacyScripture === "1"
      }

      const legacyPreacher = localStorage.getItem(LEGACY_PREACHER_OPEN_KEY)
      if (legacyPreacher !== null && nextState.preacher === undefined) {
        nextState.preacher = legacyPreacher === "1"
      }

      if (nextState.scripture === undefined) nextState.scripture = false
      if (nextState.preacher === undefined) nextState.preacher = false

      return nextState
    }
  )

  const toggleFilterOpen = React.useCallback((filterId: string) => {
    setOpenFilters((current) => ({
      ...current,
      [filterId]: !current[filterId],
    }))
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_FILTERS_OPEN_KEY, JSON.stringify(openFilters))
      localStorage.setItem(
        LEGACY_SCRIPTURE_OPEN_KEY,
        openFilters.scripture ? "1" : "0"
      )
      localStorage.setItem(
        LEGACY_PREACHER_OPEN_KEY,
        openFilters.preacher ? "1" : "0"
      )
    } catch {
      // ignore
    }
  }, [openFilters])

  const preachers = [
    {label: 'Bruce Arthur', value: 'bruce_arthur'},
    {label: 'Jacob Tomc', value: 'jacob_tomc'},
    {label: 'Guest', value: 'guest'}
  ]

  const isBibleStudies = type === "bible_studies"
  const speakerOptions = isBibleStudies
    ? teachers.map((teacher) => ({
        value: slugifyTeacherValue(teacher.name),
        label: teacher.name,
      }))
    : preachers
  const speakerFilterLabel = isBibleStudies
    ? "Search by Teacher"
    : "Search by Preacher"
  const speakerFormLabel = isBibleStudies ? "Teachers" : "Preachers"
  const speakerPlaceholder = isBibleStudies
    ? "Select Teacher"
    : "Select Preacher"

  const sidebarFilterOptions = [
    {
      id: "scripture",
      label: "Search by Scripture",
      Icon: SearchIcon,
      items: [
        {
          key: "testament",
          element: (
            <Selector
              form={form}
              onChange={handleTestamentChange}
              value={selectedTestament}
              options={[
                { value: "all", label: "All" },
                { value: "old", label: "Old Testament" },
                { value: "new", label: "New Testament" },
                { value: "others", label: "Others" },
              ]}
              formLabel="Testament*"
              placeholder="Select Testament"
            />
          ),
        },
        {
          key: "book",
          element: (
            <Selector
              form={form}
              onChange={handleBookChange}
              value={selectedBook}
              options={books.map((book) => ({
                value: book,
                label: book,
              }))}
              formLabel="Books"
              placeholder="Select Book"
            />
          ),
        },
        {
          key: "chapter",
          element: (
            <Selector
              form={form}
              onChange={(value: string) =>
                handleChapterChange(value ? parseInt(value, 10) : 0)
              }
              value={selectedChapter === 0 ? "" : String(selectedChapter)}
              options={chapters.map((chapter) => ({
                value: String(chapter),
                label: `Chapter ${chapter}`,
              }))}
              formLabel="Chapters"
              placeholder="Select Chapter"
            />
          ),
        },
      ],
    },
    {
      id: "preacher",
      label: speakerFilterLabel,
      Icon: UserSearchIcon,
      items: [
        {
          key: "preacher",
          element: (
            <Selector
              form={form}
              onChange={(value: string) =>
                handlePreacherChange(value === "all" ? "" : value)
              }
              value={preacher || "all"}
              options={[
                { value: "all", label: "All" },
                ...speakerOptions.map((speaker) => ({
                  value: speaker.value,
                  label: speaker.label,
                })),
              ]}
              formLabel={speakerFormLabel}
              placeholder={speakerPlaceholder}
            />
          ),
        },
      ],
    },
    {
      id: "date",
      label: "Search by Date",
      Icon: CalendarIcon,
      items: [
        {
          key: "date",
          element: (
            <DateRangePicker
              dateRange={selectedDateRange}
              setDateRange={setSelectedDateRange}
            />
          )
        }
      ]
    }
  ]

  return (
    <div className="flex">
      <Sidebar variant="inset" collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="relative">
             <SidebarTrigger className={`absolute -right-15 !outline-none ${isCollapsed ? '' : 'bg-background'}`} />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-32 justify-center"
                >
                  <Link to="/" aria-label="Go to the sermon gallery">
                    <img
                      src={ChurchSVG}
                      className={cn(
                        "transition-[width,height] duration-200 ease-linear dark:brightness-0 dark:invert",
                        isCollapsed ? "h-10 w-auto" : "h-32 w-auto"
                      )}
                      alt="Bible Video Gallery"
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/"}
                    tooltip="Sermon Gallery"
                  >
                    <Link to="/">
                      <HomeIcon />
                      <span>Sermon Gallery</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/collections"}
                    tooltip="Bible Study Collections"
                  >
                    <Link to="/collections">
                      <LibraryBigIcon />
                      <span>Bible Study Collections</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {showFilters ? <SidebarSeparator /> : null}
          {showFilters ? sidebarFilterOptions.map((filter) => {
            const isOpen = !!openFilters[filter.id]

            return (
              <SidebarGroup key={filter.id}>
                <SidebarGroupContent className="flex flex-col gap-2">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={filter.label}
                        onClick={() => toggleFilterOpen(filter.id)}
                        className={cn(
                          "justify-between",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {isCollapsed ? (
                          <filter.Icon />
                        ) : (
                          <>
                            <span className="flex min-w-0 items-center gap-2">
                              <filter.Icon />
                              <span className="truncate">{filter.label}</span>
                            </span>
                            {isOpen ? (
                              <ChevronDownIcon className="opacity-70" />
                            ) : (
                              <ChevronRightIcon className="opacity-70" />
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  {isOpen ? (
                    <SidebarMenuSub className="gap-3 py-2">
                      <SidebarMenuSubItem>
                        <Form {...form}>
                          <form className="w-auto space-y-4">
                            <div className="flex flex-col gap-4">
                              {filter.items.map((item) => (
                                <React.Fragment key={item.key}>
                                  {item.element}
                                </React.Fragment>
                              ))}
                            </div>
                          </form>
                        </Form>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  ) : null}
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }) : null}
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
