import api from './api'
import { buildEtagCacheKey, readEtagCache, writeEtagCache } from './etagCache'

export const getVideos = async (
    book: string | null,
    page: number | null,
    per_page: number | null,
    preacher: string | null,
    has_filters = 1,
    type: string | null = null,
    dateFrom: string | null = null,
    dateTo: string | null = null,
    tags: string[] | string = ''
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

export const getFileNoteDownloadLink = async (videoId: string) => {
    return await api.get(`/download?file=${videoId}`)
}

export const getFileNoteViewLink = async (
    videoId: string,
    signal?: AbortSignal
) => {
    return await api.get(`/pdf_view?file=${videoId}`, { signal })
}

export const getVimeoVideos = async (page: number, per_page: number) => {
    return await api.get(`/vimeo_videos?page=${page}&per_page=${per_page}`)
}
