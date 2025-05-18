import { Book } from '../../../types/book'

export type BookDTO = Omit<Book, 'id' | 'created_at' | 'deleted_at' | 'chapters'>

export const makeDTO = (title: string, tag: string, tag_colour: string, external_id: string, image_url: string | null, chapter_heading_image_url: string | null, cover_image_url: string | null, is_test_bundle: boolean, header_abbreviation: string, is_archived?: boolean, codename?: string): BookDTO => ({
  title,
  tag,
  tag_colour,
  external_id,
  image_url,
  chapter_heading_image_url,
  is_test_bundle,
  header_abbreviation,
  is_archived,
  codename,
  cover_image_url,
})

export default BookDTO
