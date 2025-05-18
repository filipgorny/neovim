import R from 'ramda'
import { fetchStudentBookWithPageContents } from '../student-book-repository'
import { findByName as findSettingByName } from '../../app-settings/app-settings-repository'
import { SaltyBucksOperationSubtype } from '../../salty-bucks-log/salty-bucks-operation-subtype'
import { StudentCourseTypes } from '../../student-courses/student-course-types'
import { throwException, unauthorizedException } from '../../../../utils/error/error-factory'
import { int } from '../../../../utils/number/int'
import Transform from './book-detail-transformers'
import logger from '../../../../services/logger/logger'

const fetchChapterPart = (originalBookId, chapterOrder, part, studentCourse, partial?: string) => async studentId => (
  fetchStudentBookWithPageContents(studentId, originalBookId, chapterOrder, part, studentCourse, partial)
)

export default async (student, originalBookId, chapterOrder, part, studentCourse, partial?: string) => {
  // In "free trial" the student can access only the first chapter
  if (studentCourse && studentCourse.type === StudentCourseTypes.freeTrial) {
    if (int(chapterOrder) !== 1) {
      throwException(unauthorizedException())
    }
  }

  logger.debug('book details: student.get(\'video_bg_music_enabled\'): ', student.get('video_bg_music_enabled'))

  const [baseValueSetting, multiplierSetting] = await Promise.all([
    findSettingByName(SaltyBucksOperationSubtype.answerContentQuestion),
    findSettingByName(SaltyBucksOperationSubtype.multiplierAnswerContentQuestionCorrect),
  ])

  return R.pipeWith(R.andThen)([
    fetchChapterPart(originalBookId, chapterOrder, part, studentCourse, partial),
    Transform.chapterImages,
    Transform.bookContents,
    Transform.flashcards,
    Transform.contentImages,
    Transform.attachments,
    Transform.resources(student.get('video_bg_music_enabled')),
    Transform.questions(baseValueSetting, multiplierSetting),
  ])(student.id)
}
