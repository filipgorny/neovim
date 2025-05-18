import { makeDTO } from './dto/exam-intro-page-dto'
import { create } from './exam-intro-page-repository'

export const createExamIntroPage = async (
  raw: string,
  delta_object: object,
  exam_type_id: string,
  order: number
) => (
  create(
    makeDTO(raw, JSON.stringify(delta_object), exam_type_id, order)
  )
)
