type SermonPDFFile = {
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
    sermonPdf?: SermonPDFFile | null
    bulletinPdf?: SermonPDFFile | null
    book: string
    chapter: number
    verses: string
    videoLink: string
    type: SermonType
    _id: string
    createdTime?: string
    created_time?: string
    updatedAt: string
    tags: string[]
}

export class SermonDTO {
    uri: string
    name: string
    description: string
    audioUrl: string
    sermonPdfUrl?: string
    sermonBulletinUrl?: string
    book: string
    chapter: number
    verses: string
    videoLink: string
    type: SermonType
    tags: string[]
    _id: string
    createdAt: string
    updatedAt: string
    private constructor(data: Sermon) {
        this.uri = data.title
        this.name = data.name
        this.description = data.description
        this.audioUrl = data.audioUrl
        this.sermonPdfUrl = data.sermonPdf?.fileUrl
        this.sermonBulletinUrl = data.bulletinPdf?.fileUrl
        this.book = data.book
        this.chapter = data.chapter
        this.verses = data.verses
        this.videoLink = data.videoLink
        this.type = data.type
        this._id = data._id
        this.createdAt = data.createdTime || data.created_time || ''
        this.updatedAt = data.updatedAt
        this.tags = data.tags
    }

    static from(data: Sermon): SermonDTO {
        return new SermonDTO(data)
    }
}
