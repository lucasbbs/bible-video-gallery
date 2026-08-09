import api from './api'
import { buildEtagCacheKey, readEtagCache, writeEtagCache } from './etagCache'

/**
 * Get a list of videos.
 * @param book The book to filter by.
 * @param page The page number to retrieve.
 * @param per_page The number of videos per page.
 * @param preacher The preacher to filter by.
 * @param has_filters Whether to include filters in the request.
 * @param type The type of videos to retrieve.
 * @param dateFrom The start date for the date range filter.
 * @param dateTo The end date for the date range filter.
 * @param tags The tags to filter by.
 * @param testament The testament to filter by.
 * @returns A promise that resolves to the list of videos.
 */
export const getVideos = async (
    book: string | null,
    page: number | null,
    per_page: number | null,
    preacher: string | null,
    has_filters = 1,
    type: string | null = null,
    dateFrom: string | null = null,
    dateTo: string | null = null,
    tags: string[] | string = '',
    testament: 'old' | 'new' | null = null,
    chapter: number | null = null
) => {
    const params = new URLSearchParams()
    const tagValue = Array.isArray(tags) ? tags.join(',') : tags

    if (book) params.set('book', book)
    if (page !== null) params.set('page', String(page))
    if (per_page !== null) params.set('per_page', String(per_page))
    if (preacher) params.set('preacher', preacher)
    params.set('has_filters', String(has_filters))
    if (type) params.set('type', type)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (tagValue) params.set('tags', tagValue)
    if (testament) params.set('testament', testament)
    if (chapter !== null) params.set('chapter', String(chapter))

    const url = `/videos?${params.toString()}`

    const cacheKey = buildEtagCacheKey(api.defaults.baseURL, url)
    const cached = readEtagCache<unknown>(cacheKey)

    const headers: Record<string, string> = {}
    if (cached?.etag && cached?.data) headers['If-None-Match'] = cached.etag

    const res = await api.get(url, {
        headers,
        validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 304
    })

    const etag = res.headers?.etag

    if (res.status === 304 && cached?.data) {
        return { ...res, data: cached.data }
    }

    if (etag) {
        writeEtagCache(cacheKey, {
            etag,
            data: res.data,
            storedAt: Date.now()
        })
    }

    return res
}

/**
 * Get a link to download a file note.
 * @param videoId The ID of the video.
 * @returns A promise that resolves to the download link.
 */
export const getFileNoteDownloadLink = async (videoId: string) => {
    return await api.get(`/download?file=${videoId}`)
}

/**
 * Get a link to download a file note.
 * @param videoId The ID of the video.
 * @param signal An optional AbortSignal to cancel the request.
 * @returns A promise that resolves to the download link.
 */
export const getFileNoteViewLink = async (
    videoId: string,
    signal?: AbortSignal
) => {
    return await api.get(`/pdf_view?file=${videoId}`, { signal })
}



/**
 * Get a list of Vimeo videos.
 * @param page The page number to retrieve.
 * @param per_page The number of videos per page.
 * @returns A promise that resolves to the list of Vimeo videos.
 */
export const getVimeoVideos = async (page: number, per_page: number) => {
    return await api.get(`/vimeo_videos?page=${page}&per_page=${per_page}`)
}

/**
 * Get a list of all the chapters we have sermons for.
 * @param book The book to retrieve chapters for.
 * @returns A promise that resolves to the list of chapters.
 */
export const getBibleChapters = async (book: string) => {
    return await api.get<{ items: { chapterNumber: number }[] }>(`/bible_chapters?book=${book}`)
}