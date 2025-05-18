import { createErrata } from '../book-erratas-service'
import { findOneOrFail } from '../../book-subchapters/book-subchapter-repository'
import { BookErrataTypeEnum } from '../../../types/book-errata'

type Payload = {
  subchapter_id: string,
  content_delta_object: {},
  content_raw: string,
  content_html: string
  type: BookErrataTypeEnum,
  book_content_id?: string,
}

export default async (user, payload: Payload) => {
  const subchapter = await findOneOrFail({ id: payload.subchapter_id }, ['chapter.book'])

  return createErrata({
    ...payload,
    chapter_id: subchapter.chapter.id,
    book_id: subchapter.chapter.book.id,
    created_by: user.id,
    content_delta_object: JSON.stringify(payload.content_delta_object),
    content_html: payload.content_html,
    content_raw: payload.content_raw,
    book_content_id: payload.book_content_id,
  })
}
