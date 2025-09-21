type SermonPDFFile = {
    fileUrl: string;
}

export type Sermon = {
  uri: string;
title: string;
  name: string;
  description: string;
  audioUrl: string
  sermonPdf?: SermonPDFFile;
  book: string;
  chapter: number;
  verses: string;
  videoLink: string;
  _id: string
  createdTime: string;
  updatedAt: string;
}

export class SermonDTO {
    uri: string;
    name: string;
    description: string;
    audioUrl: string
    sermonPdfUrl?: string;
    book: string;
    chapter: number;
    verses: string;
    videoLink: string;
    _id: string
    createdAt: string;
    updatedAt: string;
    private constructor(data: Sermon) {
        this.uri = data.title;
        this.name = data.name;
        this.description = data.description;
        this.audioUrl = data.audioUrl;
        this.sermonPdfUrl = data.sermonPdf?.fileUrl;
        this.book = data.book;
        this.chapter = data.chapter;
        this.verses = data.verses;
        this.videoLink = data.videoLink;
        this._id = data._id;
        this.createdAt = data.createdTime;
        this.updatedAt = data.updatedAt;
    }

    static from(data: Sermon): SermonDTO {
        return new SermonDTO(data);
    }
}
