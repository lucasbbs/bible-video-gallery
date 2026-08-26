import api from './api'
import type {
    BibleStudyCollection,
    CollectionsResponse
} from '@/types/collection'

const COLLECTIONS_PAGE_SIZE = 100

export async function getCollections(signal?: AbortSignal) {
    const collections: BibleStudyCollection[] = []
    let page = 1
    let totalPages = 1

    do {
        const { data } = await api.get<CollectionsResponse>('/tags', {
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
