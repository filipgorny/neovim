export type StudentBookChapterDTO = {
  title: string,
  book_id: string,
  order: number,
  original_chapter_id: string,
  image_tab_title?: string,
}

export const makeDTO = (title: string, book_id: string, order: number, original_chapter_id: string, image_tab_title: string): StudentBookChapterDTO => ({
  title,
  book_id,
  order,
  original_chapter_id,
  image_tab_title,
})

export default StudentBookChapterDTO
