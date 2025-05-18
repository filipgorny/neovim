import * as R from 'ramda'
import asAsync from '../../../../utils/function/as-async'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { BookChapter } from '../../../types/book-chapter'
import { ChapterAdmin } from '../../../types/chapter-admin'
import { findByIds } from '../../book-chapters/book-chapter-repository'

type Payload = {
  chapter_ids: string[]
}

const makeChapterAdminRecord = (admin_id: string) => (chapter: BookChapter): ChapterAdmin => ({
  admin_id,
  chapter_id: chapter.id,
  book_id: chapter.book.id,
})

const getChapters = async (payload: Payload) => (
  R.pipeWith(R.andThen)([
    asAsync(R.prop('chapter_ids')),
    findByIds,
    collectionToJson,
  ])(payload)
)

export default handler => async (id: string, payload: Payload) => {
  const chapters = await getChapters(payload)
  const records = R.map(makeChapterAdminRecord(id))(chapters)

  return handler(records)
}
