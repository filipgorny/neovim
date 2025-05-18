export type BookSubchapterDTO = {
  title: string,
  order: number,
  chapter_id: string,
  part: number
}

export const makeDTO = (title: string, order: number, chapter_id: string, part: number): BookSubchapterDTO => ({
  title,
  order,
  chapter_id,
  part,
})

export default BookSubchapterDTO
