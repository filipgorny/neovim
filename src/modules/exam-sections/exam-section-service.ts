import R from 'ramda'
import { countQuestions, create, findOneOrFail, patch } from './exam-section-repository'
import { makeDTO } from './dto/exam-section-dto'
import mapP from '../../../utils/function/mapp'
import concatPath from '../../../utils/function/concatpath'
import { countCorrectlyAnsweredQuestions } from '../student-exam-sections/student-exam-section-repository'
import { findBySectionId as findExamSectionScoresBySectionId } from '../exam-section-scores/exam-section-scores-repository'
import { ExamSectionScoreDiagram } from './exam-section-score-diagram'
import { customException, throwException } from '../../../utils/error/error-factory'
import { getMinMaxScoresFromType } from '../../../services/student-exam-scores/get-min-max-sxores'
import { find as findSectionScoreMap } from '../exam-section-score-map/exam-section-score-map-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { int } from '@desmart/js-utils'

export const cretateExamSections = async (exam_id: string, titles: string[], section_full_titles: string[], examType) => (
  R.addIndex(mapP)(
    async (title: string, index: number) => {
      const scores = getMinMaxScoresFromType(examType, index + 1)

      return create(
        makeDTO(exam_id, title, index + 1, section_full_titles[index], scores.min, scores.max)
      )
    }
  )(titles)
)

export const setSectionScores = async (id, score_min, score_max) => (
  patch(id, {
    score_min,
    score_max,
  })
)

const getSectionScoreMap = async (section_id: string) => (
  R.pipeWith(R.andThen)([
    async (section_id: string) => findSectionScoreMap({ limit: { page: 1, take: 1000 }, order: { by: 'correct_answers', dir: 'asc' } }, { section_id }),
    R.prop('data'),
    collectionToJson,
  ])(section_id)
)

const buildScoreData = (scoreMin, scoreMax) => R.pipe(
  R.groupBy(R.prop('score')),
  R.mergeRight(getScores(scoreMin, scoreMax)),
  R.values,
  R.map(
    R.pluck('amount_correct')
  )
)

const getScores = (scoreMin, scoreMax) => {
  const scores = {}

  for (let i = scoreMin; i <= scoreMax; i += 1) {
    scores[i] = []
  }

  return scores
}

export const getStudentExamSectionsStatsData = async (id: string) => {
  const section = await findOneOrFail({ id }, ['exam.completedStudentExams.sections'])

  const scoreMin = R.prop('score_min', section)
  const scoreMax = R.prop('score_max', section)

  const scoreMap = await getSectionScoreMap(id)

  const percentileRanking = R.pipe(
    R.pluck('percentile_rank'),
    R.map(int)
  )(scoreMap)

  return new ExamSectionScoreDiagram(scoreMin, scoreMax, buildScoreData(scoreMin, scoreMax)(scoreMap), percentileRanking).getDataForGraphs()
}
