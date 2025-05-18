import { payloadValidate, route } from '../../../utils/route/attach-route'
import { authMasterAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.patch('/support-tab/contact-us-link', authMasterAdmin, route(Actions.setContactUsLink, [payloadValidate(Validation.linkSchema)]))
  app.patch('/support-tab/help-center-link', authMasterAdmin, route(Actions.setHelpCenterLink, [payloadValidate(Validation.linkSchema)]))
  app.patch('/support-tab/share-with-community-link', authMasterAdmin, route(Actions.setShareWithCommunityLink, [payloadValidate(Validation.linkSchema)]))
  app.patch('/support-tab/status-page-link', authMasterAdmin, route(Actions.setStatusPageLink, [payloadValidate(Validation.linkSchema)]))
  app.patch('/support-tab/training-tutorials-link', authMasterAdmin, route(Actions.setTrainingTutorialsLink, [payloadValidate(Validation.linkSchema)]))
  app.patch('/support-tab/getting-started-link', authMasterAdmin, route(Actions.setGettingStartedLink, [payloadValidate(Validation.linkSchema)]))

  app.get('/support-tab/contact-us-link', authStudentOrAdmin, route(Actions.getContactUsLink))
  app.get('/support-tab/help-center-link', authStudentOrAdmin, route(Actions.getHelpCenterLink))
  app.get('/support-tab/share-with-community-link', authStudentOrAdmin, route(Actions.getShareWithCommunityLink))
  app.get('/support-tab/status-page-link', authStudentOrAdmin, route(Actions.getStatusPageLink))
  app.get('/support-tab/training-tutorials-link', authStudentOrAdmin, route(Actions.getTrainingTutorialsLink))
  app.get('/support-tab/getting-started-link', authStudentOrAdmin, route(Actions.getGettingStartedLink))

  app.get('/support-tab', authStudentOrAdmin, route(Actions.getSupportTabLinks))
}
