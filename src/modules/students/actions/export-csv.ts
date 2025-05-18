import * as R from 'ramda'
import Papa from 'papaparse'
import mapP from '../../../../utils/function/mapp'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { findOne as findStudent } from '../student-repository'
import { findAllExams } from '../../student-exams/student-exam-repository'
import { fetchStudentScores } from '../../student-exam-scores/student-exam-scores-repository'
import { schema } from '../validation/schema/export-csv-schema'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

type ToExport = {
  personal_data: boolean,
  exam_data: boolean,
  primary_score_data: boolean,
  time_data: boolean,
}

type Payload = {
  to_export: ToExport,
  ids: string[]
}

const fetchPersonalData = async (id: string) => (
  R.pipeWith(R.andThen)([
    async id => findStudent({ id }),
    R.pick(['id', 'name', 'email', 'is_active']),
  ])(id)
)

const fetchExamData = async (student_id: string) => (
  R.pipeWith(R.andThen)([
    async student_id => findAllExams({ student_id }),
    R.prop('data'),
    collectionToJson,
    R.map(
      R.pick(['id', 'external_id', 'title', 'status', 'accessible_to'])
    ),
  ])(student_id)
)

const fetchTargetScores = async (id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => fetchStudentScores(id, ['examType']),
    R.prop('data'),
    collectionToJson,
    R.map(
      R.applySpec({
        scores: R.pipe(
          R.prop('scores'),
          JSON.parse
        ),
        examType: R.path(['examType', 'title']),
      })
    ),
  ])(id)
)

const fetchExamScoresAndTimers = async (student_id: string) => (
  R.pipeWith(R.andThen)([
    async student_id => findAllExams({ student_id }, ['type']),
    R.prop('data'),
    collectionToJson,
    R.map(
      R.applySpec({
        scores: R.pipe(
          R.prop('scores'),
          JSON.parse
        ),
        // temporarily disabled as it need a lot of parsing to make it readable
        // also, timers should be exported on demand (toggle)
        // timers: R.pipe(
        //   R.prop('timers'),
        //   JSON.parse
        // ),
        examType: R.path(['type', 'title']),
        title: R.prop('title'),
        completed_as: R.prop('completed_as'),
      })
    ),
  ])(student_id)
)

const fetchPrimaryScoreData = async (id: string) => {
  const targetScores = await fetchTargetScores(id)
  const scoresAndTimers = await fetchExamScoresAndTimers(id)

  return {
    targetScores,
    scores: scoresAndTimers,
  }
}

const processSingleStudentData = (to_export: ToExport) => async (id: string) => {
  const personalData = to_export.personal_data ? await fetchPersonalData(id) : null
  const examData = to_export.exam_data ? await fetchExamData(id) : null
  const primaryScoreData = to_export.primary_score_data ? await fetchPrimaryScoreData(id) : null

  return {
    personal_data: personalData,
    exam_data: examData,
    primary_score_data: primaryScoreData,
  }
}

const exportPersonalData = shouldExport => data => {
  if (!shouldExport) {
    return ''
  }

  return R.pipe(
    R.prop('personal_data'),
    Array,
    R.append({}),
    Papa.unparse,
    R.concat('STUDENT DATA\r\n')
  )(data)
}

const exportExamData = R.pipe(
  R.prop('exam_data'),
  // @ts-ignore
  R.append({}),
  Papa.unparse,
  R.concat('\r\n\r\nEXAM DATA\r\n')
)

const exportTargetScoreData = shouldExport => data => {
  if (!shouldExport) {
    return ''
  }

  const payload = R.pipe(
    R.prop('primary_score_data'),
    // @ts-ignore
    R.prop('targetScores'),
    R.head
    // @ts-ignore
  )(data)

  const targetScores = R.pipe(
    R.prop('scores'),
    Papa.unparse
    // @ts-ignore,
  )(payload)

  const examType = R.pipe(
    R.prop('examType')
    // @ts-ignore,
  )(payload)

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return '\r\n' + examType + '\r\n' + targetScores
}

const exportExamScoreData = shouldExport => data => {
  if (!shouldExport) {
    return ''
  }

  const scores = R.path(['primary_score_data', 'scores'])(data)

  return R.map(
    R.pipe(
      R.juxt([
        R.prop('type'),
        R.pipe(
          R.prop('scores'),
          R.juxt([
            R.pipe(
              R.prop('exam'),
              R.when(
                R.isNil,
                R.always([])
              ),
              R.pickAll(['title', 'amount_correct', 'percentile_rank', 'scaled_score']),
              Papa.unparse,
              R.concat('\r\n')
            ),
            R.pipe(
              R.prop('sections'),
              R.when(
                R.isNil,
                R.always([])
              ),
              R.map(
                R.pick(['title', 'amount_correct', 'percentile_rank', 'scaled_score'])
              ),
              Papa.unparse,
              R.concat('\r\n')
            ),
          ])
        ),
      ])
    )
    // @ts-ignore
  )(scores)
}

const exportPrimaryScoreData = shouldExport => data => {
  const ts = exportTargetScoreData(shouldExport)(data)
  const scores = exportExamScoreData(shouldExport)(data)

  // @ts-ignore
  return '\r\n\r\nTARGET SCORES' + ts + '\r\n\r\nEXAM SCORES\r\n' + scores
}

export default async (res, payload: Payload) => {
  validateEntityPayload(schema)(payload)

  const { to_export, ids } = payload

  const data = await mapP(
    processSingleStudentData(to_export)
  )(ids)

  const csvData = R.pipe(
    R.map(
      R.juxt([
        exportPersonalData(to_export.personal_data),
        exportExamData,
        exportPrimaryScoreData(to_export.primary_score_data),
      ])
    ),
    a => a.join('\r\n')
    // @ts-ignore
  )(data)

  res.attachment('student-export.csv').send(csvData)
}
