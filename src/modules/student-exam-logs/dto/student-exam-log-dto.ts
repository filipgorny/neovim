type StudentExamLogDTO = {
  exam_id: string,
  admin_id: string,
  type: string,
  content?: string
}

export const makeDTO = (exam_id: string, admin_id: string, type: string, content?: string) => ({
  exam_id,
  admin_id,
  type,
  content,
})

export default StudentExamLogDTO
