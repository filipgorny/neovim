import { Router } from 'express'
import { customParam, route, studentCourse, user } from '../../../utils/route/attach-route'
import { authRealStudent, authStudent } from '../../middleware/authorize'
import Actions from './actions'
import { studentCourseContext } from '../../middleware/student-course-context'

export default (app: Router): void => {
  app.get('/student-favourite-videos', authStudent, studentCourseContext, route(Actions.getAllStudentFavouriteVideos, [user, studentCourse]))
  app.get('/student-favourite-videos/count', authStudent, studentCourseContext, route(Actions.countFavouriteVideos, [user, studentCourse]))

  app.post('/student-favourite-videos/resource/:resource_id/mark-as-favourite', authRealStudent, studentCourseContext, route(Actions.markVideoResourceAsFavourite, [user, customParam('resource_id'), studentCourse]))
  app.post('/student-favourite-videos/resource/:resource_id/unmark-as-favourite', authRealStudent, studentCourseContext, route(Actions.unmarkVideoResourceAsFavourite, [user, customParam('resource_id'), studentCourse]))
}
