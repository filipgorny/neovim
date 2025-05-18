import { route, payloadValidate, customParam, query, id, files } from '@desmart/js-utils'
import Actions from './actions'
import Validation from './validation/schema'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import { looseBookOrGlobalPermission } from '../../middleware/book-permission'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'

export default app => {
  app.post('/course-topics/:course_id', permCheck(GlobalPerms.R), route(Actions.createCourseTopic, [customParam('course_id'), payloadValidate(Validation.createCourseTopic)]))
  app.post('/course-topics/:course_id/upload', permCheck(GlobalPerms.R), route(Actions.uploadCourseTopics, [customParam('course_id'), files]))
  app.post('/course-topics/:course_id/topic/:id', permCheck(GlobalPerms.R), route(Actions.createCourseTopicUnderGivenTopic, [customParam('course_id'), id, payloadValidate(Validation.createCourseTopic)]))

  app.get('/course-topics/:course_id', route(Actions.fetchAllCourseTopics, [customParam('course_id'), query]))
  app.get('/course-topics/:course_id/topic/:id', route(Actions.fetchOneCourseTopic, [customParam('course_id'), id]))
  app.get('/course-topics/:course_id/attached', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_course_topics, GlobalPerms.R), route(Actions.fetchCourseTopicsByBook, [customParam('course_id'), query]))

  app.patch('/course-topics/:course_id/topic/:id', permCheck(GlobalPerms.R), route(Actions.updateCourseTopic, [customParam('course_id'), id, payloadValidate(Validation.updateCourseTopic)]))
  app.patch('/course-topics/:course_id/topic/:id/reorder/:direction', permCheck(GlobalPerms.R), route(Actions.reorderTopic, [customParam('course_id'), id, customParam('direction')]))

  app.delete('/course-topics/:course_id/topic/:id', permCheck(GlobalPerms.R), route(Actions.deleteCourseTopic, [customParam('course_id'), id]))
  app.delete('/course-topics/:course_id', permCheck(GlobalPerms.R), route(Actions.deleteAllFromCourse, [customParam('course_id')]))
}
