import XLSX from 'xlsx'
import * as R from 'ramda'
import { renameProps } from '@desmart/js-utils'
import { findByExamId } from '../../exam-score-map/exam-score-map-repository'
import { find as findForSectionsByExamId } from '../../exam-section-score-map/exam-section-score-map-repository'
import { findOneOrFail as findExam } from '../../exams/exam-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { __basedir } from '../../../server'
import { S3_PREFIX_EXAM_DIAGRAM } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'

const getExamResults = async (id: string) => (
  R.pipeWith(R.andThen)([
    findByExamId,
    R.map(
      renameProps({
        score: 'scaled_score',
        student_amount: 'students',
      })
    ),
    R.map(
      R.pick(['scaled_score', 'students', 'percentile_rank'])
    ),
  ])(id)
)

const getExamSectionResults = async (id: string) => (
  R.pipeWith(R.andThen)([
    async exam_id => findForSectionsByExamId({ limit: { page: 1, take: 1000 }, order: { by: 'correct_answers', dir: 'asc' } }, { exam_id }),
    R.prop('data'),
    collectionToJson,
    R.groupBy(
      R.prop('section_id')
    ),
  ])(id)
)

const findTitleById = sections => id => (
  R.pipe(
    R.find(
      section => section.id === id
    ),
    R.prop('title')
  )(sections)
)

const extractSectionScores = R.pipe(
  R.map(
    renameProps({
      correct_answers: 'raw_score',
      score: 'scaled_score',
      amount_correct: 'students',
    })
  ),
  R.map(
    R.pick(['raw_score', 'scaled_score', 'students', 'percentile_rank'])
  )
)

export default async (id: string) => {
  const [exam, examResults, sectionResults] = await Promise.all([
    findExam({ id }, ['sections']),
    getExamResults(id),
    getExamSectionResults(id),
  ])

  const sectionIds = Object.keys(sectionResults)
  const sections = R.prop('sections', exam)

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(examResults)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'EXAM')

  R.forEach(
    id => {
      const scores = extractSectionScores(sectionResults[id])
      const title = findTitleById(sections)(id)

      const worksheet = XLSX.utils.json_to_sheet(scores)
      XLSX.utils.book_append_sheet(workbook, worksheet, title)
    }
  )(sectionIds)

  const fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  const imageKey = await uploadFile(fileBuffer, 'application/vnd.ms-excel', S3_PREFIX_EXAM_DIAGRAM)

  return {
    url: generatePresignedUrl(imageKey),
  }
}
