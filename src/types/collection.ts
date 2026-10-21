import type { WixFile } from './sermons'

export type BibleStudyCollection = {
    id: string
    name: string
    description?: string
    /** Browser-ready URL resolved by the Wix backend. */
    featuredImage?: string | null
    /** Stored Wix media URI, retained for diagnostics and future edits. */
    featuredImagePath?: string | null
    createdAt?: string
    updatedAt?: string
}

export type CollectionsLibraryResponse = {
    page: number
    per_page: number
    total: number
    total_pages: number
    items: BibleStudyCollection[]
}

export type CollectionBibleStudy = {
    id: string
    collection: string
    book: string
    chapter: number
    verses: string
    scriptureReferences: Array<{
        book: string
        chapter: number
        verses: string
    }>
    name: string
    preacher?: string
    description: string
    videoLink: string
    audioUrl: string
    sermonPdf?: WixFile | null
    bulletinPdf?: WixFile | null
    createdAt?: string
    published?: boolean
    type: 'bible_studies'
    isBibleStudy: true
}

export type CollectionResponse = {
    item: BibleStudyCollection
    bibleStudies: CollectionBibleStudy[]
}
