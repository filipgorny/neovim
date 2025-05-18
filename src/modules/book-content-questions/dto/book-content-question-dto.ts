export type BookContentQuestionDTO = {
  subchapter_order: number,
  subchapter_id: string,
  order: number,
  question_id: string,
  content_id: string,
}

export const makeDTO = (order: number, question_id: string, content_id: string, subchapter_order: number, subchapter_id: string): BookContentQuestionDTO => ({
  order,
  question_id,
  content_id,
  subchapter_order,
  subchapter_id,
})

export default BookContentQuestionDTO
