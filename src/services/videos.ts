import api from './api'

export const getVideos = async (
    book: string | null,
    page: number | null,
    per_page: number | null,
    has_filters = 1
) => {
    return await api.get(
        `/videos?book=${book}&page=${page}&per_page=${per_page}&has_filters=${has_filters}`
    )
}

export const getFileNoteDownloadLink = async (videoId: string) => {
    return await api.get(`/download?file=${videoId}`)
}

export const getVimeoVideos = async (page: number, per_page: number) => {
    return await api.get(`/vimeo_videos?page=${page}&per_page=${per_page}`)
}
