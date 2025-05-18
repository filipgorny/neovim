import * as R from 'ramda'

export const findAllMatchingStudentExamIds = (exam_id) => R.pipe(
  R.filter(exam => exam.exam_id === exam_id),
  R.pluck('id'),
  R.join(',')
)
