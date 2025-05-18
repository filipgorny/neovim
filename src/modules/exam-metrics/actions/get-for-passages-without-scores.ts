import * as R from 'ramda'
import { findOne } from '../../exam-passage-metrics-avg/exam-passage-metrics-avg-repository'

export default async (exam_type_id, section_order) => {
  const metrics = await findOne({
    exam_type_id,
    section_order,
  })

  return R.evolve({
    timings: JSON.parse,
  })(metrics)
}
