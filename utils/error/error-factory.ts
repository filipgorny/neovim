import { HttpStatus } from '../enums/http-statuses'

export const make = (statusCode, message, errorCode = 'generic-error') => Object.assign(new Error(), {
  statusCode,
  message,
  errorCode,
})

export const throwException = exception => { throw exception }
export const customException = (name, code, message = '') => make(code, message, name)

export const throwSpecialException = (obj: object, errorCode = 'special-error', statusCode: number = 400, message: string = '') => {
  throw Object.assign(new Error(), {
    isSpecialError: true,
    error: {
      statusCode,
      message,
      errorCode,
    },
    ...obj,
  })
}

/**
 * Misc exceptions
 */

// General
export const notFoundException = resourceName => make(404, `${resourceName} not found`, 'entity.not-found')
export const notFoundExceptionWithID = (resourceName, id) => make(404, `${resourceName} with id: ${id} not found`, 'entity.not-found')
export const notAllowedValueException = (resourceName, fieldName) => make(400, `Value for ${fieldName} is not allowed in context of ${resourceName}`, 'entity.not-allowed')
export const resourceAlreadyExistsException = resourceName => make(403, `${resourceName} already exists`, 'entity.already-exists')
export const fieldRequiredException = fieldName => make(403, `${fieldName} is required and cannot be empty`, 'entity.field-required')
export const cannotDeleteSelfException = () => make(403, 'User cannot delete self', 'entity.no-self-delete')

// Auth
export const tokenExpiredException = (message = 'Authentication required') => make(401, message, 'user.token-expired')
export const unauthenticatedException = (message = 'Authentication required') => make(401, message, 'user.unauthenticated')
export const unauthorizedException = (message = 'Forbidden') => make(403, message, 'user.unauthorized')

// Datetime
export const dateFromPastException = (message = 'Date cannot be from the past') => make(422, message, 'date.from-past')

// API clients
export const unknownApiClientException = () => make(404, 'Unknown API client', 'api-clients.not-found')

/**
 * Domain exceptions
 */

// Admins
export const invalidAdminRoleException = () => make(422, 'Invalid admin role', 'admins.admin_role.invalid')
export const adminAuthRequiredException = () => make(403, 'Admin auth is required', 'admins.admin-auth-required')

// Auth (domain specific)
export const studentNotImpersonatedException = (message = 'Forbidden') => make(409, message, 'user.unauthorized')
export const accountInactiveException = (message = 'Forbidden') => make(403, message, 'user.inactive')

// Books
export const bookLockedException = () => make(403, 'The book is locked', 'books.locked')

// Book content attachments
export const invalidAttachmentTypeException = (validTypes = []) => make(403, `Allowed types: ${validTypes.join(',')}`, 'book-content-attachment.type.invalid')

// Book content flashcards
export const flashcardDoesNotBelongToStudentException = () => make(404, 'Flashcard does not belong to student', 'book-content-flashcard.not-found')

// Book content questions
export const contentQuestionDoesNotBelongToStudentException = () => make(403, 'Content question does not belong to student', 'book.content-question.not-found')

// Book chapters
export const chapterIdRequiredInPayload = () => make(422, 'Param chapterId is required in payload', 'book.chapter.chapter-id.not-found')

// Book subchapters
export const cantMoveLastSubchapter = () => make(422, 'Last subchapter can be moved only from last chapter part', 'book.subchapter.cant-move-last')

// Exams
export const examExternalIdAlreadyExistsException = () => make(403, 'External ID already exists', 'exams.external-id.already-exists')
export const examTitleAlreadyExistsException = () => make(403, 'External title already exists', 'exams.title.already-exists')
export const scaledScoreLengthMismatchException = () => make(422, 'Scaled score length does not match section count', 'exams.scaled-scores.invalid-length')
export const introPagesLengthMismatchException = () => make(422, 'Intro pages length does not match section count', 'exams.intro-pages.invalid-length')
export const examLengthMismatchException = () => make(422, 'Exam length defined by type does not match section count of uploaded exam', 'exams.sections.invalid-length')
export const examQuestionAmountMismatchException = definition => make(422, `Exam question amount defined by type does not match question amount of uploaded exam. Sections should have follwing amount of questions ${definition.join(', ')}`, 'exams.questions.invalid-length')
export const examAlreadyCompletedException = () => make(403, 'Exam already completed', 'exams.already-completed')

// Salty Bucks
export const insufficientFundsException = () => make(403, 'Not enough Salty Bucks for this operation', 'salty-bucks.insufficient-funds')

// Stopwatches
export const stopWatchNotStartedException = () => make(HttpStatus.Conflict, "Cannot increment stopwatch's seconds when it is paused", 'stopwatch.paused-state')

// Student course middleware
export const studentCourseContextRequiredException = () => make(403, 'Student course context is required', 'student-course.context-required')
export const studentAuthRequiredException = () => make(403, 'Student auth is required (missing student context)', 'student-course.student-auth-required')
export const studentCoursePausedException = () => make(404, 'Student course is paused', 'student-course.paused')
export const studentCourseNotFoundException = () => make(404, 'Student course not found', 'student-course.not-found')

// Student exams
export const invalidExamTimeException = () => make(422, 'Seconds left cannot be greater than previous value', 'exams.seconds_left.invalid')
export const questionDoesNotBelongToExamException = () => make(404, 'Question does not belong to exam', 'exams.question.not-found')
export const passageDoesNotBelongToExamException = () => make(404, 'Passage does not belong to exam', 'exams.passage.not-found')
export const sectionDoesNotBelongToExamException = () => make(404, 'Section does not belong to exam', 'exams.section.not-found')
export const examIsNotCompletedException = () => make(403, 'Exam is not complete', 'exams.not-complete')
export const examExpiredException = () => make(403, 'Exam expired', 'exams.expired')
export const badScoreValueException = (method: 'low' | 'high', scoreDef: { min: number, max: number }) => make(422, `Target score too ${method}, should be between ${scoreDef.min}-${scoreDef.max}`, 'target-score.value-not-allowed')

// Vimeo
export const vimeoUnexpectedException = () => make(HttpStatus.ServiceUnavailable, 'Unknown vimeo api error', 'vimeo.unexpected-error')

// Videos
export const videoTitleExistsException = () => make(HttpStatus.Conflict, 'Video with specified title already exists.', 'video.title.already-exists')

// Gladiators API
export const userTokenExpiredException = (message = 'User token expired') => make(401, message, 'user-token.token-expired')

// Users
export const cannotPromoteUserException = (fromUserRole: string, toUserRole: string) => make(403, `Cannot promote user from ${fromUserRole} to ${toUserRole}`, 'users.cannot-promote-user')

// Student flashcard archive
export const archiveSnapshotDoesntBelongToCourse = () => make(404, 'Archive snaphsot does not belong to course', 'student-flashcard-archive.snapshot.doesnt-belong-to-course')
export const studentFlashcardIsNotArchivedException = () => make(404, 'Student flashcard is not archived', 'student-flashcard-archive.flashcard.isnt-archived')
export const studentFlashcardIsArchivedException = () => make(404, 'Student flashcard is archived', 'student-flashcard-archive.flashcard.is-archived')

// Student two factor authentication
export const twoFactorAuthenticationRequiredException = () => make(403, 'Two factor authentication is required', 'student-two-factor-auth.two-factor-auth-required')
export const wrongVerificationCodeException = () => make(403, 'Wrong verification code', 'student-two-factor-auth.wrong-verification-code')
export const verificationCodeExpiredException = () => make(403, 'Verification code expired', 'student-two-factor-auth.verification-code-expired')
export const noVerificationCodeFoundException = () => make(404, 'No verification code found', 'student-two-factor-auth.verification-code-not-found')
export const accountNotVerifiedTodayException = () => make(403, 'The account was not verified with 2fa today', 'student-two-factor-auth.not-verified-today')
export const studentNotFoundException = () => make(404, 'Student with this phone number and email not found', 'student-two-factor-auth.student-not-found')
export const twoFactorAuthenticationEnabledException = () => make(403, 'Two factor authentication is enabled', 'student-two-factor-auth.two-factor-auth-enabled')
export const twoFactorAuthenticationDisabledException = () => make(403, 'Two factor authentication is disabled', 'student-two-factor-auth.two-factor-auth-disabled')

// Course end dates
export const invalidEndDateException = () => make(403, 'Invalid course end date', 'course-end-dates.invalid-end-date')

// Students
export const studentExternalIdAlreadyExistsException = () => make(403, 'Student with given external ID already exists', 'students.external-id.already-exists')
export const studentUsernameAlreadyExistsException = () => make(403, 'Student with given username already exists', 'students.username.already-exists')
