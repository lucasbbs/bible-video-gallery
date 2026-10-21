import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CalendarDaysIcon,
    FileTextIcon,
    PlayIcon,
    RefreshCwIcon,
    UserRoundIcon
} from 'lucide-react'

import { MediaModal } from '@/components/lib-ui/MediaModal'
import { PdfModal } from '@/components/lib-ui/PdfModal'
import { SettingsSelector } from '@/components/lib-ui/SettingsSelector'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { getCollectionById } from '@/services/collections'
import type {
    CollectionBibleStudy,
    CollectionResponse
} from '@/types/collection'
import { BibleStudyCollectionCard } from '@/components/lib-ui/BibleStudyCollectionCard'

const DEFAULT_DESCRIPTION = 'Explore the Bible studies in this collection.'

function formatTeacher(value?: string) {
    if (!value?.trim()) return ''

    return value
        .trim()
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value?: string) {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date)
}

function getStudyId(study: CollectionBibleStudy, index: number) {
    return study.id || `${study.name}-${index}`
}

function getStudyMediaUrl(study: CollectionBibleStudy) {
    return study.audioUrl?.trim() || study.videoLink?.trim() || ''
}

function getBibleReference(study: CollectionBibleStudy) {
    if (!study.book || study.book.toLowerCase() === 'others' || !study.chapter) {
        return ''
    }

    return `${study.book} ${study.chapter}${study.verses ? `:${study.verses}` : ''}`
}

function CollectionPageLoading() {
    return (
        <main
            className="min-h-full flex-1 overflow-hidden pb-20"
            aria-label="Loading Bible study collection"
            aria-busy="true"
        >
            <div className="relative h-[clamp(22rem,48vw,35rem)] w-full">
                <Skeleton className="absolute inset-0 rounded-none" />
                <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-10 lg:px-14">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="mt-4 h-10 w-3/5 max-w-xl sm:h-12" />
                    <Skeleton className="mt-3 h-4 w-2/5 max-w-md" />
                    <Skeleton className="mt-7 h-4 w-4/5 max-w-3xl" />
                    <div className="mt-6 flex gap-3">
                        <Skeleton className="h-11 w-36 rounded-full" />
                        <Skeleton className="size-11 rounded-full" />
                    </div>
                </div>
            </div>

            <section className="px-5 pt-8 sm:px-10 lg:px-14">
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-7 w-52" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="mt-5 divide-y divide-border border-y">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 py-5 sm:gap-6"
                        >
                            <Skeleton className="size-6 shrink-0 rounded-full" />
                            <div className="min-w-0 flex-1">
                                <Skeleton
                                    className={`h-4 ${index % 2 ? 'w-2/5' : 'w-1/3'}`}
                                />
                                <Skeleton className="mt-2 h-3 w-3/5" />
                                <div className="mt-3 flex gap-3">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="size-10 shrink-0 rounded-full" />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default function CollectionPage() {
    const { id } = useParams<{ id: string }>()
    const [collection, setCollection] = useState<CollectionResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [imageFailed, setImageFailed] = useState(false)
    const [activeAudioUrl, setActiveAudioUrl] = useState('')
    const [activePdfUrl, setActivePdfUrl] = useState('')

    const retry = useCallback(() => {
        setReloadKey((current) => current + 1)
    }, [])

    useEffect(() => {
        const controller = new AbortController()

        ;(async () => {
            if (!id) {
                setError('This collection link is incomplete.')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const nextCollection = await getCollectionById(
                    id,
                    controller.signal
                )
                setCollection(nextCollection)
                setImageFailed(false)
            } catch (nextError) {
                if (controller.signal.aborted) return
                console.error('Failed to load Bible study collection', nextError)
                setCollection(null)
                setError('We could not load this collection. Please try again.')
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        })()

        return () => controller.abort()
    }, [id, reloadKey])

    if (loading) return <CollectionPageLoading />

    if (error || !collection) {
        return (
            <main className="flex min-h-full flex-1 items-center justify-center px-5 py-16">
                <Card className="w-full max-w-lg items-center text-center">
                    <CardHeader>
                        <CardTitle>Collection unavailable</CardTitle>
                        <CardDescription>
                            {error || 'This collection could not be found.'}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-wrap justify-center gap-3">
                        <Button asChild variant="outline">
                            <Link to="/collections">
                                <ArrowLeftIcon />
                                All collections
                            </Link>
                        </Button>
                        <Button type="button" onClick={retry}>
                            <RefreshCwIcon />
                            Try again
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        )
    }

    const { item, bibleStudies } = collection
    const description = item.description?.trim() || DEFAULT_DESCRIPTION

    return (
        <>
            <SettingsSelector />
            <main className="min-h-full flex-1 overflow-hidden bg-background pb-20">
                <section className="relative min-h-[clamp(26rem,52vw,38rem)] w-full overflow-hidden">
                    <BibleStudyCollectionCard
                        eager={true}
                        collection={item}
                        featuredImage={item.featuredImage}
                        iconClassName="size-24 opacity-25"
                        name={item.name}
                        description={description}
                        imageFailed={imageFailed}
                        setImageFailed={setImageFailed}
                    />
                </section>

                <section
                    className="px-5 pt-8 sm:px-10 lg:px-14"
                    aria-labelledby="collection-studies-title"
                >
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                The complete collection
                            </p>
                            <h2
                                id="collection-studies-title"
                                className="mt-1 text-2xl font-semibold tracking-tight"
                            >
                                Studies in this series
                            </h2>
                        </div>
                        <p className="shrink-0 text-sm text-muted-foreground">
                            {bibleStudies.length}{' '}
                            {bibleStudies.length === 1 ? 'study' : 'studies'}
                        </p>
                    </div>

                    {bibleStudies.length ? (
                        <ol className="mt-5 divide-y divide-border border-y">
                            {bibleStudies.map((study, index) => {
                                const teacher = formatTeacher(study.preacher)
                                const date = formatDate(
                                    study.createdAt
                                )
                                const reference = getBibleReference(study)

                                return (
                                    <li
                                        key={getStudyId(study, index)}
                                        className="group flex items-center gap-4 py-5 sm:gap-6"
                                    >
                                        <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-semibold leading-6 sm:text-lg">
                                                {study.name}
                                            </h3>
                                            {study.description ? (
                                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                                                    {study.description}
                                                </p>
                                            ) : null}

                                            {reference || teacher || date ? (
                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                                                    {reference ? (
                                                        <span className="inline-flex items-center gap-1.5 text-primary">
                                                            <BookOpenIcon className="size-3.5" />
                                                            {reference}
                                                        </span>
                                                    ) : null}
                                                    {teacher ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <UserRoundIcon className="size-3.5" />
                                                            {teacher}
                                                        </span>
                                                    ) : null}
                                                    {date ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarDaysIcon className="size-3.5" />
                                                            {date}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            {study.sermonPdf?.fileUrl ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-10 rounded-full"
                                                    aria-label={`Read notes for ${study.name}`}
                                                    onClick={() =>
                                                        setActivePdfUrl(
                                                            study.sermonPdf?.fileUrl || ''
                                                        )
                                                    }
                                                >
                                                    <FileTextIcon />
                                                </Button>
                                            ) : null}
                                            {getStudyMediaUrl(study) ? (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className="size-10 rounded-full transition-transform group-hover:scale-105"
                                                    aria-label={`Play ${study.name}`}
                                                    onClick={() =>
                                                        setActiveAudioUrl(
                                                            getStudyMediaUrl(study)
                                                        )
                                                    }
                                                >
                                                    <PlayIcon className="fill-current" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>
                    ) : (
                        <Card className="mt-6 items-center text-center shadow-none">
                            <CardHeader>
                                <CardTitle>No studies in this collection yet</CardTitle>
                                <CardDescription>
                                    New Bible studies will appear here when they are
                                    published.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </section>
            </main>

            <Dialog
                open={Boolean(activeAudioUrl)}
                onOpenChange={(open) => !open && setActiveAudioUrl('')}
            >
                {activeAudioUrl ? <MediaModal url={activeAudioUrl} /> : null}
            </Dialog>
            <Dialog
                modal={false}
                open={Boolean(activePdfUrl)}
                onOpenChange={(open) => !open && setActivePdfUrl('')}
            >
                {activePdfUrl ? <PdfModal url={activePdfUrl} /> : null}
            </Dialog>
        </>
    )
}
