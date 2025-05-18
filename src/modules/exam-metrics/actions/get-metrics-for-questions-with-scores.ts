import * as R from 'ramda'
import { find } from '../../exam-question-time-metrics/exam-question-time-metrics-repository'
import { findOne } from '../../exams/exam-repository'
import { getSectionByOrder, sortByOrder } from './helpers/metrics-helpers'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const findExam = async id => findOne({ id }, ['sections.passages.questions'])

const findTimers = section_score => async exam_id => (
  find({
    limit: {},
    order: {},
  }, { exam_id, section_score }, [], true)
)

const addOrder = R.addIndex(R.map)(
  (item: object, index) => (
    { order: index + 1, ...item }
  )
)

const filterExistingIds = existingIds => R.pipe(
  R.filter(
    R.propSatisfies(
      R.includes(R.__, existingIds),
      'exam_question_id'
    )
  )
)

export default async (exam_id: string, section_order: string, section_score: string) => {
  const questions = await R.pipeWith(R.andThen)([
    findExam,
    R.prop('sections'),
    getSectionByOrder(section_order),
    // @ts-ignore
    R.prop('passages'),
    sortByOrder,
    R.pluck('questions'),
    R.map(sortByOrder),
    R.flatten,
    R.pluck('id'),
  ])(exam_id)

  // @ts-ignore
  return R.pipeWith(R.andThen)([
    findTimers(Number(section_score)),
    R.prop('data'),
    collectionToJson,
    filterExistingIds(questions),
    addOrder,
  ])(exam_id)
}
