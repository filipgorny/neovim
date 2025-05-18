// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts = require('prompts')
import questions from './questions'
import { dispatchExamExpirationTwoDays, dispatchExamExpiredToday } from '../../services/student-exams/dispatch-expiration-notifications'
import { evaluateScoreCalculationsEnabled } from '../../services/exam-types/evaluate-score-calculations-enabled'
import { calculatePercentileRank } from '../../services/percentile-rank/calculate-sections-percentile-rank'
import { calculateStudentExamScores } from '../../services/student-exams/calculate-student-exam-scores'
import { logDailySaltyBucksBalance } from '../../services/salty-bucks/log-daily-balance'
import { updateExpiredStudentCourses } from '../../services/student-course/expire-course'
import { copyUnlockedBooks } from '../../services/books/copy-book/copy-unlocked-books'
import { dispatchCourseExpirationThreeDays } from '../../services/student-course/dispatch-course-expiration-notifications'
import { calculateTemperature } from '../../services/completion-meter/temperature-service'
import { calculateOilLevel } from '../../services/completion-meter/oil-service'
import { deleteOldArchivedOrSoftDeletedUnlockedBooksCompletely } from '../../src/modules/books/book-service'
import { calculatePercentileRanks } from '../../services/exam-score-maps/calculate-percentile-ranks'
import { removeOutdatedExams } from '../../services/student-exams/remove-outdated-exams'
import { sendOutNotifications } from '../../src/modules/notifications/notifications-service'
import { removeOldNotifications } from '../../src/modules/notifications/notifications-repository'
import { removeOldStudentNotifications } from '../../src/modules/student-notifications/student-notifications-repository'
import { registerSocketClient } from '../../src/sockets/socket-client'
import { deleteFirstSoftlyRemovedStudentCourse } from '../../src/modules/student-courses/student-course-repository'
import { rescheduleIncompleteEvents } from '../../services/student-calendar-events/reschedule-incomplete-events'
import { removeOutdatedAccounts } from '../../services/students/remove-outdated-accounts'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
registerSocketClient();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const serviceMap = {
      dispatchExamExpirationTwoDays,
      dispatchExamExpiredToday,
      evaluateScoreCalculationsEnabled,
      calculatePercentileRank,
      calculateStudentExamScores,
      logDailySaltyBucksBalance,
      updateExpiredStudentCourses,
      copyUnlockedBooks,
      dispatchCourseExpirationThreeDays,
      calculateTemperature,
      calculateOilLevel,
      deleteOldArchivedOrSoftDeletedUnlockedBooksCompletely,
      calculatePercentileRanks,
      removeOutdatedExams,
      sendOutNotifications,
      removeOldNotifications,
      removeOldStudentNotifications,
      deleteFirstSoftlyRemovedStudentCourse,
      rescheduleIncompleteEvents,
      removeOutdatedAccounts,
    }

    const { value } = await prompts(questions)

    await serviceMap[value]()

    console.log(`Launched ${value} job.`)

    setTimeout(() => process.exit(0), 3000)
  }
)()
