import {
    createContext,
    useContext,
    useId,
    useState,
    type ComponentProps,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal } from 'lucide-react'

type ListItemAccordionContextValue = {
    openItemId: string | null
    setOpenItemId: Dispatch<SetStateAction<string | null>>
}

const ListItemAccordionContext =
    createContext<ListItemAccordionContextValue | null>(null)

type ListItemAccordionProviderProps = {
    children: ReactNode
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
}

export function ListItem({
    className,
    title,
    children,
    description,
    itemId,
    ...props
}: CardProps) {
    const accordion = useContext(ListItemAccordionContext)
    const autoItemId = useId()
    const resolvedItemId = itemId ?? autoItemId
    const actionsId = useId()
    const [localMobileOpen, setLocalMobileOpen] = useState(false)

    const mobileActionsOpen = accordion
        ? accordion.openItemId === resolvedItemId
        : localMobileOpen

    const toggleMobileActions = () => {
        if (accordion) {
            accordion.setOpenItemId((current) =>
                current === resolvedItemId ? null : resolvedItemId
            )
            return
        }

        setLocalMobileOpen((open) => !open)
    }

    return (
        <Card className={cn('group w-full', className)} {...props}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col items-start">
                    <CardTitle>{title}</CardTitle>
                    <small>{description}</small>
                </div>
                {children ? (
                    <>
                        <div className="hidden items-center gap-2 sm:flex">
                            <div className="flex items-center gap-2 origin-right scale-0 opacity-0 pointer-events-none transition-all duration-200 ease-in group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                                {children}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Toggle actions"
                                className="h-12 w-12 !rounded-full transition duration-200 ease-in"
                            >
                                <MoreHorizontal className="h-12 w-12" />
                            </Button>
                        </div>
                        <div className="flex items-center sm:hidden">
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
                        </div>
                    </>
                ) : null}
            </CardHeader>
        </Card>
    )
}
