export type StudentBookContentImageDTO = {
  content_id: string,
  image: string,
  small_ver: string,
  order: number,
  original_image_id: string,
}

export const makeDTO = (
  content_id: string,
  image: string,
  small_ver: string,
  order: number,
  original_image_id: string
): StudentBookContentImageDTO => ({
  content_id,
  image,
  small_ver,
  order,
  original_image_id,
})

export default StudentBookContentImageDTO
