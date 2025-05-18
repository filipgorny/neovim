import * as R from 'ramda'
import { createNewStudentExamScore, fetchStudentExamScores, updatePTS } from './student-exam-scores-repository'
import { ExamScoreDto } from './dto/student-exam-score-dto'

const patchScoresData = (isTsAttachedToPts, ptsArray) => (scores): object[] => R.pipe(
  JSON.parse,
  R.map(
    (score: ExamScoreDto): ExamScoreDto => ({
      ...score,
      pts: ptsArray[score.order],
      target_score: isTsAttachedToPts ? ptsArray[score.order] : score.target_score,
    })
  )
  // @ts-ignore
)(scores)

export const setPTSBySections = (examTypeId, studentId) => async (ptsArray: number[]) => {
  const currentScores = await fetchStudentExamScores(studentId, examTypeId)

  if (currentScores) {
    const completePTS = [R.sum(ptsArray), ...ptsArray]
    const scores: object[] = patchScoresData(currentScores.is_ts_attached_to_pts, completePTS)(currentScores.scores)
    await updatePTS(currentScores.id)(scores)
  } else {
    await createNewStudentExamScore(examTypeId, studentId, ptsArray)
  }
}
