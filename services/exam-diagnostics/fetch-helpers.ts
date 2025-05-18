import * as R from 'ramda'
import { find } from '../../src/modules/exam-metrics/exam-metrics-repository'
import { find as findPassageMetrics } from '../../src/modules/exam-passage-metrics/exam-passage-metrics-repository'
import { find as findAvg } from '../../src/modules/exam-metrics-avg/exam-metrics-avg-repository'
import { find as findPassageMetricsAvg } from '../../src/modules/exam-passage-metrics-avg/exam-passage-metrics-avg-repository'
import { findAllCompletedExams } from '../../src/modules/student-exams/student-exam-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'

const findMetricsByExamTypeId = (section_order, section_score) => async exam_type_id => (
  find({ limit: {}, order: {} }, {
    exam_type_id,
    section_order,
    section_score,
  })
)

const findPassageMetricsByExamTypeId = (section_order, section_score) => async exam_type_id => (
  findPassageMetrics({ limit: {}, order: {} }, {
    exam_type_id,
    section_order,
    section_score,
  })
)

const findMetricsByExamTypeIdWithoutScore = section_order => async exam_type_id => (
  findAvg({ limit: {}, order: {} }, {
    exam_type_id,
    section_order,
  })
)

const findPassageMetricsByExamTypeIdWithoutScore = section_order => async exam_type_id => (
  findPassageMetricsAvg({ limit: {}, order: {} }, {
    exam_type_id,
    section_order,
  })
)

export const fetchMetrics = async (exam_type_id, section_order, section_score) => (
  R.pipeWith(R.andThen)([
    findMetricsByExamTypeId(section_order, section_score),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(exam_type_id)
)

export const fetchPassageMetrics = async (exam_type_id, section_order, section_score) => (
  R.pipeWith(R.andThen)([
    findPassageMetricsByExamTypeId(section_order, section_score),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(exam_type_id)
)

export const fetchMetricsWithoutScore = async (exam_type_id, section_order) => (
  R.pipeWith(R.andThen)([
    findMetricsByExamTypeIdWithoutScore(section_order),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(exam_type_id)
)

export const fetchPassageMetricsWithoutScore = async (exam_type_id, section_order) => (
  R.pipeWith(R.andThen)([
    findPassageMetricsByExamTypeIdWithoutScore(section_order),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(exam_type_id)
)

export const findExams = (examTypeId) => async student => (
  findAllCompletedExams(examTypeId)(student)
)
