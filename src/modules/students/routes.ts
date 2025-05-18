import {
  route,
  query,
  request,
  user,
  payload,
  impersonate,
  customParam,
  id,
  routeRaw,
  preview,
  studentId,
  userId,
  payloadValidate,
  studentCourse,
  fetchQuery,
  student,
  admin
} from '../../../utils/route/attach-route'
import * as R from 'ramda'
import { authStudent, authRealStudent, Role, allow, authMasterAdmin, authAdmin } from '../../middleware/authorize'
import { studentCourseContext, studentCourseContextOptional } from '../../middleware/student-course-context'
import syncStudent from './actions/sync-student'
import fetchExams from './actions/fetch-exams'
import refreshToken from './actions/refresh-token'
import getProfile from './actions/get-profile'
import changeTargetScore from './actions/change-target-score'
import changeSectionTargetScore from './actions/change-section-target-score'
import resetTargetScore from './actions/reset-target-score'
import fetchExamsNav from './actions/fetch-exams-nav'
import fetchAllStudents from './actions/fetch-all-students'
import bulkSetIsActive from './actions/bulk-set-is-active'
import setIsActive from './actions/set-is-active'
import exportCsv from './actions/export-csv'
import fetchSaltyBucksLogs from './actions/fetch-salty-bucks-logs'
import deleteStudents from './actions/delete-students'
import setSaltyBucksBalance from './actions/set-salty-bucks-balance'
import bumpSiteActivity from './actions/bump-site-activity'
import setFlashcardStudyMode from './actions/set-flashcard-study-mode'
import getStudentBasicProfile from './actions/get-student-basic-profile'
import getStudentCourses from './actions/get-student-courses'
import getStudentExams from './actions/get-student-exams'
import getStudentBooks from './actions/get-student-books'
import addProducts from './actions/add-products'
import addProductsInBulk from './actions/add-products-in-bulk'
import addUsername from './actions/add-username'
import getSaltyBucksGraph from './actions/get-salty-bucks-graph'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import setExternalId from './actions/set-external-id'
import upsertWithExternalId from './actions/upsert-with-external-id'
import purchaseProducts from './actions/purchase-products'
import attachProducts from './actions/attach-products'
import attachProductsByAdmin from './actions/attach-products-by-admin'
import attachBulkProductsByAdmin from './actions/attach-bulk-products-by-admin'
import markSupportTabAsSeen from './actions/mark-support-tab-as-seen'
import emailExists from './actions/email-exists'
import setTimezone from './actions/set-timezone'
import useDefaultTimezone from './actions/use-default-timezone'
import dontUseDefaultTimezone from './actions/dont-use-default-timezone'
import setVideoBgMusic from './actions/set-video-bg-music'
import setCqAnimations from './actions/set-cq-animations'
import fetchAllStudentsV2 from './actions/fetch-all-students-v2'
import getStudentClasses from './actions/get-student-classes'
import setTheme from './actions/set-theme'
import transferProducts from './actions/transfer-products'
import markOnboardingAsSeen from './actions/mark-onboarding-as-seen'
import createStudent from './actions/create-student'
import hasProducts from './actions/has-products'
import cashOutWallet from './actions/cash-out-wallet'
import updateProfile from './actions/update-profile'
import updateExternalId from './actions/update-external-id'
import fetchAllStudentsV3 from './actions/fetch-all-students-v3'
import freezeAccount from './actions/freeze-account'
import unfreezeAccount from './actions/unfreeze-account'
import markIsGettingStartedAsCompleted from './actions/mark-is-getting-started-as-completed'
import markIsGettingStartedAsIncomplete from './actions/mark-is-getting-started-as-incomplete'
import setAdminNote from './actions/set-admin-note'

import { schema as changeTargetScoreSchema } from './validation/schema/change-target-score-schema'
import { schema as changeSectionTargetScoreSchema } from './validation/schema/change-section-target-score-schema'
import { schema as bulkSetIsActiveSchema } from './validation/schema/bulk-set-is-active-schema'
import { schema as bumpSiteActivitySchema } from './validation/schema/bump-site-activity-schema'
import { schema as deleteStudentsSchema } from './validation/schema/delete-students-schema'
import { schema as addProductsSchema } from './validation/schema/add-products-schema'
import { schema as addUsernameSchema } from './validation/schema/add-username-schema'
import { schema as addProductsInBulkSchema } from './validation/schema/add-products-in-bulk-schema'
import { schema as purchaseProductsSchema } from './validation/schema/purchase-products-schema'
import { schema as purchaseBulkProductsSchema } from './validation/schema/purchase-bulk-products-schema'
import { schema as setTimezoneSchema } from './validation/schema/set-timezone-schema'
import { schema as setVideoBgMusicSchema } from './validation/schema/set-video-bg-music-schema'
import { schema as setCqAnimationsSchema } from './validation/schema/set-cq-animations-schema'
import { schema as setThemeSchema } from './validation/schema/set-theme-schema'
import { schema as createStudentSchema } from './validation/schema/create-student-schema'
import { schema as updateProfileSchema } from './validation/schema/update-profile-schema'
import { schema as freezeAccountSchema } from './validation/schema/freeze-account-schema'
import { schema as setAdminNoteSchema } from './validation/schema/set-admin-note-schema'
import fetchStandaloneExams from './actions/fetch-standalone-exams'

export default app => {
  app.post('/students', authMasterAdmin, route(createStudent, [payloadValidate(createStudentSchema)]))
  app.post('/students/sync-student', route(syncStudent, [request]))
  app.post('/students/refresh-token', authStudent, route(refreshToken, [user, impersonate, preview]))
  app.post('/students/export-csv', permCheck(GlobalPerms.S), routeRaw(exportCsv, [payload]))
  app.post('/students/bulk/products', permCheck(GlobalPerms.S), route(addProductsInBulk, [payloadValidate(addProductsInBulkSchema)])) // old way of adding products
  app.post('/students/:id/products', permCheck(GlobalPerms.S), route(addProducts, [id, payloadValidate(addProductsSchema)])) // old way of adding products
  app.post('/students/bulk/attach-products', permCheck(GlobalPerms.S), route(attachBulkProductsByAdmin, [payloadValidate(purchaseBulkProductsSchema)]))
  app.post('/students/:id/attach-products', permCheck(GlobalPerms.S), route(attachProductsByAdmin, [id, payloadValidate(purchaseProductsSchema)]))
  app.post('/students/purchase-products', route(purchaseProducts, [request, payloadValidate(purchaseProductsSchema)]))
  app.post('/students/attach-products', authStudent, route(attachProducts, [user, payloadValidate(purchaseProductsSchema)]))
  app.post('/students/create-account', route(upsertWithExternalId, [request]))
  app.post('/students/wallet/cash-out', authStudent, route(cashOutWallet, [user]))
  app.post('/students/transfer-products/from/:from_student_id/to/:to_student_id', authMasterAdmin, route(transferProducts, [customParam('from_student_id'), customParam('to_student_id')]))

  app.get('/students', authAdmin, route(fetchAllStudents, [fetchQuery]))
  app.get('/students/v2', permCheck(GlobalPerms.S), route(fetchAllStudentsV2, [query]))
  app.get('/students/v3', authAdmin, route(fetchAllStudentsV3, [user, query]))
  app.get('/students/exams', authStudent, studentCourseContextOptional, route(fetchExams, [user, query, studentCourse]))
  app.get('/students/profile', authStudent, route(getProfile, [student, impersonate, preview]))
  app.get('/students/exams/nav', authStudent, route(fetchExamsNav, [user]))
  app.get('/students/:id/salty-bucks-logs', allow(Role.igor, Role.retail), route(fetchSaltyBucksLogs, [id, query]))
  app.get('/students/salty-bucks-logs', authStudent, route(fetchSaltyBucksLogs, [studentId, query]))
  app.get('/students/:id/profile', permCheck(GlobalPerms.S), route(getStudentBasicProfile, [id]))
  app.get('/students/:id/courses', permCheck(GlobalPerms.S), route(getStudentCourses, [id, query]))
  app.get('/students/:id/exams', permCheck(GlobalPerms.S), route(getStudentExams, [id, query]))
  app.get('/students/:id/books', permCheck(GlobalPerms.S), route(getStudentBooks, [id, query]))
  app.get('/students/:id/classes', permCheck(GlobalPerms.S), route(getStudentClasses, [id, query]))
  app.get('/students/:id/salty-bucks/:mode', permCheck(GlobalPerms.S), route(getSaltyBucksGraph, [id, query, customParam('mode')]))
  app.get('/students/email-exists', route(emailExists, [request]))
  app.get('/students/has-products', authStudent, route(hasProducts, [studentId]))
  app.get('/students/standalone-exams', authStudent, route(fetchStandaloneExams, [user]))

  app.patch('/students/change-target-score/:exam_type_id', authRealStudent, route(changeTargetScore, [user, payloadValidate(changeTargetScoreSchema), customParam('exam_type_id')]))
  app.patch('/students/change-section-target-score/:exam_type_id/:section_order', authRealStudent, route(changeSectionTargetScore, [user, payloadValidate(changeSectionTargetScoreSchema), customParam('exam_type_id'), customParam('section_order')]))
  app.patch('/students/reset-target-score/:exam_id', authRealStudent, route(resetTargetScore, [user, customParam('exam_id')]))
  app.patch('/students/bulk/is-active', permCheck(GlobalPerms.S), route(bulkSetIsActive, [payloadValidate(bulkSetIsActiveSchema)]))
  app.patch('/students/:id/is-active', permCheck(GlobalPerms.S), route(setIsActive, [id, payload]))
  app.patch('/students/:id/salty-bucks-balance', permCheck(GlobalPerms.S), route(setSaltyBucksBalance, [id, userId, payload]))
  app.patch('/students/bump-site-activity', authRealStudent, studentCourseContext, route(bumpSiteActivity, [user, payloadValidate(bumpSiteActivitySchema), studentCourse]))
  app.patch('/students/flashcard-study-mode/:mode', authRealStudent, route(setFlashcardStudyMode, [user, customParam('mode')]))
  app.patch('/students/delete', permCheck(GlobalPerms.S), route(deleteStudents, [payloadValidate(deleteStudentsSchema)]))
  app.patch('/students/username', authStudent, route(addUsername, [user, payloadValidate(addUsernameSchema)]))
  app.patch('/students/external-id', route(setExternalId, [request]))
  app.patch('/students/upsert-with-external-id', route(upsertWithExternalId, [request]))
  app.patch('/students/support-tab-seen', authStudent, route(markSupportTabAsSeen, [user]))
  app.patch('/students/timezone', authStudent, route(setTimezone, [userId, payloadValidate(setTimezoneSchema)]))
  app.patch('/students/:id/timezone', permCheck(GlobalPerms.S), route(setTimezone, [id, payloadValidate(setTimezoneSchema)]))
  app.patch('/students/use-default-timezone', authStudent, route(useDefaultTimezone, [userId]))
  app.patch('/students/:id/use-default-timezone', permCheck(GlobalPerms.S), route(useDefaultTimezone, [id]))
  app.patch('/students/dont-use-default-timezone', authStudent, route(dontUseDefaultTimezone, [userId]))
  app.patch('/students/:id/dont-use-default-timezone', permCheck(GlobalPerms.S), route(dontUseDefaultTimezone, [id]))
  app.patch('/students/set-video-bg-music', authStudent, route(setVideoBgMusic, [user, payloadValidate(setVideoBgMusicSchema)]))
  app.patch('/students/set-cq-animations', authStudent, route(setCqAnimations, [user, payloadValidate(setCqAnimationsSchema)]))
  app.patch('/students/set-theme', authStudent, route(setTheme, [user, payloadValidate(setThemeSchema)]))
  app.patch('/students/onboarding-seen', authStudent, route(markOnboardingAsSeen, [user]))
  app.patch('/students/:id/external-id', authMasterAdmin, route(updateExternalId, [id, payload]))
  app.patch('/students/:id/profile', authMasterAdmin, route(updateProfile, [id, payloadValidate(updateProfileSchema)]))
  app.patch('/students/getting-started-completed', authStudent, route(markIsGettingStartedAsCompleted, [user]))
  app.patch('/students/getting-started-incomplete', authStudent, route(markIsGettingStartedAsIncomplete, [user]))
  app.patch('/students/:id/freeze', authMasterAdmin, route(freezeAccount, [id, payloadValidate(freezeAccountSchema)]))
  app.patch('/students/:id/unfreeze', authMasterAdmin, route(unfreezeAccount, [id]))
  app.patch('/students/:id/admin-note', authMasterAdmin, route(setAdminNote, [id, payloadValidate(setAdminNoteSchema)]))
}
