import api from "./api";

export const getVideos = async (book: string) => {
  return await api.get(`/videos?book=${book}`);
}

export const getVimeoVideos = async (page: number, per_page: number) => {
  return await api.get(`/vimeo_videos?page=${page}&per_page=${per_page}`);
}