import * as R from 'ramda'
import ordinal from 'ordinal'
import { fetchRandomStudentExam, findExamsForGraph } from '../../src/modules/student-exams/student-exam-repository'
import { getSetting } from '../../src/modules/settings/settings-service'
import asAsync from '../../utils/function/as-async'
import { fetchStudentExamScores } from '../../src/modules/student-exam-scores/student-exam-scores-repository'
import { calculatePTS } from '../../src/modules/student-exams/student-exam-service'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../src/modules/student-exams/student-exam-statuses'
import { getMinScoresFromType } from '../student-exam-scores/get-min-max-sxores'
import { Settings } from '../../src/modules/settings/settings'

const getCurrentStudentScores = async (studentId, examTypeId) => R.pipeWith(R.andThen)([
  async () => fetchStudentExamScores(studentId, examTypeId),
  R.prop('scores'),
  JSON.parse,
])(true)

const extractScaledScore = sectionOrder => R.pipe(
  R.prop('scores'),
  JSON.parse,
  R.prop('sections'),
  // @ts-ignore
  R.applySpec({
    section_id: R.pipe(
      R.find(R.propEq('order', sectionOrder)),
      // @ts-ignore
      R.prop('id')
    ),
    scaled_score: R.pipe(
      R.find(R.propEq('order', sectionOrder)),
      // @ts-ignore
      R.prop('scaled_score')
    ),
  })
)

const extractScoreData = (sectionOrder, isExamMocked = false) => R.pipe(
  R.map(
    R.pipe(
      R.juxt([
        extractScaledScore(sectionOrder),
        R.pick(['is_excluded_from_pts', 'id', 'completed_as', 'title', 'is_mocked']),
      ]),
      R.mergeAll
    )
  ),
  R.map(
    exam => R.mergeLeft({
      completed: true,
      // @ts-ignore
      ...exam.is_mocked && { completed: false, section_id: undefined, id: null, is_mocked: undefined },
    })(exam)
  )
)

const addTargetScore = (studentScores, sectionIndex) => exams => R.append({
  scaled_score: studentScores[sectionIndex].target_score,
  pts: studentScores[sectionIndex].pts,
  target_score: studentScores[sectionIndex].target_score,
  is_excluded_from_pts: false,
  id: null,
  completed_as: null,
  title: 'Target',
  completed: false,
})(exams)

const emptyExam = (fakeScore, examNumber) => (
  {
    title: ordinal(examNumber),
    scaled_score: fakeScore || 0,
    is_excluded_from_pts: false,
    id: null,
    completed_as: examNumber,
    completed: false,
  }
)

const getScoreFromCompletedExam = examNumber => R.pipe(
  // @ts-ignore
  R.find(exam => R.equals(exam.completed_as, examNumber)),
  R.prop('scaled_score'),
  Number
)

const addExamsNotYetTaken = (examAmountThreshold, studentScores, sectionIndex) => async exams => {
  const list = exams
  const PTS = studentScores[sectionIndex].pts
  const lastCompletedExamScore: number = getScoreFromCompletedExam(exams.length)(exams)
  // @ts-ignore
  const threshold = R.divide(
    // @ts-ignore
    R.subtract(PTS, lastCompletedExamScore),
    R.subtract(R.inc(examAmountThreshold), exams.length)
  )

  for (let i = exams.length; i <= examAmountThreshold; i++) {
    const examNumber = R.inc(i)
    const lastExamScore: number = getScoreFromCompletedExam(i)(list)
    const averageExamScore = Math.min(
      Math.round(lastExamScore + threshold),
      PTS
    )

    list.push(
      emptyExam(
        averageExamScore,
        examNumber
      )
    )
  }

  return list
}

/**
 * The actual calculation in done here; this function has unit tests
 */
export const calculateScoreProjectionGraph = (examAmountThreshold, studentScores) => section => R.pipeWith(R.andThen)([
  asAsync(R.prop('exams')),
  extractScoreData(section.section_order, section.is_mocked),
  addExamsNotYetTaken(examAmountThreshold, studentScores, section.section_order),
  addTargetScore(studentScores, section.section_order),
])(section)

const sumTotalScore = prop => R.pipe(
  R.pluck(prop),
  R.reject(R.not),
  R.ifElse(
    R.isEmpty,
    R.always(undefined),
    R.pipe(
      R.map(num => Number(num)),
      R.sum
    )
  )
)

const getPropByKey = key => R.pipe(
  R.head,
  R.prop(key)
)

const prepareScoresForSection = R.pipe(
  R.pluck('scores'),
  R.flatten,
  R.sortBy(R.prop('completed_as')),
  R.groupWith(
    R.eqBy(R.prop('completed_as'))
  ),
  R.map(
    R.applySpec({
      scaled_score: sumTotalScore('scaled_score'),
      is_excluded_from_pts: getPropByKey('is_excluded_from_pts'),
      id: getPropByKey('id'),
      completed_as: getPropByKey('completed_as'),
      title: getPropByKey('title'),
      pts: sumTotalScore('pts'),
      target_score: sumTotalScore('target_score'),
      completed: getPropByKey('completed'),
    })
  ),
  R.sort(
    // @ts-ignore
    (a, b) => (a.completed_as === null) - (b.completed_as === null) || (a.completed_as - b.completed_as)
  )
)

const appendTotalScoreProjection = scores => R.append({
  name: 'total',
  order: null,
  scores: prepareScoresForSection(scores),
})(scores)

const mapScoreProjectionData = (examAmountThreshold, studentScores) => R.pipeWith(R.andThen)([
  // @ts-ignore
  async sections => Promise.all(sections.map(async section => ({
    name: section.section_title,
    order: section.section_order,
    scores: await calculateScoreProjectionGraph(examAmountThreshold, studentScores)(section),
  }))),
  appendTotalScoreProjection,
])

const getPossibleSections = R.pipe(
  R.pluck('sections'),
  R.flatten,
  R.uniqBy(R.prop('order')),
  R.sortBy(R.prop('order')),
  R.map(R.pick(['order', 'title']))
)

const prepareExams = (sections, exams) => R.map(
  R.applySpec({
    section_title: R.prop('title'),
    section_order: R.prop('order'),
    exams: section => R.filter(
      // @ts-ignore
      R.pipe(
        R.prop('scores'),
        JSON.parse,
        R.prop('sections'),
        R.find(R.propEq('order', section.order))
      )
    )(exams),
  })
)(sections)

const attachScoresProp = (sections, ptsArray) => () => R.pipe(
  R.map(
    R.pipe(
      R.juxt([
        R.pick(['id', 'title', 'order']),
        R.pipe(
          R.prop('id'),
          id => R.findIndex(R.propEq('id', id))(sections),
          index => ({ scaled_score: ptsArray[index] })
        ),
      ]),
      R.mergeAll
    )
  ),
  R.objOf('sections')
)(sections)

const choosePtsArray = (defaultArray, array) => R.when(
  R.isEmpty,
  R.always(defaultArray)
)(array)

export const prepareMockedExam = (studentId, examTypeId) => async (exams) => {
  const examNumber = exams.length + 1
  const exam = await fetchRandomStudentExam(studentId, examTypeId)
  const ptsArray = await calculatePTS(examNumber, examTypeId)
  const defaultPtsArray = getMinScoresFromType(exam.type)

  exam.is_mocked = true
  exam.is_excluded_from_pts = false
  exam.completed_as = examNumber
  exam.title = ordinal(examNumber)
  exam.status = STUDENT_EXAM_STATUS_COMPLETED

  const mocked = R.over(
    // @ts-ignore
    R.lensProp('scores'),
    R.pipe(
      attachScoresProp(exam.sections, choosePtsArray(defaultPtsArray, ptsArray)),
      JSON.stringify
    )
  )(exam)

  return [...exams, mocked]
}

/**
 * Re-usable wrapper for calculateScoreProjectionData
 */
export const generateScoreProjectionData = async (student, examTypeId) => {
  const examAmountThreshold = await getSetting(Settings.ExamAmountThreshold)
  const studentScores = await getCurrentStudentScores(student.id, examTypeId)

  const exams = await R.pipeWith(R.andThen)([
    findExamsForGraph(examTypeId),
    R.prop('data'),
    R.invoker(0, 'toJSON'),
    R.when(
      R.pipe(
        R.reject(R.prop('is_excluded_from_pts')),
        R.isEmpty
      ),
      await prepareMockedExam(student.id, examTypeId)
    ),
    R.converge(
      prepareExams, [
        getPossibleSections,
        R.map(
          R.pick(['title', 'id', 'is_excluded_from_pts', 'completed_as', 'scores', 'is_mocked'])
        ),
      ]
    ),
  ])(student.id)

  return mapScoreProjectionData(examAmountThreshold, studentScores)(exams)
}
