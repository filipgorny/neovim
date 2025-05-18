import { authStudent } from '../../middleware/authorize'
import { customParam, id, payloadValidate, route, studentCourse, user } from '../../../utils/route/attach-route'
import fetchChapterNotes from './actions/fetch-chapter-notes'
import markPartAsRead from './actions/mark-part-as-read'
import setBookmark from './actions/set-bookmark'

import { schema as setBookmarkSchema } from './validation/schema/set-bookmark-schema'
import deleteBookmark from './actions/delete-bookmark'
import { studentCourseContext } from '../../middleware/student-course-context'
import getSubchapters from './actions/get-subchapters'

export default app => {
  app.get('/student-book-chapters/:id/notes', authStudent, route(fetchChapterNotes, [user, id]))
  app.get('/student-book-chapters/:id/subchapters', authStudent, route(getSubchapters, [id]))

  app.patch('/student-book-chapters/:id/part/:part/read', authStudent, studentCourseContext,
    route(markPartAsRead, [user, studentCourse, id, customParam('part')])
  )

  app.post('/student-book-chapters/:id/bookmark', authStudent, route(setBookmark, [user, id, payloadValidate(setBookmarkSchema)]))

  app.delete('/student-book-chapters/:id/bookmark', authStudent, route(deleteBookmark, [user, id]))
}
