
export type BookChapterImageDTO = {
  chapter_id: string,
  order: number,
  image: string,
  small_ver?: string,
}

export const makeDTO = (chapter_id: string, order: number, image: string, small_ver?: string): BookChapterImageDTO => ({
  chapter_id,
  order,
  image,
  small_ver,
})

export default BookChapterImageDTO
