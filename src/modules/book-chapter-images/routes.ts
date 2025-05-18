import { files, id, payloadValidate, route } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import addBookChapterImage from './actions/add-book-chapter-image'
import fetchChapterImages from './actions/fetch-chapter-images'
import deleteBookChapterImage from './actions/delete-book-chapter-image'
import updateBookChapterImage from './actions/update-book-chapter-image'

import { schema as createImageSchema } from './validation/schema/create-image-schema'
import { schema as updateImageSchema } from './validation/schema/update-image-schema'

export default app => {
  app.post('/book-chapter-images', authAdmin, route(addBookChapterImage, [files, payloadValidate(createImageSchema)]))

  app.patch('/book-chapter-images/:id', authAdmin, route(updateBookChapterImage, [id, files, payloadValidate(updateImageSchema)]))

  app.get('/book-chapter-images/:id', authAdmin, route(fetchChapterImages, [id]))

  app.delete('/book-chapter-images/:id', authAdmin, route(deleteBookChapterImage, [id]))
}
