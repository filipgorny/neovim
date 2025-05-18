import { files, id, payloadValidate, query, route, user } from '@desmart/js-utils'
import { authAdmin } from '../../middleware/authorize'
import { GlobalPerms } from '../admins/admin-global-permissions'
import Validation from './validation/schema'
import createVideo from './actions/create-video'
import fetchVideos from './actions/fetch-videos'
import removeVideo from './actions/remove-video'
import updateVideo from './actions/update-video'
import getVideo from './actions/get-video'
import setFakeRating from './actions/set-fake-rating'
import toggleFakeRating from './actions/toggle-fake-rating'
import { permCheckSoft } from '../../middleware/global-permission'
import { checkCourseAdminByPayload, checkCourseAdminComplex } from '../../middleware/check-course-admin'
import { findOne as findVideo } from './video-repository'

export default app => {
  app.post('/videos', authAdmin, permCheckSoft(GlobalPerms.V), checkCourseAdminByPayload(['course_id'], [GlobalPerms.V]), route(createVideo, [files, payloadValidate(Validation.createVideo)]))

  app.patch('/videos/:id', authAdmin, permCheckSoft(GlobalPerms.V), checkCourseAdminComplex(findVideo, ['params', 'id'], ['course_id'], [], [GlobalPerms.V]), route(updateVideo, [id, files, payloadValidate(Validation.updateVideo)]))
  app.patch('/videos/:id/fake-rating', authAdmin, permCheckSoft(GlobalPerms.V), checkCourseAdminComplex(findVideo, ['params', 'id'], ['course_id'], [], [GlobalPerms.V]), route(setFakeRating, [id, payloadValidate(Validation.setFakeRating)]))
  app.patch('/videos/:id/toggle-fake-rating', authAdmin, permCheckSoft(GlobalPerms.V), checkCourseAdminComplex(findVideo, ['params', 'id'], ['course_id'], [], [GlobalPerms.V]), route(toggleFakeRating, [id, payloadValidate(Validation.toggleFakeRating)]))

  app.get('/videos', authAdmin, route(fetchVideos, [query, user]))
  app.get('/videos/:id', route(getVideo, [id]))

  app.delete('/videos/:id', authAdmin, permCheckSoft(GlobalPerms.V), checkCourseAdminComplex(findVideo, ['params', 'id'], ['course_id'], [], [GlobalPerms.V]), route(removeVideo, [id]))
}
