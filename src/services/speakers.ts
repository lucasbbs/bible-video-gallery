import { SpeakerDTO } from "@/dtos/speaker.dto"
import api from "./api"
import { SpeakersResponse } from "@/types/speaker"

export const getSpeakers = async (type: 'bible_studies' | 'sermons') : Promise<SpeakerDTO[]> => {
  const { data } = await api.get<SpeakersResponse>('/speakers', {
    params: { type },
  })
  return Promise.all(data.items.map(SpeakerDTO.fromAPI))
}
