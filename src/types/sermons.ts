export type WixFile = {
    fileUrl: string
    internalName?: string
}

export type SermonType = 'sermons' | 'bible_studies'

export type Sermon = {
    uri: string
    title: string
    name: string
    description: string
    audioUrl: string
    sermonPdf?: WixFile | null
    bulletinPdf?: WixFile | null
    book: string
    chapter: number
    verses: string
    preacher: string
    videoLink: string
    type: SermonType
    _id: string
    createdTime?: string
    created_time?: string
    updatedAt: string
    tags: Tag[]
}

export type Tag = {
    _id: string
    title: string
}