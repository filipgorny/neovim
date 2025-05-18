import { route, payloadValidate, user, customParam } from '@desmart/js-utils'
import { authAdmin, authStudent } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { studentCourseContextOptional } from '../../middleware/student-course-context'
import { studentCourse } from '../../../utils/route/attach-route'

export default app => {
  app.post('/student-video-ratings/:video_id', authStudent, studentCourseContextOptional, route(Actions.createVideoRating, [user, customParam('video_id'), payloadValidate(Validation.createVideoRating), studentCourse]))
  app.get('/student-video-ratings/:video_id', authStudent, route(Actions.fetchVideoRating, [user, customParam('video_id')]))
  app.patch('/student-video-ratings/set-price', authAdmin, route(Actions.setPrice, [payloadValidate(Validation.setPrice)]))
}
