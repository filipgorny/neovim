import { AttachedExamType } from '../../attached-exams/attached-exam-types'

export type StudentAttachedExamDTO = {
  course_id: string,
  original_attached_id: string,
  exam_id: string,
  type: AttachedExamType,
}

export const makeDTO = (course_id: string, original_attached_id: string, type: AttachedExamType, exam_id: string): StudentAttachedExamDTO => ({
  course_id,
  original_attached_id,
  type,
  exam_id,
})

export default StudentAttachedExamDTO
