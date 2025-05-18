import R from 'ramda'
import { snakeCase } from 'lodash'
import { createExamType } from '../exam-type-service'
import {
  throwException,
  customException,
  introPagesLengthMismatchException
} from '../../../../utils/error/error-factory'
import { cretateLayout } from '../../layouts/layout-service'
import mapP from '../../../../utils/function/mapp'
import { createExamIntroPage } from '../../exam-intro-pages/exam-intro-page-service'
import { findOne } from '../exam-type-repository'
import { DELETED_AT } from '@desmart/js-utils'

const throwBreakDefinitionLengthMismatchException = (): never => throwException(customException('exam-types.break-definition.invalid-length', 422, 'Break definition length does not match section count decremented by 1'))
const throwQuestionAmountLengthMismatchException = (): never => throwException(customException('exam-types.question-amount.invalid-length', 422, 'Question amount length does not match section count'))
const throwExamLengthLengthMismatchException = (): never => throwException(customException('exam-types.exam-length.invalid-length', 422, 'Exam length length does not match section count'))
const throwIntroPagesLengthMismatchException = (): never => throwException(introPagesLengthMismatchException())

const isMismatchValue = value => R.pipe(
  R.equals(value),
  R.not
)

const validateBreakDefinition = (sectionCount: number, definition: Array<{ order: number, value: number }>): void | never => R.when(
  isMismatchValue(definition.length + 1),
  throwBreakDefinitionLengthMismatchException
)(sectionCount)

const validateQuestionAmount = (sectionCount: number, definition: Array<{ order: number, value: number }>): void | never => R.when(
  isMismatchValue(definition.length),
  throwQuestionAmountLengthMismatchException
)(sectionCount)

const validateExamLength = (sectionCount: number, definition: Array<{ order: number, value: number }>): void | never => R.when(
  isMismatchValue(definition.length),
  throwExamLengthLengthMismatchException
)(sectionCount)

const validateIntroPagesAmount = (sectionCount: number, data) => R.pipe(
  R.when(
    (arr: object[]) => isMismatchValue(sectionCount)(arr.length),
    throwIntroPagesLengthMismatchException
  ),
  R.sortBy(
    R.prop('order')
  ),
  R.addIndex(R.map)(
    (val: {}, idx) => ({
      ...val,
      order: R.inc(idx),
    })
  )
)(data)

const makeSectionKeys = (index: number): string => `section_${index}`

const buildSectionDefinitionData = (definition: Array<{ order: number, value: number }>): string => R.pipe(
  R.map(
    R.juxt([
      R.pipe(
        R.prop('order'),
        makeSectionKeys
      ),
      R.pipe(
        R.prop('value'),
        Number
      ),
    ])
  ),
  R.fromPairs,
  R.mergeAll,
  JSON.stringify
)(definition)

const groupByOrderAndValueAsJson = (definition: Array<{ order: number, value: any }>): string => R.pipe(
  R.map(
    R.juxt([
      R.pipe(
        R.prop('order'),
        makeSectionKeys
      ),
      R.prop('value'),
    ])
  ),
  R.fromPairs,
  R.mergeAll,
  JSON.stringify
)(definition)

const prepareLayoutTitle = (type: string, subtype: string): string => R.pipe(
  R.concat('-'),
  R.concat(type)
)(subtype)

const makeTypeFromTitle = (title: string) => snakeCase(title) + '_type'
const makeSubTypeFromTitle = (title: string) => snakeCase(title) + '_subtype'

const validateTypeAndSubtype = async (type: string, subtype: string) => {
  const examType = await findOne({ type, subtype })

  if (examType && examType[DELETED_AT] === null) {
    throwException(customException('exam-types.type-and-subtype-exists', 422, 'Exam type and subtype already exists'))
  }
}

export default async payload => {
  const {
    title,
    type_label,
    sectionCount,
    breakDefinition = [],
    questionAmount = [],
    examLength = [],
    sectionTitles = [],
    scaledScoreRanges = [],
  } = payload

  const type = makeTypeFromTitle(title)
  const subtype = makeSubTypeFromTitle(title)

  const introPages = validateIntroPagesAmount(sectionCount, payload.introPages)

  validateBreakDefinition(sectionCount, breakDefinition)
  validateQuestionAmount(sectionCount, questionAmount)
  validateExamLength(sectionCount, examLength)
  await validateTypeAndSubtype(type, subtype)

  await cretateLayout(prepareLayoutTitle(type, subtype))

  const examType = await createExamType(
    title,
    buildSectionDefinitionData(breakDefinition),
    type,
    subtype,
    sectionCount,
    buildSectionDefinitionData(questionAmount),
    buildSectionDefinitionData(examLength),
    groupByOrderAndValueAsJson(sectionTitles),
    groupByOrderAndValueAsJson(scaledScoreRanges),
    type_label
  )

  await mapP(
    async page => createExamIntroPage(page.raw, page.delta_object, examType.id, page.order)
  )(introPages)

  return examType
}
