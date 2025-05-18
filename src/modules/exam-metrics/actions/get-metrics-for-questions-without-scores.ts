import * as R from 'ramda'
import { findOne } from '../../exams/exam-repository'
import { getSectionByOrder, sortByOrder } from './helpers/metrics-helpers'

const findExam = async id => findOne({ id }, ['sections.passages.questions'])

const transformQuestions = R.map(
  R.pipe(
    R.pick(['checking_avg', 'reading_avg', 'working_avg']),
    R.objOf('timers')
  )
)

const addOrder = R.addIndex(R.map)(
  (item: object, index) => (
    { order: index + 1, ...item }
  )
)

export default async (exam_id: string, section_order: string) => (
  // @ts-ignore
  R.pipeWith(R.andThen)([
    findExam,
    R.prop('sections'),
    getSectionByOrder(section_order),
    // @ts-ignore
    R.prop('passages'),
    sortByOrder,
    R.pluck('questions'),
    R.map(sortByOrder),
    R.flatten,
    transformQuestions,
    addOrder,
    R.objOf('timings'),
    R.mergeRight({
      exam_id,
      section_order,
    }),
    // @ts-ignore
  ])(exam_id)
)
