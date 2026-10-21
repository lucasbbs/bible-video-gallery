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

export type CollectionsResponse = {
    page: number
    per_page: number
    total: number
    total_pages: number
    items: BibleStudyCollection[]
}
