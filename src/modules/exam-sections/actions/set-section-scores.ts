import { dropBySectionId as dropSectionScores } from '../../exam-section-scores/exam-section-scores-service'
import { dropByExamId as dropExamScores } from '../../exam-scores/exam-scores-service'
import { setSectionScores } from '../exam-section-service'
import { findOneOrFail } from '../exam-section-repository'
import { setScoreCalculationMethod } from '../../exams/exam-service'
import { ScoreCalculationMethod } from '../../exams/score-calculation-methods'

type Payload = {
  score_min: number,
  score_max: number,
}

export default async (id: string, payload: Payload) => {
  const section = await findOneOrFail({ id })

  await Promise.all([
    dropSectionScores(id),
    dropExamScores(section.exam_id),
    setScoreCalculationMethod(section.exam_id, ScoreCalculationMethod.normal),
  ])

  return setSectionScores(id, payload.score_min, payload.score_max)
}
