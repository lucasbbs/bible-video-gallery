import SearchByScripture from '@/components/lib-ui/SearchByScripture'
import { SettingsSelector } from '@/components/lib-ui/SettingsSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypeValue } from '@/lib/contants'
import { parseTabValue } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'

type SermonsLibraryProps = {
    loading: boolean
    selectedTag: string | null
    setSelectedTagInUrl: (tag: string | null) => void
    type: TypeValue
}

function SermonsLoading() {
    return (
        <div
            className="grid gap-4 py-6"
            aria-label="Loading sermons"
            aria-busy="true"
        >
            {Array.from({ length: 5 }, (_, index) => (
                <div
                    key={index}
                    className="w-full rounded-xl border border-l-4 border-l-gray-300 py-6 shadow-sm mx-auto max-w-xl"
                >
                    <div className="flex flex-col gap-4 px-6">
                        <div>
                            <Skeleton
                                className={`h-4 ${
                                    index % 2 === 0 ? 'w-2/5' : 'w-3/5'
                                } min-w-40`}
                            />
                            <div className="mt-2 flex items-center gap-2">
                                <Skeleton className="size-4 shrink-0" />
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-px" />
                                <Skeleton className="size-4 shrink-0" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="mt-2 h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Skeleton className="h-12 w-28 rounded-full" />
                            <Skeleton className="h-12 w-28 rounded-full" />
                            <Skeleton className="h-12 w-28 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function SermonsLibrary({
    loading,
    setSelectedTagInUrl,
    selectedTag,
    type
}: SermonsLibraryProps) {
    const navigate = useNavigate()

    const clearSelectedTag = useCallback(() => {
        setSelectedTagInUrl(null)
    }, [setSelectedTagInUrl])

    const setTypeInUrl = useCallback(
        (nextType: TypeValue) => {
            const nextParams = new URLSearchParams(location.search)
            nextParams.set('type', nextType)
            nextParams.delete('page')
            const qs = nextParams.toString()
            navigate(qs ? `${location.pathname}?${qs}` : location.pathname)
        },
        [location.pathname, location.search, navigate]
    )

    return (
        <>
            <header className="sticky top-0 flex h-auto shrink-0 flex-col items-center gap-2 bg-background px-4">
                <h1 className="w-45 text-center text-5xl font-semibold sm:w-full">
                    Sermon Gallery
                </h1>
                {selectedTag ? (
                    <div className="flex w-full max-w-[523.667px] items-center justify-between gap-2 pt-4">
                        <div className="min-h-15 min-w-0 flex-1 truncate text-center text-4xl font-thin sm:text-5xl">
                            #{selectedTag}
                        </div>
                        <button
                            id="remove-tag-selected"
                            type="button"
                            aria-label="Remove selected tag"
                            className="cursor-pointer border-0 bg-transparent p-0 text-foreground"
                            onClick={clearSelectedTag}
                        >
                            <XIcon className="h-10 w-10" strokeWidth={0.5} />
                        </button>
                    </div>
                ) : (
                    <Tabs
                        value={type}
                        onValueChange={(nextValue) => {
                            setTypeInUrl(parseTabValue(nextValue))
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="sermons">Sermons</TabsTrigger>
                            <TabsTrigger value="bible_studies">
                                Bible Studies
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
            </header>

            <SettingsSelector />
            <div className="card">
                {loading ? <SermonsLoading /> : <SearchByScripture />}
            </div>
        </>
    )
}
