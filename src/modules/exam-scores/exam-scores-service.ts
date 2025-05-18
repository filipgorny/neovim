import { ExamScore } from '../../types/exam-score'
import { deleteMany, create } from './exam-scores-repository'

export const dropByExamId = async (exam_id: string) => (
  deleteMany({
    exam_id,
  })
)

export const createForExam = (exam_id: string) => async (
  score: number,
  percentile_rank: number,
  percentage: number
): Promise<ExamScore> => (
  create({
    exam_id,
    score,
    percentile_rank,
    percentage,
  })
)
