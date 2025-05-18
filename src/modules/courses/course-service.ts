import * as R from 'ramda'
import moment from 'moment'
import randomString from '../../../utils/string/random-string'
import { findCourseByExternalId } from '../course-map/course-map-repository'
import { createStudentCourse, fetchExistingCourseCount, findFreeTrial, findLatestCourse } from '../student-courses/student-course-repository'
import { create, findOneOrFail, remove, update, patch } from './course-repository'
import CourseDTO, { makeDTO } from './dto/book-course-dto'
import { StudentCourseDTO } from '../../types/student-course'
import { CourseMapEntry } from '../../types/course-map-entry'
import { DATETIME_DATABASE_FORMAT, DATE_FORMAT_YMD } from '../../constants'
import { courseAccessibleFromByCourseMapEntry, courseAccessibleToByCourseMapEntry, courseAccessibleToByCourseMapEntryForFreeTrialUpgrade, courseStatusFromCourseMapEntry, courseTypeFromCourseMapEntry } from './course-map-utils'
import asAsync from '../../../utils/function/as-async'
import { StudentCourseStatus } from '../student-courses/student-course-status'
import { extendCourse, upgradeFreeTrial } from '../student-courses/student-course-service'
import { CourseMapTypes } from '../course-map/course-map-types'
import { recordCourseExtension } from '../course-extensions/course-extensions-service'
import { findOne as findExtension } from '../course-extensions/course-extensions-repository'
import { deleteByCourse } from '../course-map/course-map-service'
import { removeAll } from '../course-books/course-book-repository'
import { copyAttachedExamForNewCourse, detachAllByCourse } from '../attached-exams/attached-exams-service'
import { findStudent } from '../students/student-service'
import { becomePatrician, findUserByEmail, promoteToPlebeian } from '../users/users-service'
import mapP from '../../../utils/function/mapp'
import { copyCourseBook } from '../course-books/course-book-service'
import { create as createCourseTopic } from '../course-topics/course-topics-repository'
import { create as createAttchedExam, fetchAttachedExams } from '../attached-exams/attached-exam-repository'
import { create as createContentTopic, findByCourseTopicAndCourse as findContentTopicByCourseTopicAndCourse } from '../book-content-course-topics/book-content-course-topics-repository'
import { find as findComments } from '../book-content-comments/book-content-comments-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { copyCommentForNewCourse } from '../book-content-comments/book-content-comments-service'
import { StudentCourseTypes } from '../student-courses/student-course-types'
import { StudentGroup } from '../notifications/student-group-types'
import { renameProps } from '@desmart/js-utils'
import { UploadedFile } from 'express-fileupload'
import uploadFile from '../../../services/s3/upload-file'
import { S3_PREFIX_COURSE_LOGO } from '../../../services/s3/s3-file-prefixes'
import { validateFileMimeType } from './validation/validate-file-payload'
import generateStaticUrl from '../../../services/s3/generate-static-url'
import { find as findCourseTutors } from '../course-tutors/course-tutors-repository'
import { copyTutorForNewCourse } from '../course-tutors/course-tutors-service'
import { find as findCourseEndDates } from '../course-end-dates/course-end-dates-repository'
import { copyEndDateForNewCourse } from '../course-end-dates/course-end-dates-service'
import { find as findMcatDates } from '../mcat-dates/mcat-dates-repository'
import { copyMcatDateForNewCourse } from '../mcat-dates/mcat-dates-service'
import { find as findCustomEventGroups } from '../custom-event-groups/custom-event-groups-repository'
import { copyCustomEventGroupForNewCourse } from '../custom-event-groups/custom-event-groups-service'
import fetchCalendarChapters from '../calendar-chapters/actions/fetch-chapters-for-course'
import { copyCalendarChapterForNewCourse } from '../calendar-chapters/calendar-chapters-service'
import fetchCalendarChapterExams from '../calendar-chapter-exams/actions/fetch-chapter-exams-for-course'
import { copyCalendarChapterExamForNewCourse } from '../calendar-chapter-exams/calendar-chapter-exams-service'
import { find as findCalendarSectionExams } from '../calendar-section-exams/calendar-section-exams-repository'
import { copyCalendarSectionExamForNewCourse } from '../calendar-section-exams/calendar-section-exams-service'
import { find as findCalendarFullExams } from '../calendar-full-exams/calendar-full-exams-repository'
import { copyCalendarFullExamForNewCourse } from '../calendar-full-exams/calendar-full-exams-service'
import { find as findGroupTutoringDays } from '../group-tutoring-days/group-tutoring-days-repository'
import { copyGroupTutoringDayForNewCourse } from '../group-tutoring-days/group-tutoring-days-service'

const uploadImageFile = async (file: UploadedFile) => uploadFile(file.data, file.mimetype, S3_PREFIX_COURSE_LOGO, true)

const validateMimeType = ({ mimetype }: UploadedFile) => validateFileMimeType(mimetype)

const uploadFileAndReturnUrl = R.pipeWith(R.andThen)([
  asAsync(
    R.tap(validateMimeType)
  ),
  uploadImageFile,
  async (imageFileKey: string) => generateStaticUrl(imageFileKey),
])

const getFileUrl = R.ifElse(
  R.isNil,
  asAsync(R.always(null)),
  uploadFileAndReturnUrl
)

export const createCourse = (imageFile: UploadedFile | undefined) => async ({ title, external_id, codename, max_exam_completions }) => {
  const imageUrl = await getFileUrl(imageFile)

  return create(
    makeDTO(title, external_id, codename, max_exam_completions, imageUrl || undefined)
  )
}

export const updateCourse = (id: string, imageFile: UploadedFile | undefined) => async (dto: CourseDTO) => {
  if (imageFile) {
    dto.logo_url = await getFileUrl(imageFile)
  } else if (R.has('logo_url')(dto) && dto.logo_url === '') {
    dto.logo_url = null
  }

  return update(id, dto)
}

export const deleteCourse = async (id: string) => {
  const book = await findOneOrFail({ id })
  const title: string = `${book.title}-deleted-${randomString()}`

  await Promise.all([
    deleteByCourse(id),
    removeAll(id, []),
    detachAllByCourse(id),
  ])

  return remove(id, title)
}

const prepareCourseEntity = (courseMapEntry: CourseMapEntry, externalCreatedAt, studentId) => (course): StudentCourseDTO => ({
  book_course_id: course.id,
  external_created_at: externalCreatedAt,
  status: courseStatusFromCourseMapEntry(courseMapEntry),
  student_id: studentId,
  title: course.title,
  type: courseTypeFromCourseMapEntry(courseMapEntry),
  accessible_from: courseAccessibleFromByCourseMapEntry(courseMapEntry, externalCreatedAt),
  accessible_to: courseAccessibleToByCourseMapEntry(courseMapEntry, externalCreatedAt),
  metadata: { ...courseMapEntry.metadata, calendar_archive_tooltip: true },
  subtitle: courseMapEntry.title,
  course_topics_title: course.course_topics_title,
  original_end_date: courseAccessibleToByCourseMapEntry(courseMapEntry, externalCreatedAt),
  original_metadata: { ...courseMapEntry.metadata, calendar_archive_tooltip: true },
})

const prepareCourseEntityForUpgrade = (courseMapEntry: CourseMapEntry, externalCreatedAt, studentId) => (course): StudentCourseDTO => ({
  book_course_id: course.id,
  external_created_at: externalCreatedAt,
  status: StudentCourseStatus.ongoing,
  student_id: studentId,
  title: course.title,
  type: courseTypeFromCourseMapEntry(courseMapEntry),
  accessible_from: externalCreatedAt,
  accessible_to: courseAccessibleToByCourseMapEntryForFreeTrialUpgrade(courseMapEntry, externalCreatedAt),
  metadata: courseMapEntry.metadata,
  subtitle: courseMapEntry.title,
})

const isCourseExtension = (courseMapEntry: CourseMapEntry) => (
  courseMapEntry.type === CourseMapTypes.product
)

const getDaysAmountFromCourseMapEntry = (courseMapEntry: CourseMapEntry) => (
  R.pipe(
    R.prop('metadata'),
    JSON.parse,
    R.prop('days_amount')
  )(courseMapEntry)
)

export const syncCourse = (studentId: string) => async course => {
  const courseMapEntry = await findCourseByExternalId(course.id)
  const originalCourse = R.prop('course')(courseMapEntry)
  const externalCreatedAt = moment(course.created_at).format(DATETIME_DATABASE_FORMAT)

  const student = await findStudent(studentId)
  const user = await findUserByEmail(student.email)

  // skip course not found in DB
  if (!originalCourse) {
    console.log('Original course not found')

    return
  }

  // Handle course extension
  if (isCourseExtension(courseMapEntry)) {
    const existingExtension = await findExtension({
      student_id: studentId,
      external_id: courseMapEntry.external_id,
      external_created_at: externalCreatedAt,
    })

    // If record exists it means that the extension was used before
    if (existingExtension) {
      return
    }

    const latestCourse = await findLatestCourse(originalCourse.id, studentId)

    await extendCourse(latestCourse, getDaysAmountFromCourseMapEntry(courseMapEntry))
    await recordCourseExtension(studentId, courseMapEntry.external_id, externalCreatedAt)

    return undefined
  }

  const existingCourseCount = await fetchExistingCourseCount(externalCreatedAt, originalCourse.id, studentId)

  // skip course already attached to student
  if (existingCourseCount > 0) {
    console.log('Course already attached to student')

    return
  }

  const freeTrial = await findFreeTrial(originalCourse.id, studentId)

  // Handle free trial upgrade
  if (freeTrial) {
    const courseUpgrade = prepareCourseEntityForUpgrade(courseMapEntry, externalCreatedAt, studentId)(originalCourse)

    await upgradeFreeTrial(freeTrial, courseUpgrade)

    if (user) {
      await becomePatrician(user.id)
    }

    return undefined
  }

  const result = R.pipeWith(R.andThen)([
    asAsync(prepareCourseEntity(courseMapEntry, externalCreatedAt, studentId)),
    createStudentCourse,
  ])(originalCourse)

  if (user) {
    if (courseMapEntry.type === CourseMapTypes.freeTrial) {
      await promoteToPlebeian(user.id)
    } else {
      await becomePatrician(user.id)
    }
  }

  return result
}

const getCourseComments = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findComments({ limit: { page: 1, take: 1000 }, order: { by: 'course_id', dir: 'asc' } }, { course_id }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const copyCourseComments = async (course_id: string, new_course_id: string) => {
  const comments = await getCourseComments(course_id)

  return mapP(
    copyCommentForNewCourse(new_course_id)
  )(comments)
}

const getCourseTutors = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findCourseTutors({ limit: { page: 1, take: 1000 }, order: { by: 'course_id', dir: 'asc' } }, { course_id }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const copyCourseTutors = async (course_id: string, new_course_id: string) => {
  const tutors = await getCourseTutors(course_id)

  return mapP(
    copyTutorForNewCourse(new_course_id)
  )(tutors)
}

const getCourseEndDates = async (course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findCourseEndDates({ limit: { page: 1, take: 1000 }, order: { by: 'course_id', dir: 'asc' } }, { course_id }, ['days']),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const copyCourseEndDates = async (course_id: string, new_course_id: string, newTutors: []) => {
  const endDates = await getCourseEndDates(course_id)

  return mapP(
    copyEndDateForNewCourse(new_course_id, newTutors)
  )(endDates)
}

export const copyCourse = async (id: string) => {
  const course = await findOneOrFail({ id }, ['courseBooks', 'attached', 'courseTopics'])

  const today = moment().format(DATE_FORMAT_YMD)
  const randString = randomString().substring(0, 4)
  const newTitle = `${course.title} - copy ${today} ${randString}`
  const newExternalId = null

  const courseCopy = await create({ title: newTitle, external_id: newExternalId, is_calendar_enabled: course.is_calendar_enabled, dashboard_settings: course.dashboard_settings })

  await mapP(
    async courseBook => {
      await copyCourseBook(id, courseBook.book_id, courseCopy.id)
    }
  )(R.prop('courseBooks', course))

  await mapP(
    async courseTopic => {
      const newCourseTopic = await createCourseTopic(
        R.pipe(
          R.omit(['id']),
          R.set(
            R.lensProp('course_id'),
            courseCopy.id
          )
        )(courseTopic)
      )

      const contentTopics = await findContentTopicByCourseTopicAndCourse(courseTopic.id, course.id)

      await mapP(
        async contentTopic => createContentTopic(
          R.pipe(
            R.omit(['id']),
            R.set(
              R.lensProp('course_id'),
              courseCopy.id
            ),
            R.set(
              R.lensProp('course_topic_id'),
              newCourseTopic.id
            )
          )(contentTopic)
        )
      )(contentTopics)
    }
  )(R.prop('courseTopics', course))

  const attachedExam = R.pipe(
    R.prop('attached'),
    R.head
  )(course)

  if (attachedExam) {
    await createAttchedExam({ attached_id: course.id, ...R.omit(['id'], attachedExam) })
  }

  await copyCourseComments(id, courseCopy.id)

  const mcatDates = await findMcatDates({ limit: { page: 1, take: 1000 }, order: { by: 'course_id', dir: 'asc' } }, { course_id: course.id })

  await mapP(
    async mcatDate => copyMcatDateForNewCourse(courseCopy.id)(mcatDate)
  )(collectionToJson(mcatDates.data))

  const customEventGroups = await findCustomEventGroups({ limit: { page: 1, take: 1000 }, order: { by: 'course_id', dir: 'asc' } }, { course_id: course.id }, ['customEventTypes'])

  await mapP(
    async customEventGroup => copyCustomEventGroupForNewCourse(courseCopy.id)(customEventGroup)
  )(collectionToJson(customEventGroups.data))

  const attachedExams = await fetchAttachedExams([id])

  await mapP(
    async attachedExam => copyAttachedExamForNewCourse(courseCopy.id)(attachedExam)
  )(collectionToJson(attachedExams))

  const calendarChapters = await fetchCalendarChapters(id)

  await mapP(
    async calendarChapter => copyCalendarChapterForNewCourse(courseCopy.id)(calendarChapter)
  )(calendarChapters)

  const calendarChapterExams = await fetchCalendarChapterExams(id)
  const filteredCalendarChapterExams = R.filter(R.propEq('in_calendar', true), calendarChapterExams)

  await mapP(
    async calendarChapterExam => copyCalendarChapterExamForNewCourse(courseCopy.id)(calendarChapterExam)
  )(filteredCalendarChapterExams)

  const calendarSectionExams = await findCalendarSectionExams({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { course_id: id })

  await mapP(
    async calendarSectionExam => copyCalendarSectionExamForNewCourse(courseCopy.id)(calendarSectionExam)
  )(collectionToJson(calendarSectionExams.data))

  const calendarFullExams = await findCalendarFullExams({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { course_id: id })

  await mapP(
    async calendarFullExam => copyCalendarFullExamForNewCourse(courseCopy.id)(calendarFullExam)
  )(collectionToJson(calendarFullExams.data))

  const groupTutoringDays = await findGroupTutoringDays({ limit: { page: 1, take: 100 }, order: { by: 'course_id', dir: 'asc' } }, { course_id: id })

  await mapP(
    async groupTutoringDay => copyGroupTutoringDayForNewCourse(courseCopy.id)(groupTutoringDay)
  )(collectionToJson(groupTutoringDays.data))
}

export const findByExternalId = async (external_id: string) => (
  findOneOrFail({ external_id })
)

export const getStudentIdAndStudentCourseIdPairsByStudentGroup = async (studentGroup: StudentGroup): Promise<Array<{ student_id: string, student_course_id: string}>> => {
  const course = await findOneOrFail({ id: studentGroup.course_id }, ['studentCourses'])

  let targetStudentCourses

  if (studentGroup.type === StudentCourseTypes.onDemand || studentGroup.type === StudentCourseTypes.freeTrial) {
    targetStudentCourses = R.pipe(
      R.prop('studentCourses'),
      R.filter(
        R.propEq('type', studentGroup.type)
      )
    )(course)

    if (studentGroup.days_amount) {
      targetStudentCourses = R.pipe(
        R.map(
          R.over(R.lensProp('original_metadata'), JSON.parse)
        ),
        R.filter(
          R.pathEq(['original_metadata', 'days_amount'], `${studentGroup.days_amount}`)
        )
      )(targetStudentCourses)
    }
  } else if (studentGroup.type === StudentCourseTypes.liveCourse) {
    targetStudentCourses = R.pipe(
      R.prop('studentCourses'),
      R.filter(
        R.propEq('type', StudentCourseTypes.liveCourse)
      )
    )(course)

    if (studentGroup.expires_at) {
      targetStudentCourses = R.pipe(
        R.map(
          R.pipe(
            R.over(R.lensProp('original_metadata'), JSON.parse),
            R.over(R.lensPath(['original_metadata', 'expires_at']), date => moment(date).format(DATE_FORMAT_YMD))
          )
        ),
        R.filter(
          R.pathEq(['original_metadata', 'expires_at'], moment(studentGroup.expires_at).format(DATE_FORMAT_YMD))
        )
      )(targetStudentCourses)
    }
  }

  return R.map(
    R.pipe(
      R.pick([
        'student_id',
        'id',
      ]),
      renameProps({
        id: 'student_course_id',
      })
    )
  )(targetStudentCourses)
}

export const setGroupTuroringMeetingUrl = async (id: string, group_tutoring_meeting_url: string) => (
  patch(id, { group_tutoring_meeting_url })
)

export const toggleCalendar = async (id: string) => {
  const course = await findOneOrFail({ id })

  return patch(id, { is_calendar_enabled: !course.is_calendar_enabled })
}

export const toggleAiTutor = async (id: string) => {
  const course = await findOneOrFail({ id })

  return patch(id, { ai_tutor_enabled: !course.ai_tutor_enabled })
}

export const setDashboardSettings = async (id: string, dashboard_settings: object) => {
  return patch(id, { dashboard_settings: JSON.stringify(dashboard_settings) })
}
