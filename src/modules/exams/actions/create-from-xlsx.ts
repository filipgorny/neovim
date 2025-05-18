import R from 'ramda'
import XLSX from 'xlsx'
import xlsxParser from '../../../../services/xlsx-parser/xlsx-parser'
import mapP from '../../../../utils/function/mapp'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { createExam } from '../exam-service'
import { cretateExamSections } from '../../exam-sections/exam-section-service'
import { createExamPassages } from '../../exam-passages/exam-passage-service'
import { getSetting } from '../../settings/settings-service'
import { calculateExamLength } from '../exam-length-service'
import { findOne } from '../exam-repository'
import { findOneOrFail as findExamType } from '../../exam-types/exam-type-repository'
import {
  examLengthMismatchException,
  examQuestionAmountMismatchException,
  examTitleAlreadyExistsException,
  throwException
} from '../../../../utils/error/error-factory'
import { seedTimerMetrics } from '../../../../services/exam-types/seed-timer-metrics'
import { Settings } from '../../settings/settings'
import { initializeScoreMap } from '../../exam-section-score-map/exam-section-score-map-service'
import { validateExternalIdIsUnique } from '../validation/validate-external-id-is-unique'
import { ScoreCalculationMethod } from '../score-calculation-methods'

const extractPassages = sectionNames => R.pipe(
  R.map(
    R.pipe(
      R.values,
      R.flatten,
      R.pluck('passage')
    )
  ),
  R.zipObj(sectionNames)
)
const findByTitle = title => R.pipe(
  R.mergeAll,
  R.prop(title)
)

const createPassagesForSection = (passages, questionSets) => async section => {
  return createExamPassages(section.id, passages[section.title], findByTitle(section.title)(questionSets))
}

const validateTitleIsUnique = async title => (
  findOne({ title })
    .then(instance => {
      if (instance) {
        throwException(examTitleAlreadyExistsException())
      }
    })
)

const validateExamLength = sectionCount => R.unless(
  R.propEq('section_count', sectionCount),
  () => throwException(examLengthMismatchException())
)

const validateExamQuestionsAmount = sections => R.pipe(
  R.propOr('{}', 'question_amount'),
  JSON.parse,
  R.values,
  R.map(Number),
  definition => R.pipe(
    R.equals(
      R.pipe(
        R.pluck('amount'),
        R.map(Number),
        R.tap(console.log) // for debugging: this tells us how many questions are in the exam file
      )(sections)
    ),
    R.when(
      R.not,
      () => throwException(examQuestionAmountMismatchException(definition))
    )
  )(definition)
)

const getExamLengthFromExamType = (examType, questionSets) => {
  const calculatedExamLength = calculateExamLength(questionSets)

  const examLength = R.pipe(
    R.prop('exam_length'),
    JSON.parse,
    R.values
  )(examType)

  const examLengthSections = R.pipe(
    R.addIndex(R.map)(
      (item, index) => (
        R.set(R.lensProp('sectionMinutes'), examLength[index], item)
      )
    )
  )(calculatedExamLength.sections)

  calculatedExamLength.sections = examLengthSections
  calculatedExamLength.summary.minutes = R.sum(examLength)

  return calculatedExamLength
}

const getSectionTitlesFromExamType = R.pipe(
  R.prop('section_titles'),
  JSON.parse,
  R.values
)

type Payload = {
  layout_id: string
  exam_type_id: string
  title: string
  external_id: string
  google_form_url: string
  score_calculation_method: ScoreCalculationMethod
  periodic_table_enabled?: boolean
  max_completions?: number
  custom_title?: string
}

export default async (files, user, payload: Payload) => {
  const {
    layout_id,
    title,
    external_id,
    exam_type_id,
    google_form_url,
    score_calculation_method,
    periodic_table_enabled,
    max_completions,
    custom_title,
  } = payload

  await validateExternalIdIsUnique(external_id)
  await validateTitleIsUnique(title)

  const examType = await findExamType({ id: exam_type_id })
  const workbook = XLSX.read(files.file.data)
  const questionSets = xlsxParser(workbook)
  const calculatedExamLength = getExamLengthFromExamType(examType, questionSets)

  const sectionTitles = getSectionTitlesFromExamType(examType)

  validateExamLength(calculatedExamLength.summary.sectionCount)(examType)
  validateExamQuestionsAmount(calculatedExamLength.sections)(examType)

  const accessPeriod = await getSetting(Settings.DefaultExamAccessPeriod)

  const exam = await createExam(
    layout_id,
    title,
    files.file.name,
    user.id,
    external_id,
    accessPeriod,
    calculatedExamLength,
    examType.id,
    google_form_url,
    score_calculation_method,
    max_completions || 1,
    periodic_table_enabled,
    custom_title
  )

  const sections = await cretateExamSections(exam.id, workbook.SheetNames, sectionTitles, examType)
  // Debug - single sheet
  // const sections = await cretateExamSections(exam.id, ['CHEMISTRY PHYSICS'], sectionTitles)
  const passagesExtracted = extractPassages(workbook.SheetNames)(questionSets)

  await R.pipe(
    collectionToJson,
    mapP(
      createPassagesForSection(passagesExtracted, questionSets)
    )
  )(sections)

  await Promise.all([
    seedTimerMetrics(examType.id),
    initializeScoreMap(exam.id),
  ])

  return exam
}
