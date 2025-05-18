import {
  deleteByExamTypeId,
  create
} from './percentile-rank-repository'

export const dropPercentileRanks = async (exam_type_id) => (
  deleteByExamTypeId(exam_type_id)
)

export const createPercentileRank = async (exam_type_id, section_order, correct_answer_amount, percentile_rank) => (
  create({
    exam_type_id,
    section_order,
    correct_answer_amount,
    percentile_rank,
  })
)
