import { customException, throwException } from '../../../utils/error/error-factory'
import { create, findOne } from './exam-score-stats-repository'

export const initializeStats = async (exam_id: string, min_score: number, max_score: number) => {
  const examScoreStat = await findOne({ exam_id })
  if (examScoreStat) {
    return
  }

  const result = []
  for (let i = min_score; i <= max_score; i++) {
    const examScoreStat = await create({
      exam_id,
      score: i,
      student_count: 0,
    })
    result.push(examScoreStat)
  }
  return result
}
