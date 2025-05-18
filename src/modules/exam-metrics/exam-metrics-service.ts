import * as R from 'ramda'
import { create, patch } from './exam-metrics-repository'
import { create as createAvg, patch as patchAvg } from '../exam-metrics-avg/exam-metrics-avg-repository'

export const upsertExamMetrics = (examTypeId) => async dto => (
  R.ifElse(
    R.has('id'),
    async () => patch(dto.id, { timings: dto.timings }),
    async () => create(examTypeId, {
      section_score: dto.scaled_score,
      section_order: dto.order,
      timings: JSON.stringify(dto.questions)
    })
  )(dto)
)

export const upsertExamMetricsAvg = (examTypeId) => async dto => (
  R.ifElse(
    R.has('id'),
    async () => patchAvg(dto.id, { timings: dto.timings }),
    async () => createAvg(examTypeId, {
      section_order: dto.order,
      timings: JSON.stringify(dto.questions)
    })
  )(dto)
)
