// Routes
import healthcheckRoutes from './modules/healthcheck/routes'
import userRoutes from './modules/users/routes'
import adminsRoutes from './modules/admins/routes'
import examsRoutes from './modules/exams/routes'
import layoutsRoutes from './modules/layouts/routes'
import examSectionsRoutes from './modules/exam-sections/routes'
import examPassagesRoutes from './modules/exam-passages/routes'
import questionsRoutes from './modules/questions/routes'
import examQuestionsRoutes from './modules/exam-questions/routes'
import miscRoutes from './modules/misc/routes'
import settingsRoutes from './modules/settings/routes'
import studentsRoutes from './modules/students/routes'
import studentExamsRoutes from './modules/student-exams/routes'
import studentExamQuestionsRoutes from './modules/student-exam-questions/routes'
import studentExamSectionsRoutes from './modules/student-exam-sections/routes'
import scaledScoreTemplatesRoutes from './modules/scaled-score-templates/routes'
import scaledScoresRoutes from './modules/scaled-scores/routes'
import examMetricsRoutes from './modules/exam-metrics/routes'
import examMetricsAvgRoutes from './modules/exam-metrics-avg/routes'
import examTypesRoutes from './modules/exam-types/routes'
import percentileRanksRoutes from './modules/percentile-ranks/routes'
import examQuestionTimeMetricsRoutes from './modules/exam-question-time-metrics/routes'
import examPassageTimeMetricsRoutes from './modules/exam-passage-time-metrics/routes'
import coursesRoutes from './modules/courses/routes'
import booksRoutes from './modules/books/routes'
import bookChaptersRoutes from './modules/book-chapters/routes'
import bookSubchaptersRoutes from './modules/book-subchapters/routes'
import bookContenntRoutes from './modules/book-contents/routes'
import bookContentAttachmentsRoutes from './modules/book-content-attachments/routes'
import s3FilesRoutes from './modules/s3-files/routes'
import bookContentResourcesRoutes from './modules/book-content-resources/routes'
import glossaryRoutes from './modules/glossary/routes'
import bookContentQuestionsRoutes from './modules/book-content-questions/routes'
import bookContentImagesRoutes from './modules/book-content-images/routes'
import bookContentFlashcardsRoutes from './modules/flashcards/routes'
import videosRoutes from './modules/videos/routes'
import studentBooksRoutes from './modules/student-books/routes'
import studentBookSubchapterNotesRoutes from './modules/student-book-subchapter-notes/routes'
import studentBookContentsRoutes from './modules/student-book-contents/routes'
import studentBookContentAttachmentsRoutes from './modules/student-book-content-attachments/routes'
import studentBookChaptersRoutes from './modules/student-book-chapters/routes'
import appSettingsRoutes from './modules/app-settings/routes'
import studentBookContentResourcesRoutes from './modules/student-book-content-resources/routes'
import stopwatchesRoutes from './modules/stopwatches/routes'
import studentVideosRoutes from './modules/student-videos/routes'
import examIntroPagesRoutes from './modules/exam-intro-pages/routes'
import contentQuestionsRoutes from './modules/student-book-content-questions/routes'
import studentFlashcardsRoutes from './modules/student-book-content-flashcards/routes'
import courseMapRoutes from './modules/course-map/routes'
import studentCoursesRoutes from './modules/student-courses/routes'
import courseExtensionsRoutes from './modules/course-extensions/routes'
import dashboardRoutes from './modules/dashboard/routes'
import saltyBucksDailyLogRoutes from './modules/salty-bucks-daily-log/routes'
import contentQuestionReactionsRoutes from './modules/content-question-reactions/routes'
import examSectionScoresRoutes from './modules/exam-section-scores/routes'
import examScoresRoutes from './modules/exam-scores/routes'
import studentBookChapterActivityTimersRoutes from './modules/student-book-chapter-activity-timers/routes'
import studentBookActivityTimersRoutes from './modules/student-book-activity-timers/routes'
import studentCourseActivityTimersRoutes from './modules/student-course-activity-timers/routes'
import videoActivityTimersRoutes from './modules/video-activity-timers/routes'
import flashcardActivityTimersRoutes from './modules/flashcard-activity-timers/routes'
import bookChapterImagesRoutes from './modules/book-chapter-images/routes'
import studentBookChapterImagesRoutes from './modules/student-book-chapter-images/routes'
import studentBookContentPinsRoutes from './modules/student-book-content-pins/routes'
import studentPinVariantsRoutes from './modules/student-pin-variants/routes'
import studentBookContentsReadRoutes from './modules/student-book-contents-read/routes'
import aminoAcidGamesRoutes from './modules/amino-acid-games/routes'
import studentTokensRoutes from './modules/student-tokens/routes'
import gladiatorsSaltyBucksRoutes from './modules/gladiators-salty-bucks/routes'
import bookAdminsRoutes from './modules/book-admins/routes'
import userTokensRoutes from './modules/user-tokens/routes'
import courseTopicsRoutes from './modules/course-topics/routes'
import studentFlashcardBoxesRoutes from './modules/student-flashcard-boxes/routes'
import studentFlashcardArchiveRoutes from './modules/student-flashcard-archive/routes'
import quillRoutes from './modules/quill/routes'
import studentBoxFlashcardsRoutes from './modules/student-box-flashcards/routes'
import authDebugRoutes from './modules/auth-debug/routes'
import studentTwoFactorAuthenticationRoutes from './modules/student-two-factor-authentication/routes'
import bookContentCourseTopicsRoutes from './modules/book-content-course-topics/routes'
import studentCourseTopicsRoutes from './modules/student-course-topics/routes'
import studentBookContentCourseTopicsRoutes from './modules/student-book-content-course-topics/routes'
import productsRoutes from './modules/products/routes'
import attachedExamsRoutes from './modules/attached-exams/routes'
import bookContentCommentsRoutes from './modules/book-content-comments/routes'
import studentBookContentCommentsRoutes from './modules/student-book-content-comments/routes'
import examScoreStatsRoutes from './modules/exam-score-stats/routes'
import examSectionScoreMapRoutes from './modules/exam-section-score-map/routes'
import examScoreMapRoutes from './modules/exam-score-map/routes'
import supportTabRoutes from './modules/support-tab/routes'
import courseEndDatesRoutes from './modules/course-end-dates/routes'
import bookErratasRoutes from './modules/book-erratas/routes'
import examErratasRoutes from './modules/exam-erratas/routes'
import studentVideoRatingsRoutes from './modules/student-video-ratings/routes'
import studentFavouriteVideosRoutes from './modules/student-favourite-videos/routes'
import videoCategoriesRoutes from './modules/video-categories/routes'
import notificationsRoutes from './modules/notifications/routes'
import courseEndDateDaysRoutes from './modules/course-end-date-days/routes'
import socketServersRoutes from './modules/socket-servers/routes'
import studentNotificationsRoutes from './modules/student-notifications/routes'
import groupTutoringDaysRoutes from './modules/group-tutoring-days/routes'
import onboardingCategoriesRoutes from './modules/onboarding-categories/routes'
import onboardingImagesRoutes from './modules/onboarding-images/routes'
import memoryUsageRoutes from './modules/memory-usage/routes'
import favouriteVideosRoutes from './modules/favourite-videos/routes'
import respirationGamesRoutes from './modules/respiration-games/routes'
import hangmanPhrasesRoutes from './modules/hangman-phrases/routes'
import hangmanHintsRoutes from './modules/hangman-hints/routes'
import hangmanGamesRoutes from './modules/hangman-games/routes'
import hangmanAnsweredPhrasesRoutes from './modules/hangman-answered-phrases/routes'
import studentCalendarEventsRoutes from './modules/student-calendar-events/routes'
import studentCalendarDaysOffRoutes from './modules/student-calendar-days-off/routes'
import calendarChaptersRoutes from './modules/calendar-chapters/routes'
import calendarFullExamsRoutes from './modules/calendar-full-exams/routes'
import calendarSettingsRoutes from './modules/calendar-settings/routes'
import calendarSectionExamsRoutes from './modules/calendar-section-exams/routes'
import calendarChapterExamsRoutes from './modules/calendar-chapter-exams/routes'
import studentCourseEndDateDaysRoutes from './modules/student-course-end-date-days/routes'
import organizationsRoutes from './modules/organizations/routes'
import organizationAdminsRoutes from './modules/organization-admins/routes'
import chatBotRoutes from './modules/chat-bot/routes'
import chatHistoryRoutes from './modules/chat-history/routes'
import chatChapterScoresRoutes from './modules/chat-chapter-scores/routes'
import mcatDatesRoutes from './modules/mcat-dates/routes'
import customEventGroupsRoutes from './modules/custom-event-groups/routes'
import customEventTypesRoutes from './modules/custom-event-types/routes'
import studentBookVideosRoutes from './modules/student-book-videos/routes'
import studentTasksRoutes from './modules/student-tasks/routes'
import e2ERoutes from './modules/e2e/routes'
import adminCoursesRoutes from './modules/admin-courses/routes'
import courseTutorsRoutes from './modules/course-tutors/routes'
import aiTutorScoresRoutes from './modules/ai-tutor-scores/routes'
// [CREATE-MODULE:route-import] - DO NOT EDIT THIS LINE

const routes = [
  healthcheckRoutes,
  userRoutes,
  adminsRoutes,
  examsRoutes,
  layoutsRoutes,
  examSectionsRoutes,
  examPassagesRoutes,
  questionsRoutes,
  examQuestionsRoutes,
  miscRoutes,
  settingsRoutes,
  studentsRoutes,
  studentExamsRoutes,
  studentExamQuestionsRoutes,
  studentExamSectionsRoutes,
  scaledScoreTemplatesRoutes,
  scaledScoresRoutes,
  examMetricsRoutes,
  examMetricsAvgRoutes,
  examTypesRoutes,
  percentileRanksRoutes,
  examQuestionTimeMetricsRoutes,
  examPassageTimeMetricsRoutes,
  coursesRoutes,
  booksRoutes,
  bookChaptersRoutes,
  bookSubchaptersRoutes,
  bookContenntRoutes,
  bookContentAttachmentsRoutes,
  s3FilesRoutes,
  bookContentResourcesRoutes,
  glossaryRoutes,
  bookContentQuestionsRoutes,
  bookContentImagesRoutes,
  bookContentFlashcardsRoutes,
  videosRoutes,
  studentBooksRoutes,
  studentBookSubchapterNotesRoutes,
  studentBookContentsRoutes,
  studentBookContentAttachmentsRoutes,
  studentBookChaptersRoutes,
  appSettingsRoutes,
  studentBookContentResourcesRoutes,
  stopwatchesRoutes,
  studentVideosRoutes,
  examIntroPagesRoutes,
  contentQuestionsRoutes,
  studentFlashcardsRoutes,
  courseMapRoutes,
  studentCoursesRoutes,
  courseExtensionsRoutes,
  dashboardRoutes,
  saltyBucksDailyLogRoutes,
  contentQuestionReactionsRoutes,
  examSectionScoresRoutes,
  examScoresRoutes,
  studentBookChapterActivityTimersRoutes,
  studentBookActivityTimersRoutes,
  studentCourseActivityTimersRoutes,
  videoActivityTimersRoutes,
  flashcardActivityTimersRoutes,
  bookChapterImagesRoutes,
  studentBookChapterImagesRoutes,
  studentBookContentPinsRoutes,
  studentPinVariantsRoutes,
  studentBookContentsReadRoutes,
  aminoAcidGamesRoutes,
  studentTokensRoutes,
  gladiatorsSaltyBucksRoutes,
  bookAdminsRoutes,
  userTokensRoutes,
  courseTopicsRoutes,
  studentFlashcardBoxesRoutes,
  studentFlashcardArchiveRoutes,
  quillRoutes,
  studentBoxFlashcardsRoutes,
  authDebugRoutes,
  studentTwoFactorAuthenticationRoutes,
  bookContentCourseTopicsRoutes,
  studentCourseTopicsRoutes,
  studentBookContentCourseTopicsRoutes,
  productsRoutes,
  attachedExamsRoutes,
  bookContentCommentsRoutes,
  studentBookContentCommentsRoutes,
  examScoreStatsRoutes,
  examSectionScoreMapRoutes,
  examScoreMapRoutes,
  supportTabRoutes,
  courseEndDatesRoutes,
  bookErratasRoutes,
  examErratasRoutes,
  studentVideoRatingsRoutes,
  studentFavouriteVideosRoutes,
  videoCategoriesRoutes,
  notificationsRoutes,
  courseEndDateDaysRoutes,
  socketServersRoutes,
  studentNotificationsRoutes,
  groupTutoringDaysRoutes,
  onboardingCategoriesRoutes,
  onboardingImagesRoutes,
  memoryUsageRoutes,
  favouriteVideosRoutes,
  respirationGamesRoutes,
  hangmanPhrasesRoutes,
  hangmanHintsRoutes,
  hangmanGamesRoutes,
  hangmanAnsweredPhrasesRoutes,
  studentCalendarEventsRoutes,
  studentCalendarDaysOffRoutes,
  calendarChaptersRoutes,
  calendarFullExamsRoutes,
  calendarSettingsRoutes,
  calendarSectionExamsRoutes,
  calendarChapterExamsRoutes,
  studentCourseEndDateDaysRoutes,
  organizationsRoutes,
  organizationAdminsRoutes,
  chatBotRoutes,
  chatHistoryRoutes,
  chatChapterScoresRoutes,
  mcatDatesRoutes,
  customEventGroupsRoutes,
  customEventTypesRoutes,
  studentBookVideosRoutes,
  studentTasksRoutes,
  e2ERoutes,
  adminCoursesRoutes,
  courseTutorsRoutes,
  aiTutorScoresRoutes,
// [CREATE-MODULE:route-bind] - DO NOT EDIT THIS LINE
]

export const attachRoutes = (app: any) => {
  routes.forEach(route => route(app))
}
