import bookshelf from '../db-config'

import UserModel from './user'
import AdminModel from './admin'
import ExamModel from './exam'
import LayoutModel from './layout'
import ExamSectionModel from './exam-section'
import ExamPassageModel from './exam-passage'
import QuestionModel from './question'
import ExamQuestionModel from './exam-question'
import ExamLogModel from './exam-log'
import StudentModel from './student'
import StudentExamModel from './student-exam'
import StudentExamSectionModel from './student-exam-section'
import StudentExamPassageModel from './student-exam-passage'
import StudentExamQuestionModel from './student-exam-question'
import ExamTypeModel from './exam-type'
import ScaledScoreTemplateModel from './scaled-score-template'
import ScaledScoreModel from './scaled-score'
import ExamMetricsModel from './exam-metrics'
import ExamMetricsAvgModel from './exam-metrics-avg'
import ExamPassageMetricsModel from './exam-passage-metrics'
import ExamPassageMetricsAvgModel from './exam-passage-metrics-avg'
import StudentExamScoreModel from './student-exam-scores'
import StudentExamLogModel from './student-exam-logs'
import PercentileRankModel from './percentile-rank'
import ExamTypeScaledScoreTemplateModel from './exam-type-scaled-score-templates'
import ExamQuestionTimeMetricsModel from './exam-question-time-metrics'
import ExamPassageTimeMetricsModel from './exam-passage-time-metrics'
import CourseModel from './course'
import BookModel from './book'
import BookChapterModel from './book-chapter'
import BookSubchapterModel from './book-subchapter'
import BookContentModel from './book-content'
import bookContentAttachmentModel from './book-content-attachment'
import s3FileModel from './s3-file'
import BookContentResourceModel from './book-content-resource'
import GlossaryModel from './glossary'
import BookContentQuestionModel from './book-content-question'
import BookContentImageModel from './book-content-image'
import BookContentFlashcardModel from './flashcard'
import BookContentFlashcardModelReal from './book-content-flashcard'
import VideoModel from './video'
import StudentBookModel from './student-book'
import StudentBookChapterModel from './student-book-chapter'
import StudentBookSubchapterModel from './student-book-subchapter'
import StudentBookContentModel from './student-book-content'
import StudentBookContentFlashcardModel from './student-book-content-flashcard'
import StudentBookContentAttachmentModel from './student-book-content-attachment'
import StudentBookContentImageModel from './student-book-content-image'
import StudentBookContentResourceModel from './student-book-content-resource'
import StudentBookContentQuestionModel from './student-book-content-question'
import AttachedExamModel from './attached-exam'
import StudentBookSubchapterNoteModel from './student-book-subchapter-note'
import SaltyBucksLogModel from './salty-bucks-log'
import appSettingModel from './app-setting'
import stopwatchModel from './stopwatch'
import ExamIntroPageModel from './exam-intro-page'
import courseMapModel from './course-map'
import studentCourseModel from './student-course'
import StudentAttachedExamModel from './student-attached-exam'
import courseExtensionModel from './course-extension'
import courseBooknModel from './course-book'
import chapterAdminModel from './chapter-admin'
import saltyBucksDailyLogModel from './salty-bucks-daily-log'
import contentQuestionReactionModel from './content-question-reaction'
import examSectionScoreModel from './exam-section-score'
import examScoreModel from './exam-score'
import studentBookChapterActivityTimerModel from './student-book-chapter-activity-timer'
import studentBookActivityTimerModel from './student-book-activity-timer'
import studentCourseActivityTimerModel from './student-course-activity-timer'
import videoActivityTimerModel from './video-activity-timer'
import flashcardActivityTimerModel from './flashcard-activity-timer'
import bookChapterImageModel from './book-chapter-image'
import studentBookChapterImageModel from './student-book-chapter-image'
import studentBookContentPinModel from './student-book-content-pin'
import studentPinVariantModel from './student-pin-variant'
import studentCompletionMeterModel from './student-completion-meter'
import studentBookContentsReadModel from './student-book-contents-read'
import aminoAcidGameModel from './amino-acid-game'
import studentTokenModel from './student-token'
import bookAdminModel from './book-admin'
import userTokenModel from './user-token'
import courseTopicModel from './course-topic'
import studentFlashcardBoxModel from './student-flashcard-box'
import studentFlashcardArchiveModel from './student-flashcard-archive'
import studentBoxFlashcardModel from './student-box-flashcard'
import authDebugModel from './auth-debug'
import bookContentCourseTopicModel from './book-content-course-topic'
import studentCourseTopicModel from './student-course-topic'
import studentBookContentCourseTopicModel from './student-book-content-course-topic'
import bookContentCommentModel from './book-content-comment'
import studentBookContentCommentModel from './student-book-content-comment'
import examScoreStatModel from './exam-score-stat'
import examSectionScoreMapModel from './exam-section-score-map'
import examScoreMapModel from './exam-score-map'
import courseEndDateModel from './course-end-date'
import bookErrataModel from './book-errata'
import examErrataModel from './exam-errata'
import studentVideoRatingModel from './student-video-rating'
import studentFavouriteVideoModel from './student-favourite-video'
import videoCategoryModel from './video-category'
import notificationModel from './notification'
import courseEndDateDayModel from './course-end-date-day'
import studentNotificationModel from './student-notification'
import groupTutoringDayModel from './group-tutoring-day'
import onboardingCategoryModel from './onboarding-category'
import onboardingImageModel from './onboarding-image'
import studentVideoModel from './student-video'
import favouriteVideoModel from './favourite-video'
import respirationGameModel from './respiration-game'
import hangmanPhraseModel from './hangman-phrase'
import hangmanHintModel from './hangman-hint'
import hangmanGameModel from './hangman-game'
import hangmanAnsweredPhrasesModel from './hangman-answered-phrases'
import studentCalendarEventModel from './student-calendar-event'
import studentCalendarDaysOffModel from './student-calendar-days-off'
import calendarChapterModel from './calendar-chapter'
import calendarFullExamModel from './calendar-full-exam'
import calendarSettingModel from './calendar-setting'
import calendarSectionExamModel from './calendar-section-exam'
import calendarChapterExamModel from './calendar-chapter-exam'
import studentCourseEndDateDayModel from './student-course-end-date-day'
import organizationModel from './organization'
import organizationAdminModel from './organization-admin'
import chatHistoryModel from './chat-history'
import chatChapterScoreModel from './chat-chapter-score'
import mcatDateModel from './mcat-date'
import customEventGroupModel from './custom-event-group'
import customEventTypeModel from './custom-event-type'
import studentBookVideoModel from './student_book_video'
import taskModel from './task'
import studentTaskModel from './student-task'
import studentExamCompletion from './student-exam-completion'
import adminCourseModel from './admin-course'
import courseTutorModel from './course-tutor'
import aiTutorScoreModel from './ai-tutor-score'
// [CREATE-MODULE:model-import] - DO NOT EDIT THIS LINE

import BookScanListViewModel from './views/glossary-scan-list-view'
import FlashcardListViewModel from './views/flashcard-list-view'

export const User = UserModel(bookshelf)
export const Admin = AdminModel(bookshelf)
export const Exam = ExamModel(bookshelf)
export const Layout = LayoutModel(bookshelf)
export const ExamSection = ExamSectionModel(bookshelf)
export const ExamPassage = ExamPassageModel(bookshelf)
export const Question = QuestionModel(bookshelf)
export const ExamQuestion = ExamQuestionModel(bookshelf)
export const ExamLog = ExamLogModel(bookshelf)
export const Student = StudentModel(bookshelf)
export const StudentExam = StudentExamModel(bookshelf)
export const StudentExamSection = StudentExamSectionModel(bookshelf)
export const StudentExamPassage = StudentExamPassageModel(bookshelf)
export const StudentExamQuestion = StudentExamQuestionModel(bookshelf)
export const ExamType = ExamTypeModel(bookshelf)
export const ScaledScoreTemplate = ScaledScoreTemplateModel(bookshelf)
export const ScaledScore = ScaledScoreModel(bookshelf)
export const ExamMetrics = ExamMetricsModel(bookshelf)
export const ExamMetricsAvg = ExamMetricsAvgModel(bookshelf)
export const ExamPassageMetrics = ExamPassageMetricsModel(bookshelf)
export const ExamPassageMetricsAvg = ExamPassageMetricsAvgModel(bookshelf)
export const StudentExamScore = StudentExamScoreModel(bookshelf)
export const StudentExamLog = StudentExamLogModel(bookshelf)
export const PercentileRank = PercentileRankModel(bookshelf)
export const ExamTypeScaledScoreTemplate = ExamTypeScaledScoreTemplateModel(bookshelf)
export const ExamQuestionTimeMetrics = ExamQuestionTimeMetricsModel(bookshelf)
export const ExamPassageTimeMetrics = ExamPassageTimeMetricsModel(bookshelf)
export const Course = CourseModel(bookshelf)
export const Book = BookModel(bookshelf)
export const BookChapter = BookChapterModel(bookshelf)
export const BookSubchapter = BookSubchapterModel(bookshelf)
export const BookContent = BookContentModel(bookshelf)
export const bookContentAttachment = bookContentAttachmentModel(bookshelf)
export const s3File = s3FileModel(bookshelf)
export const BookContentResource = BookContentResourceModel(bookshelf)
export const Glossary = GlossaryModel(bookshelf)
export const BookContentQuestion = BookContentQuestionModel(bookshelf)
export const BookContentImage = BookContentImageModel(bookshelf)
export const BookContentFlashcard = BookContentFlashcardModel(bookshelf)
export const BookContentFlashcardReal = BookContentFlashcardModelReal(bookshelf)
export const Video = VideoModel(bookshelf)
export const StudentBook = StudentBookModel(bookshelf)
export const StudentBooksChapter = StudentBookChapterModel(bookshelf)
export const StudentBookSubchapter = StudentBookSubchapterModel(bookshelf)
export const StudentBookContent = StudentBookContentModel(bookshelf)
export const StudentBookContentFlashcard = StudentBookContentFlashcardModel(bookshelf)
export const StudentBookContentAttachment = StudentBookContentAttachmentModel(bookshelf)
export const StudentBookContentImage = StudentBookContentImageModel(bookshelf)
export const StudentBookContentResource = StudentBookContentResourceModel(bookshelf)
export const StudentBookContentQuestion = StudentBookContentQuestionModel(bookshelf)
export const AttachedExam = AttachedExamModel(bookshelf)
export const StudentBookSubchapterNote = StudentBookSubchapterNoteModel(bookshelf)
export const SaltyBucksLog = SaltyBucksLogModel(bookshelf)
export const AppSetting = appSettingModel(bookshelf)
export const Stopwatch = stopwatchModel(bookshelf)
export const ExamIntroPage = ExamIntroPageModel(bookshelf)
export const CourseMap = courseMapModel(bookshelf)
export const StudentCourse = studentCourseModel(bookshelf)
export const StudentAttachedExam = StudentAttachedExamModel(bookshelf)
export const CourseExtension = courseExtensionModel(bookshelf)
export const CourseBook = courseBooknModel(bookshelf)
export const ChapterAdmin = chapterAdminModel(bookshelf)
export const SaltyBucksDailyLog = saltyBucksDailyLogModel(bookshelf)
export const ContentQuestionReaction = contentQuestionReactionModel(bookshelf)
export const ExamSectionScore = examSectionScoreModel(bookshelf)
export const ExamScore = examScoreModel(bookshelf)
export const StudentBookChapterActivityTimer = studentBookChapterActivityTimerModel(bookshelf)
export const StudentBookActivityTimer = studentBookActivityTimerModel(bookshelf)
export const StudentCourseActivityTimer = studentCourseActivityTimerModel(bookshelf)
export const VideoActivityTimer = videoActivityTimerModel(bookshelf)
export const FlashcardActivityTimer = flashcardActivityTimerModel(bookshelf)
export const BookChapterImage = bookChapterImageModel(bookshelf)
export const StudentBookChapterImage = studentBookChapterImageModel(bookshelf)
export const StudentBookContentPin = studentBookContentPinModel(bookshelf)
export const StudentPinVariant = studentPinVariantModel(bookshelf)
export const StudentCompletionMeter = studentCompletionMeterModel(bookshelf)
export const StudentBookContentsRead = studentBookContentsReadModel(bookshelf)
export const AminoAcidGame = aminoAcidGameModel(bookshelf)
export const StudentToken = studentTokenModel(bookshelf)
export const BookAdmin = bookAdminModel(bookshelf)
export const UserToken = userTokenModel(bookshelf)
export const CourseTopic = courseTopicModel(bookshelf)
export const StudentFlashcardBox = studentFlashcardBoxModel(bookshelf)
export const StudentFlashcardArchive = studentFlashcardArchiveModel(bookshelf)
export const StudentBoxFlashcard = studentBoxFlashcardModel(bookshelf)
export const AuthDebug = authDebugModel(bookshelf)
export const BookContentCourseTopic = bookContentCourseTopicModel(bookshelf)
export const StudentCourseTopic = studentCourseTopicModel(bookshelf)
export const StudentBookContentCourseTopic = studentBookContentCourseTopicModel(bookshelf)
export const BookContentComment = bookContentCommentModel(bookshelf)
export const StudentBookContentComment = studentBookContentCommentModel(bookshelf)
export const ExamScoreStat = examScoreStatModel(bookshelf)
export const ExamSectionScoreMap = examSectionScoreMapModel(bookshelf)
export const ExamScoreMap = examScoreMapModel(bookshelf)
export const CourseEndDate = courseEndDateModel(bookshelf)
export const BookErrata = bookErrataModel(bookshelf)
export const ExamErrata = examErrataModel(bookshelf)
export const StudentVideoRating = studentVideoRatingModel(bookshelf)
export const StudentFavouriteVideo = studentFavouriteVideoModel(bookshelf)
export const VideoCategory = videoCategoryModel(bookshelf)
export const Notification = notificationModel(bookshelf)
export const CourseEndDateDay = courseEndDateDayModel(bookshelf)
export const StudentNotification = studentNotificationModel(bookshelf)
export const GroupTutoringDay = groupTutoringDayModel(bookshelf)
export const OnboardingCategory = onboardingCategoryModel(bookshelf)
export const OnboardingImage = onboardingImageModel(bookshelf)
export const StudentVideo = studentVideoModel(bookshelf)
export const FavouriteVideo = favouriteVideoModel(bookshelf)
export const RespirationGame = respirationGameModel(bookshelf)
export const HangmanPhrase = hangmanPhraseModel(bookshelf)
export const HangmanHint = hangmanHintModel(bookshelf)
export const HangmanGame = hangmanGameModel(bookshelf)
export const HangmanAnsweredPhrases = hangmanAnsweredPhrasesModel(bookshelf)
export const StudentCalendarEvent = studentCalendarEventModel(bookshelf)
export const StudentCalendarDaysOff = studentCalendarDaysOffModel(bookshelf)
export const CalendarChapter = calendarChapterModel(bookshelf)
export const CalendarFullExam = calendarFullExamModel(bookshelf)
export const CalendarSetting = calendarSettingModel(bookshelf)
export const CalendarSectionExam = calendarSectionExamModel(bookshelf)
export const CalendarChapterExam = calendarChapterExamModel(bookshelf)
export const StudentCourseEndDateDay = studentCourseEndDateDayModel(bookshelf)
export const Organization = organizationModel(bookshelf)
export const OrganizationAdmin = organizationAdminModel(bookshelf)
export const ChatHistory = chatHistoryModel(bookshelf)
export const ChatChapterScore = chatChapterScoreModel(bookshelf)
export const McatDate = mcatDateModel(bookshelf)
export const CustomEventGroup = customEventGroupModel(bookshelf)
export const CustomEventType = customEventTypeModel(bookshelf)
export const StudentBookVideo = studentBookVideoModel(bookshelf)
export const Task = taskModel(bookshelf)
export const StudentTask = studentTaskModel(bookshelf)
export const StudentExamCompletion = studentExamCompletion(bookshelf)
export const AdminCourse = adminCourseModel(bookshelf)
export const CourseTutor = courseTutorModel(bookshelf)
export const AiTutorScore = aiTutorScoreModel(bookshelf)
// [CREATE-MODULE:model-export] - DO NOT EDIT THIS LINE

export const BookScanListView = BookScanListViewModel(bookshelf)
export const FlashcardListView = FlashcardListViewModel(bookshelf)

export default {
  bookshelf,
}
