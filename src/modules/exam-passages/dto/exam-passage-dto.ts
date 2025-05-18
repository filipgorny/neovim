type ExamPassageDto = {
  section_id: string,
  content: string,
  order: number,
  is_false_passage: boolean,
  word_count: number
}

export const makeDTO = (section_id: string, content: string, order: number, is_false_passage: boolean, word_count: number): ExamPassageDto => ({
  section_id,
  content,
  order,
  is_false_passage,
  word_count,
})

export default ExamPassageDto
