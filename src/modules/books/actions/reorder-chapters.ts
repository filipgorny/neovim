import * as R from 'ramda'
import { areStringArraysEqual } from '../../../../utils/array/are-string-arrays-equal'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { updateChapterOrder } from '../../book-chapters/book-chapter-service'
import { findOneOrFail } from '../book-repository'

type Payload = {
  chapter_ids: string[]
}

const validateIds = (payloadIds: string[], bookChapterIds: string[]) => (
  R.unless(
    areStringArraysEqual(bookChapterIds),
    () => throwException(customException('payload-mismatch', 403, 'IDs from payload do not match IDs from book'))
  )(payloadIds)
)

const getChapterIds = R.pipe(
  R.prop('chapters'),
  R.pluck('id')
)

export default async (id: string, payload: Payload) => {
  const book = await findOneOrFail({ id }, ['chapters'])

  validateIds(payload.chapter_ids, getChapterIds(book))

  return R.addIndex(R.map)(
    async (id, index) => (
      updateChapterOrder(id, index + 1)
    )
  )(payload.chapter_ids)
}
