export enum BookErrataTypeEnum {
  text = 'text',
  image = 'image',
  cq = 'cq',
  flashcard = 'flashcard',
}

export type BookErrata = {
  id: string,
  book_id: string,
  chapter_id: string,
  subchapter_id: string,
  created_at?: string,
  created_by: string,
  content_delta_object: string,
  content_raw: string,
  content_html: string,
  type: BookErrataTypeEnum,
  book_content_id?: string,
}

export type BookErrataDTO = Omit<BookErrata, 'id'>
