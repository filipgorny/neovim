type StudentExamPassageDto = {
  student_section_id: string,
  content: string,
  order: number,
  original_exam_passage_id: string,
  is_false_passage: boolean
}

export const makeDTO = (student_section_id: string, content: string, order: number, original_exam_passage_id: string, is_false_passage: boolean): StudentExamPassageDto => ({
  student_section_id,
  content,
  order,
  original_exam_passage_id,
  is_false_passage,
})

export default StudentExamPassageDto
