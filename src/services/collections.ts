import api from './api'
import type {
    BibleStudyCollection,
    CollectionResponse,
    CollectionsLibraryResponse
} from '@/types/collection'

const COLLECTIONS_PAGE_SIZE = 100

export type CollectionFilters = {
    book?: string | null
    chapter?: number | null
    testament?: 'old' | 'new' | null
    preacher?: string | null
    dateFrom?: string | null
    dateTo?: string | null
}

export async function getCollections(
    filters: CollectionFilters = {},
    signal?: AbortSignal
) {
    const collections: BibleStudyCollection[] = []
    let page = 1
    let totalPages = 1

    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(COLLECTIONS_PAGE_SIZE))
    if (filters.book) params.set('book', filters.book)
    if (filters.chapter) params.set('chapter', String(filters.chapter))
    if (filters.testament) params.set('testament', filters.testament)
    if (filters.preacher) params.set('preacher', filters.preacher)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    const url = `/tags?${params.toString()}`

    do {
        const { data } = await api.get<CollectionsLibraryResponse>(url, {
            params: {
                page,
                per_page: COLLECTIONS_PAGE_SIZE
            },
            signal
        })

        collections.push(...(data.items ?? []))
        totalPages = Math.max(1, data.total_pages ?? 1)
        page += 1
    } while (page <= totalPages)

    return collections
}

export const getCollectionById = async (id: string, signal?: AbortSignal) => {
    const { data } = await api.get<CollectionResponse>(`/tag_by_id/${id}`, { signal })
    return data
}
