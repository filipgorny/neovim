import { BookErrataTypeEnum } from '../../../types/book-errata'
import { patchErrata } from '../book-erratas-service'

type Payload = {
  content_delta_object: {},
  content_raw: string,
  content_html: string
  type: BookErrataTypeEnum,
  book_content_id?: string,
}

export default async (id: string, payload: Payload) => (
  patchErrata(id, payload)
)
