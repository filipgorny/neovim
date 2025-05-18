import { AttachedExamType } from '../attached-exam-types'

export type AttachedExamDTO = {
  type: AttachedExamType,
  exam_id: string,
  attached_id: string,
  is_free_trial,
}

export const makeDTO = (type: AttachedExamType, exam_id: string, attached_id: string, is_free_trial: boolean): AttachedExamDTO => ({
  type,
  exam_id,
  attached_id,
  is_free_trial,
})

export default AttachedExamDTO
