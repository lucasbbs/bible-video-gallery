export type Speaker = {
    id: string
    name: string
    type: 'bible_studies' | 'sermons'
    createdAt: string
}

export type SpeakersResponse = {
  items: Speaker[]
}

export enum SPEAKER_TYPE {
  BIBLE_STUDIES = 'bible_studies',
  SERMONS = 'sermons',
  ALL = 'all'
}
