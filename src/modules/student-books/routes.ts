import { route, user, id, query, customParam, payloadValidate, payload } from '@desmart/js-utils/dist/route'
import { authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import fetchAllBooks from './actions/fetch-all-books'
import fetchBookDetail from './actions/fetch-book-detail'
import markLastRead from './actions/mark-last-read'
import getChapters from './actions/get-chapters'
import searchForPhrase from './actions/search-for-phrase'
import updatePreviewState from './actions/update-preview-state'
import { studentCourse } from '../../../utils/route/attach-route'

import { schema as searchForPhraseSchema } from './validation/schema/search-for-phrase-schema'
import { schema as updatePreviewStateSchema } from './validation/schema/update-preview-state-schema'

export default app => {
  app.get('/student-books', authStudent, studentCourseContext, route(fetchAllBooks, [user, query, studentCourse]))
  app.get('/student-books/:id/details/:chapter_oder/:part', authStudent, studentCourseContext, route(
    fetchBookDetail, [
      user,
      id,
      customParam('chapter_oder'),
      customParam('part'),
      studentCourse,
    ]))
  app.get('/student-books/:id/details/:chapter_oder/:part/partial/:partial', authStudent, studentCourseContext, route(
    fetchBookDetail, [
      user,
      id,
      customParam('chapter_oder'),
      customParam('part'),
      studentCourse,
      customParam('partial'),
    ]))
  app.get('/student-books/:id/chapters', authStudent, studentCourseContext, route(getChapters, [user, id, studentCourse]))

  app.patch('/student-books/:id/last-read/:chapter_oder/:part', authStudent, studentCourseContext, route(
    markLastRead, [
      user,
      id,
      customParam('chapter_oder'),
      customParam('part'),
      studentCourse,
      payload,
    ]
  ))

  app.post('/student-books/:id/search', authStudent, route(searchForPhrase, [id, payloadValidate(searchForPhraseSchema)]))

  app.patch('/student-books/:id/preview-state', authStudent, route(updatePreviewState, [id, payloadValidate(updatePreviewStateSchema)]))
}
