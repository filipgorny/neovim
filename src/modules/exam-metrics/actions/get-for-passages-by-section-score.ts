import * as R from 'ramda'
import { findOne } from '../../exam-passage-metrics/exam-passage-metrics-repository'

export default async (exam_type_id, section_order, section_score) => {
  const metrics = await findOne({
    exam_type_id,
    section_order,
    section_score
  })

  return R.evolve({
    timings: JSON.parse
  })(metrics)
}
