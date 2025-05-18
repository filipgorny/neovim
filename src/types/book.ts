import { BookChapter } from './book-chapter'

export type Book = {
  id: string,
  title: string,
  created_at: string,
  tag: string,
  tag_colour: string,
  external_id: string,
  image_url: string | null,
  chapter_heading_image_url: string | null,
  is_test_bundle: boolean,
  is_archived?: boolean,
  deleted_at?: string,
  chapters?: BookChapter[],
  header_abbreviation: string,
  codename?: string,
  cover_image_url?: string | null,
}
