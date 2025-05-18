import * as R from 'ramda'

export const extractTitle = R.pipe(
  R.split('|'),
  R.head
)

export const makeGroupingKey = R.pipe(
  R.juxt([
    R.prop('course_title'),
    R.propOr('-', 'student_course_id'),
  ]),
  R.join('|')
)
