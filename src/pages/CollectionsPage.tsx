import { useCallback, useEffect, useState } from 'react'
import { ArrowRightIcon, BookOpenIcon, RefreshCwIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { getCollections } from '@/services/collections'
import type { BibleStudyCollection } from '@/types/collection'

function getCollectionLink(collection: BibleStudyCollection) {
    const params = new URLSearchParams({
        type: 'bible_studies',
        tag: collection.name
    })

    return `/?${params.toString()}`
}

function CollectionImage({ collection }: { collection: BibleStudyCollection }) {
    const [imageFailed, setImageFailed] = useState(false)

    if (!collection.featuredImage || imageFailed) {
        return (
            <div
                className="flex aspect-[523/200] items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white"
                role="img"
                aria-label={`${collection.name} collection`}
            >
                <BookOpenIcon className="size-12 opacity-80" strokeWidth={1.25} />
            </div>
        )
    }

    return (
        <img
            src={collection.featuredImage}
            alt={`${collection.name} collection`}
            className="aspect-[523/200] w-full object-cover"
            onError={() => setImageFailed(true)}
        />
    )
}

function CollectionCard({ collection }: { collection: BibleStudyCollection }) {
    return (
        <Card className="h-full gap-0 overflow-hidden py-0">
            <CollectionImage collection={collection} />
            <CardHeader className="flex-1 pt-5">
                <CardTitle className="text-xl">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-3 min-h-[3.75rem] leading-5">
                    {collection.description ||
                        'Browse the Bible studies in this collection.'}
                </CardDescription>
            </CardHeader>
            <CardFooter className="pb-5 pt-4">
                <Button asChild className="w-full">
                    <Link to={getCollectionLink(collection)}>
                        Browse collection
                        <ArrowRightIcon />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

function CollectionsLoading() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
                <Card key={item} className="gap-0 overflow-hidden py-0">
                    <Skeleton className="aspect-[523/200] w-full rounded-none" />
                    <CardContent className="space-y-3 py-5">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="mt-5 h-9 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<BibleStudyCollection[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    const retry = useCallback(() => {
        setReloadKey((current) => current + 1)
    }, [])

    useEffect(() => {
        const controller = new AbortController()

        ;(async () => {
            setLoading(true)
            setError(null)

            try {
                const nextCollections = await getCollections(controller.signal)
                setCollections(nextCollections)
            } catch (nextError) {
                if (controller.signal.aborted) return
                console.error('Failed to load Bible study collections', nextError)
                setError('We could not load the collections. Please try again.')
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        })()

        return () => controller.abort()
    }, [reloadKey])

    return (
        <main className="flex min-h-full flex-1 flex-col px-4 pb-12 pt-8 sm:px-8 lg:px-12">
            <header className="mx-auto mb-10 max-w-3xl text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Grow in the Word
                </p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Bible Study Collections
                </h1>
                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                    Choose a collection to explore related Bible studies, teaching,
                    and notes.
                </p>
            </header>

            <section className="mx-auto w-full max-w-7xl" aria-label="Bible study collections">
                {loading ? <CollectionsLoading /> : null}

                {!loading && error ? (
                    <Card className="mx-auto max-w-xl items-center text-center">
                        <CardHeader>
                            <CardTitle>Collections unavailable</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button type="button" variant="outline" onClick={retry}>
                                <RefreshCwIcon />
                                Try again
                            </Button>
                        </CardFooter>
                    </Card>
                ) : null}

                {!loading && !error && collections.length === 0 ? (
                    <Card className="mx-auto max-w-xl items-center text-center">
                        <CardHeader>
                            <CardTitle>No collections yet</CardTitle>
                            <CardDescription>
                                Bible study collections will appear here once they are
                                published.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : null}

                {!loading && !error && collections.length > 0 ? (
                    <Carousel
                        opts={{ align: 'start', loop: collections.length > 3 }}
                        className="px-10"
                    >
                        <CarouselContent>
                            {collections.map((collection) => (
                                <CarouselItem
                                    key={collection.id}
                                    className="basis-full md:basis-1/2 xl:basis-1/3"
                                >
                                    <CollectionCard collection={collection} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-0" />
                        <CarouselNext className="right-0" />
                    </Carousel>
                ) : null}
            </section>
        </main>
    )
}
