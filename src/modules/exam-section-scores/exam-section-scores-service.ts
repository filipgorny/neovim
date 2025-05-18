import { ExamSectionScore } from '../../types/exam-section-score'
import { deleteMany, create } from './exam-section-scores-repository'

export const dropBySectionId = async (section_id: string) => (
  deleteMany({
    section_id,
  })
)

export const createForSection = (section_id: string) => async (
  score: number,
  correct_answers: number,
  percentile_rank: number,
  percentage: number
): Promise<ExamSectionScore> => (
  create({
    section_id,
    score,
    correct_answers,
    percentile_rank,
    percentage,
  })
)
