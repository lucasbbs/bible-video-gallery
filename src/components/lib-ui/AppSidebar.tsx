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
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  UserSearchIcon
} from "lucide-react"
import ChurchSVG from "@/assets/church.svg"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const {
    form,
    books,
    preacher,
    chapters,
    selectedBook,
    selectedChapter,
    selectedTestament,
    handleBookChange,
    handleChapterChange,
    handlePreacherChange,
    handleTestamentChange,
  } = useScriptureSearch()

  const [isScriptureSearchOpen, setIsScriptureSearchOpen] = React.useState(false)
  const [isPreacherSearchOpen, setIsPreacherSearchOpen] = React.useState(false)

  React.useEffect(() => {
    localStorage.setItem(
      "bible-video-gallery:sidebar-scripture-search",
      isScriptureSearchOpen ? "1" : "0"
    )
  }, [isScriptureSearchOpen])

  React.useEffect(() => {
    localStorage.setItem(
      "bible-video-gallery:sidebar-preacher-search",
      isPreacherSearchOpen ? "1" : "0"
    )
  }, [isPreacherSearchOpen])

  const searchByScripturesMenuItems = [
    {
      title: "By Testament",
      form,
      onChange: handleTestamentChange,
      value: selectedTestament,
      options: [
        { value: "all", label: "All" },
        { value: "old", label: "Old Testament" },
        { value: "new", label: "New Testament" },
        { value: "others", label: "Others" },
      ],
      formLabel: "By Testament*",
      placeholder: "Select Testament",
    },
    {
      title: "By Book",
      form,
      onChange: handleBookChange,
      value: selectedBook,
      options: books.map((book) => ({
        value: book,
        label: book,
      })),
      formLabel: "Books",
      placeholder: "Select Book",
    },
    {
      title: "By Chapter",
      form,
      onChange: (value: string) =>
        handleChapterChange(value ? parseInt(value, 10) : 0),
      value: selectedChapter === 0 ? "" : String(selectedChapter),
      options: chapters.map((chapter) => ({
        value: String(chapter),
        label: `Chapter ${chapter}`,
      })),
      formLabel: "Chapters",
      placeholder: "Select Chapter",
    },
  ]

  const preachers = [
    {label: 'Bruce Arthur', value: 'bruce_arthur'},
    {label: 'Jacob Tomc', value: 'jacob_tomc'},
    {label: 'Guest', value: 'guest'}
  ]

  const searchByPreacher = [
    {
      title: "By Preacher",
      form,
      onChange: (value: string) =>
        handlePreacherChange(value === "all" ? "" : value),
      value: preacher || "all",
      options: [
        { value: "all", label: "All" },
        ...preachers.map((preacher) => ({
          value: preacher.value,
          label: preacher.label,
        })),
      ],
      formLabel: "Preachers",
      placeholder: "Select Preacher",
    },
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
                  <a href="#">
                    <img
                      src={ChurchSVG}
                      className={cn(
                        "transition-[width,height] duration-200 ease-linear dark:brightness-0 dark:invert",
                        isCollapsed ? "h-10 w-auto" : "h-32 w-auto"
                      )}
                      alt="Bible Video Gallery"
                    />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Search by Scripture"
                    onClick={() => setIsScriptureSearchOpen((open) => !open)}
                    className={cn("justify-between", isCollapsed && "justify-center")}
                  >
                    {isCollapsed ? (
                      <SearchIcon />
                    ) : (
                      <>
                        <span className="flex min-w-0 items-center gap-2">
                          <SearchIcon />
                          <span className="truncate">Search by Scripture</span>
                        </span>
                        {isScriptureSearchOpen ? (
                          <ChevronDownIcon className="opacity-70" />
                        ) : (
                          <ChevronRightIcon className="opacity-70" />
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {isScriptureSearchOpen ? (
                <SidebarMenuSub className="gap-3 py-2">
                  <SidebarMenuSubItem>
                    <Form {...form}>
                      <form className="w-auto space-y-4">
                        <div className="flex flex-col gap-4">
                          {searchByScripturesMenuItems.map((item) => (
                            <Selector
                              key={item.title}
                              form={item.form}
                              onChange={item.onChange}
                              value={item.value}
                              options={item.options}
                              formLabel={item.formLabel}
                              placeholder={item.placeholder}
                            />
                          ))}
                        </div>
                      </form>
                    </Form>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              ) : null}
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Search by Preacher"
                    onClick={() => setIsPreacherSearchOpen((open) => !open)}
                    className={cn("justify-between", isCollapsed && "justify-center")}
                  >
                    {isCollapsed ? (
                      <UserSearchIcon />
                    ) : (
                      <>
                        <span className="flex min-w-0 items-center gap-2">
                          <UserSearchIcon />
                          <span className="truncate">Search by Preacher</span>
                        </span>
                        {isPreacherSearchOpen ? (
                          <ChevronDownIcon className="opacity-70" />
                        ) : (
                          <ChevronRightIcon className="opacity-70" />
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {isPreacherSearchOpen ? (
                <SidebarMenuSub className="gap-3 py-2">
                  <SidebarMenuSubItem>
                    <Form {...form}>
                      <form className="w-auto space-y-4">
                        <div className="flex flex-col gap-4">
                          {searchByPreacher.map((item) => (
                            <Selector
                              key={item.title}
                              form={item.form}
                              onChange={item.onChange}
                              value={item.value}
                              options={item.options}
                              formLabel={item.formLabel}
                              placeholder={item.placeholder}
                            />
                          ))}
                        </div>
                      </form>
                    </Form>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              ) : null}
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />

        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
