import api from "./api";

export const getVideos = async (book: string) => {
  return await api.get(`/videos?book=${book}`);
}