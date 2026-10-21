import { BibleStudyCollection } from "@/types/collection"
import { BookOpenIcon } from "lucide-react"
import { useState } from "react"

type CollectionArtworkProps = {
    collection: BibleStudyCollection
    className?: string
    iconClassName?: string
    eager?: boolean
}

export function CollectionArtwork({
    collection,
    className = '',
    iconClassName = 'size-10',
    eager = false
}: CollectionArtworkProps) {
    const [imageFailed, setImageFailed] = useState(false)

    if (!collection.featuredImage || imageFailed) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-r from-background/65 via-transparent to-transparent text-primary ${className}`}
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
