import * as R from 'ramda'
import { stitchArraysByProp } from '../../utils/array/stitch-arrays-by-prop'
import { embedKeyAsProp } from '../../utils/object/embed-key-as-prop'
import { wrapProps } from '../../utils/object/wrap-props'
import { flattenQuestions } from '../student-exams/flatten-questions'

const transformSectionPayload = resourceType => R.map(
  R.pipe(
    R.juxt([
      R.pick(['order', 'scaled_score']),
      R.pipe(
        R.prop(resourceType),
        // @ts-ignore
        R.map(
          R.pipe(
            R.pick(['order', 'timers'])
          )
        ),
        R.objOf(resourceType)
      )
    ]),
    // @ts-ignore
    R.mergeAll
  )
)

const stitchQuestionsBySection = questionTimers => R.map(
  R.pipe(
    R.juxt([
      R.identity,
      R.pipe(
        R.prop('questions'),
        section => stitchArraysByProp(
          'original_exam_question_id',
          section,
          questionTimers
        ),
        R.objOf('questions')
      )
    ]),
    // @ts-ignore
    R.mergeAll
  )
)

const stitchPassagesBySection = questionTimers => R.map(
  R.pipe(
    R.juxt([
      R.identity,
      R.pipe(
        R.prop('passages'),
        section => stitchArraysByProp(
          'original_exam_passage_id',
          section,
          questionTimers
        ),
        R.objOf('passages')
      )
    ]),
    // @ts-ignore
    R.mergeAll
  )
)

const filterQuestionsOnly = R.filter(
  R.propEq('resource_type', 'question')
)

const filterPassagesOnly = R.filter(
  R.propEq('resource_type', 'passage')
)

const extractQuestionTimers = R.pipe(
  R.prop('timers'),
  JSON.parse,
  embedKeyAsProp('original_exam_question_id'),
  filterQuestionsOnly,
  R.map(
    wrapProps('timers', ['reading', 'working', 'checking'])
  )
)

const extractPassageTimers = R.pipe(
  R.prop('timers'),
  JSON.parse,
  embedKeyAsProp('original_exam_passage_id'),
  filterPassagesOnly,
  R.map(
    wrapProps('timers', ['reading', 'working', 'checking'])
  )
)

export const transformExamIntoSectionPayload = exam => {
  const questionTimers = extractQuestionTimers(exam)

  const questions = R.pipe(
    flattenQuestions,
    R.map(
      R.pick(['order', 'questions', 'id'])
    ),
    stitchQuestionsBySection(questionTimers)
  )(exam)

  const scores = R.pipe(
    R.path(['scores', 'sections'])
  )(exam)

  const questionsWithScores = stitchArraysByProp(
    'id',
    questions,
    scores
  )

  return transformSectionPayload('questions')(questionsWithScores)
}

const sortByOrder = data => (
  R.sortBy(
    R.prop('order')
  )(data)
)

export const transformExamIntoSectionPayloadByPassages = exam => {
  const passageTimers = extractPassageTimers(exam)

  const passages = R.pipe(
    R.prop('sections'),
    sortByOrder,
    R.map(
      R.pick(['order', 'passages', 'id'])
    ),
    stitchPassagesBySection(passageTimers)
  )(exam)

  const scores = R.pipe(
    R.path(['scores', 'sections'])
  )(exam)

  const passagesWithScores = stitchArraysByProp(
    'id',
    passages,
    scores
  )

  return transformSectionPayload('passages')(passagesWithScores)
}
