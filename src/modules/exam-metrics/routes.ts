import { route, customParam, user } from '../../../utils/route/attach-route'
import { authStudent } from '../../middleware/authorize'
import getBySectionScore from './actions/get-by-section-score'
import getWithoutScores from './actions/get-without-scores'
import getForPassagesBySectionScore from './actions/get-for-passages-by-section-score'
import getForPassagesWithoutScores from './actions/get-for-passages-without-scores'
import getForSingleQuestion from './actions/get-for-single-question'
import getMetricsForPassagesWithoutScores from './actions/get-metrics-for-passages-without-scores'
import getMetricsForQuestionsWithoutScores from './actions/get-metrics-for-questions-without-scores'
import getMetricsForQuestionsWithScores from './actions/get-metrics-for-questions-with-scores'
import getMetricsForPassagesWithScores from './actions/get-metrics-for-passages-with-scores'

export default app => {
  app.get(
    '/exam-metrics/exam-type/:exam_type_id/section-order/:section_order/score/:section_score',
    authStudent,
    route(
      getBySectionScore,
      [
        customParam('exam_type_id'),
        customParam('section_order'),
        customParam('section_score'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam-type/:exam_type_id/section-order/:section_order',
    authStudent,
    route(
      getWithoutScores,
      [
        customParam('exam_type_id'),
        customParam('section_order'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam-type/:exam_type_id/section-order/:section_order/score/:section_score/passages',
    authStudent,
    route(
      getForPassagesBySectionScore,
      [
        customParam('exam_type_id'),
        customParam('section_order'),
        customParam('section_score'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam-type/:exam_type_id/section-order/:section_order/passages',
    authStudent,
    route(
      getForPassagesWithoutScores,
      [
        customParam('exam_type_id'),
        customParam('section_order'),
      ]
    )
  )

  app.get(
    '/exam-metrics/question-id/:question_id',
    authStudent,
    route(
      getForSingleQuestion,
      [
        user,
        customParam('question_id'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam/:exam_id/section-order/:section_order/passages',
    authStudent,
    route(
      getMetricsForPassagesWithoutScores,
      [
        customParam('exam_id'),
        customParam('section_order'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam/:exam_id/section-order/:section_order/questions',
    authStudent,
    route(
      getMetricsForQuestionsWithoutScores,
      [
        customParam('exam_id'),
        customParam('section_order'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam/:exam_id/section-order/:section_order/questions/score/:section_score',
    authStudent,
    route(
      getMetricsForQuestionsWithScores,
      [
        customParam('exam_id'),
        customParam('section_order'),
        customParam('section_score'),
      ]
    )
  )

  app.get(
    '/exam-metrics/exam/:exam_id/section-order/:section_order/passages/score/:section_score',
    authStudent,
    route(
      getMetricsForPassagesWithScores,
      [
        customParam('exam_id'),
        customParam('section_order'),
        customParam('section_score'),
      ]
    )
  )
}
