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
    dateTo: string | null = null
) => {
    const url = `/videos?book=${book}&page=${page}&per_page=${per_page}&preacher=${preacher}&has_filters=${has_filters}&type=${type}&dateFrom=${dateFrom}&dateTo=${dateTo}`

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
