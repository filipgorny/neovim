import { id, payloadValidate, query, route, studentCourse, userId } from '../../../utils/route/attach-route'
import { authRealStudent, authStudent } from '../../middleware/authorize'
import { studentCourseContext } from '../../middleware/student-course-context'
import fetchAllVideos from './actions/fetch-all-videos'
import updateWatchedTimestamp from './actions/update-watched-timestamp'

import { schema as updateWatchedTimestampSchema } from './validation/update-watched-timestamp-schema'
import getStudentVideo from './actions/get-student-video'
import { user } from '@desmart/js-utils'
import getByCategory from './actions/get-by-category'
import getBookVideos from './actions/get-book-videos'
import getCounters from './actions/get-counters'
import getFavouriteVideos from './actions/get-favourite-videos'
import getAllVideos from './actions/get-all-videos'

export default app => {
  app.get('/student-videos', authStudent, studentCourseContext, route(fetchAllVideos, [user, query, studentCourse]))
  app.get('/student-videos/all', authStudent, studentCourseContext, route(getAllVideos, [user, query, studentCourse]))
  app.get('/student-videos/books', authStudent, studentCourseContext, route(getBookVideos, [user, query, studentCourse]))
  app.get('/student-videos/counters', authStudent, studentCourseContext, route(getCounters, [user, studentCourse, query]))
  app.get('/student-videos/category', authStudent, studentCourseContext, route(getByCategory, [studentCourse, query]))
  app.get('/student-videos/favourite', authStudent, studentCourseContext, route(getFavouriteVideos, [studentCourse, query, user]))
  app.get('/student-videos/:id', authStudent, studentCourseContext, route(getStudentVideo, [id, user, studentCourse]))

  app.patch('/student-videos/:id', authRealStudent, studentCourseContext, route(updateWatchedTimestamp, [studentCourse, userId, id, payloadValidate(updateWatchedTimestampSchema)]))
}
