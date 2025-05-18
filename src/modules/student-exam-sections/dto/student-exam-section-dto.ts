type StudentExamSectionDto = {
  student_exam_id: string,
  title: string,
  order: number,
  full_title: string
}

export const makeDTO = (student_exam_id: string, title: string, order: number, full_title: string): StudentExamSectionDto => ({
  student_exam_id,
  title,
  order,
  full_title,
})

export default StudentExamSectionDto
