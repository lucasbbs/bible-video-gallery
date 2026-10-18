import {
    createContext,
    useState,
    type ComponentProps,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, BookMarked, Mic, UserRound } from 'lucide-react'
import { Tag } from '@/types/sermons'
import { useNavigate } from 'react-router'

type ListItemAccordionContextValue = {
    openItemId: string | null
    setOpenItemId: Dispatch<SetStateAction<string | null>>
}

const ListItemAccordionContext =
    createContext<ListItemAccordionContextValue | null>(null)

type ListItemAccordionProviderProps = {
    children: ReactNode
}

const SermonBadge = () => {
    return (
        <div className="flex items-center gap-1 rounded-full bg-red-100 mt-2 px-2 py-0.5 text-xs font-medium text-red-800">
            <Mic className="size-4" />
            <span>Sermon</span>
        </div>
    )
}

const BibleStudyBadge = () => {
    return (
        <div className="flex items-center gap-1 rounded-full bg-orange-100 mt-2 px-2 py-0.5 text-xs font-medium text-orange-800">
            <BookMarked className="size-4" />
            <span>Bible Study</span>
        </div>
    )
}

export function ListItemAccordionProvider({
    children
}: ListItemAccordionProviderProps) {
    const [openItemId, setOpenItemId] = useState<string | null>(null)

    return (
        <ListItemAccordionContext.Provider
            value={{ openItemId, setOpenItemId }}
        >
            {children}
        </ListItemAccordionContext.Provider>
    )
}

type CardProps = ComponentProps<typeof Card> & {
    title?: string
    footer?: string
    description?: string
    itemId?: string
    createdTime: string
    type: string
    bibleVerse?: string
    tags?: Tag[]
    onTagClick?: (tag: string) => void
    speaker: string
}

export function ListItem({
    className,
    title,
    children,
    createdTime,
    bibleVerse,
    type,
    tags,
    speaker,
    ...props
}: CardProps) {

    return (
        <Card className={cn(`group w-full border-l-4 ${type === 'sermons' ? 'border-l-red-300' : 'border-l-orange-300'}`, className)} {...props}>
            <CardHeader className="flex flex-col gap-4">
                <div className="flex w-full flex-col items-start">
                    <CardTitle className="pb-2">{title}</CardTitle>
                        <div className="grid grid-cols-2 mobile:grid-cols-4 gap-2
                            [&>div:nth-child(even)]:border-l
                            [&>div:nth-child(even)]:pl-2
                            mobile:[&>div:not(:first-child)]:border-l
                            mobile:[&>div:not(:first-child)]:pl-2
                            border-gray-300"
                        >
                            {speaker && (
                                <div className="flex items-center gap-1">
                                    <UserRound size={18} />
                                    <small className="capitalize text-sm whitespace-nowrap">
                                        {speaker.replace("_", " ")}
                                    </small>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Calendar size={18} />
                                <small className="text-sm whitespace-nowrap">
                                    {createdTime}
                                </small>
                            </div>

                            {bibleVerse && (
                                <div className="flex items-center gap-1">
                                    <BookOpen size={18} />
                                    <small className="text-sm whitespace-nowrap">
                                        {bibleVerse}
                                    </small>
                                </div>
                            )}
                        </div>
                    <div>{type === 'sermons' ? <SermonBadge /> : <BibleStudyBadge />}</div>
                </div>
                {children ? (
                    <>
                        <div className=" items-center gap-2 sm:flex">
                            <div className="flex items-center gap-2">
                                {children}
                            </div>
                            {/* <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Toggle actions"
                                className="h-12 w-12 !rounded-full transition duration-200 ease-in"
                            >
                                <MoreHorizontal className="h-12 w-12" />
                            </Button> */}
                        </div>
                        {(tags || []).length > 0 ? (
                            <div className="max-h-0 -mt-4 overflow-hidden opacity-0 transition-[max-height,opacity] duration-500 ease-out group-hover:max-h-16 group-hover:opacity-100 group-focus-within:max-h-16 group-focus-within:opacity-100">
                                <div className="flex flex-wrap gap-2">
                                    {(tags || []).map(tag => (
                                        <TagViewer
                                            key={tag._id}
                                            tag={tag}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {/* <div className="flex items-center sm:hidden">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={
                                    mobileActionsOpen
                                        ? 'Hide actions'
                                        : 'Show actions'
                                }
                                aria-expanded={mobileActionsOpen}
                                aria-controls={actionsId}
                                className="h-12 w-12 !rounded-full transition duration-200 ease-in"
                                onClick={toggleMobileActions}
                            >
                                <MoreHorizontal className="h-12 w-12 transition-transform duration-200" />
                            </Button>
                            <div
                                id={actionsId}
                                className={cn(
                                    'flex overflow-hidden transition-all duration-200 ease-in',
                                    mobileActionsOpen
                                        ? 'ml-2 max-w-[18rem] opacity-100 pointer-events-auto'
                                        : 'max-w-0 opacity-0 pointer-events-none'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {children}
                                </div>
                            </div>
                        </div> */}
                    </>
                ) : null}
            </CardHeader>
        </Card>
    )
}

const TagViewer = ({
    tag,
}: {
    tag: Tag
}) => {
    const navigate = useNavigate()
    return (
        <button
            type="button"
            className="mt-2 text-sm"
            onClick={() => navigate(`/collection/${tag._id}`)}
        >
            #{tag.title}
        </button>
    )
}
