
export type BookContentImageDTO = {
  content_id: string,
  order: number,
  image: string,
  small_ver?: string,
}

export const makeDTO = (content_id: string, order: number, image: string, small_ver?: string): BookContentImageDTO => ({
  content_id,
  order,
  image,
  small_ver,
})

export default BookContentImageDTO
