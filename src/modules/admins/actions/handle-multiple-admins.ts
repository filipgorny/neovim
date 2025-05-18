import * as R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { ChapterAdmin } from '../../../types/chapter-admin'
import { findOneOrFail } from '../../book-chapters/book-chapter-repository'
import { schema } from '../validation/schema/attach-to-book-chapter-schema'

type Payload = {
  admin_ids: string[]
}

const makeChapterAdminRecord = (book_id: string, chapter_id: string) => (admin_id: string): ChapterAdmin => ({
  admin_id,
  chapter_id,
  book_id,
})

export default handler => async (id: string, payload: Payload) => {
  validateEntityPayload(schema)(payload)

  const chapter = await findOneOrFail({ id }, ['book'])
  const records = R.map(makeChapterAdminRecord(chapter.book.id, id))(payload.admin_ids)

  return handler(records)
}
