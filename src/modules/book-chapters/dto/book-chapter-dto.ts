export type BookChapterDTO = {
  title: string,
  order: number,
  book_id: string,
  image_tab_title?: string
}

export const makeDTO = (title: string, order: number, book_id: string, image_tab_title?: string): BookChapterDTO => ({
  title,
  order,
  book_id,
  image_tab_title,
})

export default BookChapterDTO
