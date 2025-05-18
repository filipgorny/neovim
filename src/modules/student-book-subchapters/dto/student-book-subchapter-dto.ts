export type StudentBookSubchapterDTO = {
  title: string,
  chapter_id: string,
  order: number,
  part: number,
  original_subchapter_id: string,
}

export const makeDTO = (title: string, chapter_id: string, order: number, part: number, original_subchapter_id: string): StudentBookSubchapterDTO => ({
  title,
  chapter_id,
  order,
  part,
  original_subchapter_id,
})

export default StudentBookSubchapterDTO
