import { id, payloadValidate, query, request, route, studentCourse, user, userId } from '../../../utils/route/attach-route'
import { authAdmin, authStudent, authRealStudent } from '../../middleware/authorize'
import { customParam, payload } from '@desmart/js-utils'
import { studentCourseContext } from '../../middleware/student-course-context'
import fetchAll from './actions/fetch-all'
import fetchOne from './actions/fetch-one'
import prepareCourse from './actions/prepare-course'
import setExpectedEndDate from './actions/set-expected-end-date'
import pauseCourse from './actions/pause-course'
import unpauseCourse from './actions/unpause-course'
import deleteStudentCourse from './actions/delete-student-course'
import setExpirationDate from './actions/set-expiration-date'
import setFlashcardCount from './actions/set-flashcard-count'
import setBookOrder from './actions/set-book-order'
import searchForPhrase from './actions/search-for-phrase'
import purchaseCourse from './actions/purchase-course'
import purchaseExtention from './actions/purchase-extention'
import extendCourse from './actions/extend-course'
import bulkExtendCourse from './actions/bulk-extend-course'
import detailsByTransaction from './actions/details-by-transaction'
import getClass from './actions/get-class'
import setCalendarStartDate from './actions/set-calendar-start-date'
import setExamDate from './actions/set-exam-date'
import rescheduleCalendar from './actions/reschedule-calendar'
import setPrioridays from './actions/set-prioridays'
import closeExtensionModal from './actions/close-extension-modal'
import snoozeCalendarArchiveModal from './actions/snooze-calendar-archive-modal'

import { schema as prepareCourseSchema } from './validation/schema/prepare-course-schema'
import { schema as setCalendarStartDateSchema } from './validation/schema/set-calendar-start-date-schema'
import { schema as setExamDateSchema } from './validation/schema/set-exam-date-schema'
import { schema as setExpectedEndDateSchema } from './validation/schema/set-expected-end-date-schema'
import { schema as setExpirationDateSchema } from './validation/schema/set-expiration-date-schema'
import { schema as setFlashcardCountSchema } from './validation/schema/set-flashcard-count-schema'
import { schema as setBookOrderSchema } from './validation/schema/set-book-order-schema'
import { schema as purchaseExtentionSchema } from './validation/schema/purchase-extention-schema'
import { schema as extendCourseSchema } from './validation/schema/extend-course-schema'
import { schema as bulkExtendCourseSchema } from './validation/schema/bulk-extend-course-schema'
import { schema as searchForPhraseSchema } from '../student-books/validation/schema/search-for-phrase-schema'
import { schema as rescheduleCalendarSchema } from './validation/schema/reschedule-calendar-schema'
import { schema as setPrioridaysSchema } from './validation/schema/set-prioridays-schema'
import { schema as snoozeCalendarArchiveModalSchema } from './validation/schema/snooze-calendar-archive-modal-schema'

export default app => {
  app.get('/student-courses', authStudent, route(fetchAll, [user, query]))
  app.get('/student-courses/:id', authStudent, route(fetchOne, [user, id]))
  app.get('/student-courses/:id/class', authStudent, route(getClass, [userId, id]))
  app.get('/student-courses/product/:external_id/transaction/:transaction_id', route(detailsByTransaction, [request, customParam('external_id'), customParam('transaction_id')]))

  app.post('/student-courses/purchase', route(purchaseCourse, [request, payload]))
  app.post('/student-courses/purchase-extention', route(purchaseExtention, [request, payloadValidate(purchaseExtentionSchema)]))
  app.post('/student-courses/extend', authAdmin, route(extendCourse, [payloadValidate(extendCourseSchema)]))
  app.post('/student-courses/bulk-extend', authAdmin, route(bulkExtendCourse, [payloadValidate(bulkExtendCourseSchema)]))
  app.post('/student-courses/:id/prepare', authStudent, route(prepareCourse, [user, id, payloadValidate(prepareCourseSchema)]))
  app.post('/student-courses/:id/search', authStudent, route(searchForPhrase, [id, payloadValidate(searchForPhraseSchema)]))

  app.patch('/student-courses/:id/set-expected-end-date', authStudent, route(setExpectedEndDate, [user, id, payloadValidate(setExpectedEndDateSchema)]))
  app.patch('/student-courses/:id/pause', authAdmin, route(pauseCourse, [id]))
  app.patch('/student-courses/:id/unpause', authAdmin, route(unpauseCourse, [id]))
  app.patch('/student-courses/:id/accessible-to', authAdmin, route(setExpirationDate, [id, payloadValidate(setExpirationDateSchema)]))
  app.patch('/student-courses/:id/flashcard-count', authRealStudent, route(setFlashcardCount, [user, id, payloadValidate(setFlashcardCountSchema)]))
  app.patch('/student-courses/:id/book-order', authStudent, route(setBookOrder, [user, id, payloadValidate(setBookOrderSchema)]))
  app.patch('/student-courses/:id/calendar-start-at', authStudent, route(setCalendarStartDate, [user, id, payloadValidate(setCalendarStartDateSchema)]))
  app.patch('/student-courses/:id/exam-date', authStudent, route(setExamDate, [user, id, payloadValidate(setExamDateSchema)]))
  app.patch('/student-courses/:id/reschedule-calendar', authStudent, route(rescheduleCalendar, [user, id, payloadValidate(rescheduleCalendarSchema)]))
  app.patch('/student-courses/:id/prioridays', authStudent, route(setPrioridays, [user, id, payloadValidate(setPrioridaysSchema)]))
  app.patch('/student-courses/close-extension-modal', authStudent, studentCourseContext, route(closeExtensionModal, [studentCourse]))
  app.patch('/student-courses/snooze-calendar-archive-modal', authStudent, studentCourseContext, route(snoozeCalendarArchiveModal, [studentCourse, payloadValidate(snoozeCalendarArchiveModalSchema)]))

  app.delete('/student-courses/:id', authAdmin, route(deleteStudentCourse, [id]))
}
