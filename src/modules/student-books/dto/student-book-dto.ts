import { Book } from '../../../types/book'

export type StudentBookDTO = Omit<Book, 'id' | 'created_at' | 'external_id' | 'is_archived' | 'deleted_at' | 'chapters'> & {
  course_id: string,
  book_id: string,
  student_id: string,
  external_created_at: Date,
  last_chapter?: string,
  last_part?: string,
  last_student_book_subchapter_id_seen?: string,
  is_free_trial: boolean,
  preview_state?: string,
  header_abbreviation?: string,
}

export const makeDTO = (
  title: string,
  course_id: string,
  book_id: string,
  student_id: string,
  tag: string,
  tag_colour: string,
  image_url: string | null,
  chapter_heading_image_url: string | null,
  external_created_at: Date,
  is_free_trial: boolean,
  is_test_bundle: boolean,
  header_abbreviation: string
): StudentBookDTO => ({
  title,
  course_id,
  book_id,
  student_id,
  tag,
  tag_colour,
  image_url,
  chapter_heading_image_url,
  external_created_at,
  is_free_trial,
  is_test_bundle,
  header_abbreviation,
})

export default StudentBookDTO
