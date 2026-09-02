import { useCallback, useEffect, useState } from 'react'
import {
    BookOpenIcon,
    ChevronRightIcon,
    RefreshCwIcon
} from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { getCollections } from '@/services/collections'
import type { BibleStudyCollection } from '@/types/collection'

const DEFAULT_DESCRIPTION = 'Browse the Bible studies in this collection.'

function getCollectionLink(collection: BibleStudyCollection) {
    const params = new URLSearchParams({
        type: 'bible_studies',
        tag: collection.name
    })

    return `/?${params.toString()}`
}

function getCollectionDescription(collection: BibleStudyCollection) {
    return collection.description?.trim() || DEFAULT_DESCRIPTION
}

type CollectionArtworkProps = {
    collection: BibleStudyCollection
    className?: string
    iconClassName?: string
    eager?: boolean
}

function CollectionArtwork({
    collection,
    className = '',
    iconClassName = 'size-10',
    eager = false
}: CollectionArtworkProps) {
    const [imageFailed, setImageFailed] = useState(false)

    if (!collection.featuredImage || imageFailed) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground ${className}`}
                aria-hidden="true"
            >
                <BookOpenIcon className={iconClassName} strokeWidth={1.25} />
            </div>
        )
    }

    return (
        <img
            src={collection.featuredImage}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            className={className}
            onError={() => setImageFailed(true)}
        />
    )
}

type FeaturedCollectionsProps = {
    collections: BibleStudyCollection[]
    activeIndex: number
    onActiveChange: (index: number) => void
}

function FeaturedCollections({
    collections,
    activeIndex,
    onActiveChange
}: FeaturedCollectionsProps) {
    const [api, setApi] = useState<CarouselApi>()

    useEffect(() => {
        if (!api) return

        const updateActiveCollection = () => {
            onActiveChange(api.selectedScrollSnap())
        }

        updateActiveCollection()
        api.on('select', updateActiveCollection)
        api.on('reInit', updateActiveCollection)

        return () => {
            api.off('select', updateActiveCollection)
            api.off('reInit', updateActiveCollection)
        }
    }, [api, onActiveChange])

    return (
        <div>
            <Carousel
                setApi={setApi}
                opts={{ align: 'center', containScroll: false }}
                aria-label="Featured Bible study collections"
            >
                <CarouselContent className="-ml-4 py-4">
                    {collections.map((collection, index) => {
                        const isActive = index === activeIndex

                        return (
                            <CarouselItem
                                key={collection.id}
                                className="basis-[92%] pl-4 sm:basis-[86%] md:basis-[80%] lg:basis-[74%] xl:basis-[68%]"
                            >
                                <Link
                                    to={getCollectionLink(collection)}
                                    aria-current={isActive ? 'true' : undefined}
                                    className="block rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
                                >
                                    <div
                                        className={`relative aspect-[523/200] w-full overflow-hidden rounded-2xl border bg-muted transition-[filter,transform,opacity,box-shadow] duration-500 ease-out motion-reduce:transition-none ${
                                            isActive
                                                ? 'scale-100 opacity-100 shadow-2xl shadow-foreground/15 grayscale-0'
                                                : 'scale-[0.94] opacity-50 shadow-sm grayscale'
                                        }`}
                                    >
                                        <CollectionArtwork
                                            collection={collection}
                                            eager={index === 0}
                                            className="absolute inset-0 h-full w-full object-cover"
                                            iconClassName="size-12 opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
                                                Bible study collection
                                            </p>
                                            <h2 className="mt-1 line-clamp-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                                                {collection.name}
                                            </h2>
                                        </div>
                                    </div>
                                </Link>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>

            {collections.length > 1 ? (
                <div
                    className="mt-1 flex items-center justify-center gap-1.5"
                    aria-label="Choose a featured collection"
                >
                    {collections.map((collection, index) => {
                        const isActive = index === activeIndex

                        return (
                            <button
                                key={collection.id}
                                type="button"
                                aria-label={`Show ${collection.name}`}
                                aria-pressed={isActive}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                                    isActive
                                        ? 'w-8 bg-primary'
                                        : 'w-2 bg-border hover:bg-muted-foreground/50'
                                }`}
                            />
                        )
                    })}
                </div>
            ) : null}
        </div>
    )
}

function CollectionsLoading() {
    return (
        <div aria-label="Loading Bible study collections" aria-busy="true">
            <div className="flex items-center justify-center gap-4 overflow-hidden py-4">
                <Skeleton className="hidden aspect-[523/200] basis-[28%] shrink-0 rounded-2xl opacity-50 sm:block" />
                <Skeleton className="aspect-[523/200] basis-[92%] shrink-0 rounded-2xl sm:basis-[86%] md:basis-[80%] lg:basis-[74%] xl:basis-[68%]" />
                <Skeleton className="hidden aspect-[523/200] basis-[28%] shrink-0 rounded-2xl opacity-50 sm:block" />
            </div>
            <div className="mt-2 flex justify-center gap-1.5">
                <Skeleton className="h-1.5 w-8 rounded-full" />
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="size-1.5 rounded-full" />
            </div>
            <div className="mx-auto mt-8 rounded-2xl border bg-muted/30 p-5 sm:p-6">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-3 h-7 w-1/2" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <Skeleton className="mt-5 h-10 w-40" />
            </div>
        </div>
    )
}

// function ActiveCollection({ collection }: { collection: BibleStudyCollection }) {
//     return (
//         <section
//             className="mx-auto mt-8"
//             aria-label={`About ${collection.name}`}
//             aria-live="polite"
//         >
//             <div className="rounded-2xl border bg-muted/35 p-5 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-6">
//                 <div className="min-w-0">
//                     <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
//                         In focus
//                     </p>
//                     <h2 className="mt-2 text-2xl font-semibold tracking-tight">
//                         {collection.name}
//                     </h2>
//                     <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
//                         {getCollectionDescription(collection)}
//                     </p>
//                 </div>
//                 <Button asChild className="mt-5 w-full sm:mt-0 sm:w-auto">
//                     <Link to={getCollectionLink(collection)}>
//                         Browse collection
//                         <ArrowRightIcon />
//                     </Link>
//                 </Button>
//             </div>
//         </section>
//     )
// }

function AllCollections({ collections }: { collections: BibleStudyCollection[] }) {
    return (
        <section className="mx-auto mt-12" aria-labelledby="all-collections-title">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 id="all-collections-title" className="text-xl font-semibold">
                        All collections
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {collections.length}{' '}
                        {collections.length === 1 ? 'collection' : 'collections'} to explore
                    </p>
                </div>
            </div>

            <ul className="mt-4 divide-y divide-border border-y">
                {collections.map((collection) => (
                    <li key={collection.id}>
                        <Link
                            to={getCollectionLink(collection)}
                            className="group flex items-center gap-3 rounded-lg px-1 py-4 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-4 focus-visible:ring-ring/50 sm:gap-4 sm:px-3"
                        >
                            <div className="aspect-[523/200] w-28 shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-36 lg:w-40">
                                <CollectionArtwork
                                    collection={collection}
                                    className="h-full w-full object-cover"
                                    iconClassName="size-6 opacity-80"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold sm:text-base">
                                    {collection.name}
                                </h3>
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                                    {getCollectionDescription(collection)}
                                </p>
                            </div>
                            <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<BibleStudyCollection[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
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
                setActiveIndex(0)
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

    const activeCollection = collections[activeIndex] ?? collections[0]

    return (
        <main className="flex min-h-full flex-1 flex-col overflow-hidden px-4 pb-16 pt-8 sm:px-8 lg:px-12">
            <header className="mx-auto w-full lg:min-w-5xl">
                <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl text-center">
                    Bible Study Collections
                </h1>
            </header>

            <section className="mx-auto mt-7 w-full" aria-label="Bible study collections">
                {loading ? <CollectionsLoading /> : null}

                {!loading && error ? (
                    <Card className="mx-auto items-center text-center">
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
                    <Card className="mx-auto items-center text-center">
                        <CardHeader>
                            <CardTitle>No collections yet</CardTitle>
                            <CardDescription>
                                Bible study collections will appear here once they are
                                published.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : null}

                {!loading && !error && activeCollection ? (
                    <>
                        <FeaturedCollections
                            collections={collections}
                            activeIndex={activeIndex}
                            onActiveChange={setActiveIndex}
                        />
                        {/* <ActiveCollection collection={activeCollection} /> */}
                        <AllCollections collections={collections} />
                    </>
                ) : null}
            </section>
        </main>
    )
}
