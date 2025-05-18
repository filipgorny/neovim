import * as R from 'ramda'
import { findOne } from '../../exams/exam-repository'
import { getSectionByOrder, sortByOrder } from './helpers/metrics-helpers'

const findExam = async id => findOne({ id }, ['sections.passages'])

const transformPassages = R.map(
  R.pipe(
    R.juxt([
      R.pick(['order']),
      R.pipe(
        R.pick(['checking_avg', 'reading_avg', 'working_avg']),
        R.objOf('timers')
      ),
    ]),
    R.mergeAll
  )
)

export default async (exam_id: string, section_order: string) => (
  R.pipeWith(R.andThen)([
    findExam,
    R.prop('sections'),
    getSectionByOrder(section_order),
    // @ts-ignore
    R.prop('passages'),
    transformPassages,
    sortByOrder,
    R.objOf('timings'),
    R.mergeRight({
      exam_id,
      section_order,
    }),
    // @ts-ignore
  ])(exam_id)
)
