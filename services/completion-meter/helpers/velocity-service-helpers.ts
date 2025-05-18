import { average } from '@desmart/js-utils'
import * as R from 'ramda'

const getZerosToInclude = (courseBookCount, readBookCount) => (
  R.repeat(0, R.max(0, courseBookCount - readBookCount))
)

const sumByBookId = R.pipe(
  R.groupBy(
    R.prop('student_book_id')
  ),
  R.map(
    R.pipe(
      R.pluck('content_read_amount'),
      R.sum,
      R.objOf('content_read_amount')
    )
  ),
  R.values
)

export const calculateVelocity = (courseBookCount, readBookCount, readContentData) => (
  R.pipe(
    sumByBookId,
    R.pluck('content_read_amount'),
    R.concat(getZerosToInclude(courseBookCount, readBookCount)),
    average,
    Math.round
  )(readContentData)
)
