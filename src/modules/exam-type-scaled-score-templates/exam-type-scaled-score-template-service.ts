import { create } from './exam-type-scaled-score-template-repository'

export const createExamTypeScaledScoreTemplate = async (template_id: string, exam_type_id: string, order: number) => (
  create({
    template_id,
    exam_type_id,
    order,
  })
)
