import * as R from 'ramda'
import { find as findSubchapters } from '../../student-book-subchapters/student-book-subchapter-repository'
import { find as findChapters, findOneOrFail as findChapter } from '../student-book-chapter-repository'
import { markPiecesAsSeenBySubchapters } from '../../student-book-contents/student-book-content-service'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'
import { BookContentStatusEnum } from '../../student-book-contents/book-content-statuses'
import { earnSaltyBucksForFinishingBook, earnSaltyBucksForFinishingChapter, earnSaltyBucksForFinishingCourse, earnSaltyBucksForReadingSubchapters } from '../../../../services/salty-bucks/salty-buck-service'
import StudentBookSubchapterDTO from '../../student-book-subchapters/dto/student-book-subchapter-dto'
import { getUnreadContentsInBookCount, getUnreadContentsInCourseCount } from '../../student-book-contents/student-book-content-repository'
import { upsertAmountContentRead } from '../../student-book-contents-read/student-book-contents-read-service'
import { markAsSeenByBookContentIds } from '../../student-book-content-course-topics/student-book-content-course-topics-service'
import { int } from '@desmart/js-utils'
import { markEventAsCompletedByStudentItemId } from '../../student-calendar-events/student-calendar-events-service'

const fetchSubchapters = (chapter_id: string) => async (part: number) => (
  findSubchapters({ limit: { page: 1, take: 100 }, order: { by: 'part', dir: 'asc' } }, {
    chapter_id,
    part,
  }, ['contents'])
)

const fetchBookByChapter = async (chapter_id: string) => (
  findChapters({ limit: { page: 1, take: 1 }, order: { by: 'title', dir: 'asc' } }, {
    id: chapter_id,
  }, ['book'])
)

const findSubchaptersByChapterIdAndPart = async (chapter_id: string, part: number) => (
  R.pipeWith(R.andThen)([
    fetchSubchapters(chapter_id),
    R.prop('data'),
    collectionToJson,
  ])(part)
)

const findSubchaptersByChapterId = async (chapter_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findSubchapters({ limit: { page: 1, take: 100 }, order: { by: 'part', dir: 'asc' } }, {
      chapter_id,
    }, ['contents']),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const validateBookBelongsToUser = async (chapter_id: string, student_id: string) => (
  R.pipeWith(R.andThen)([
    fetchBookByChapter,
    R.prop('data'),
    collectionToJson,
    R.head,
    R.path(['book', 'student_id']),
    R.unless(
      R.equals(student_id),
      () => throwException(notFoundException('StudentBook'))
    ),
  ])(chapter_id)
)

const getUnreadSubchapterIds = (subchapters: StudentBookSubchapterDTO[]) => (
  R.pipe(
    R.filter(
      R.pipe(
        R.prop('contents'),
        R.head,
        R.ifElse(
          R.isNil,
          R.always(false),
          R.propEq('content_status', BookContentStatusEnum.unseen)
        )
      )
    ),
    R.pluck('id')
  )(subchapters)
)

const getReadContentIdsFromSubchapters = (subchapters: StudentBookSubchapterDTO[]) => (
  R.pipe(
    R.pluck('contents'),
    R.flatten,
    R.pluck('id')
  )(subchapters)
)

const fetchBookByChapterId = async (chapter_id: string) => {
  const chapter = await findChapter({ id: chapter_id }, ['book'])

  return R.prop('book')(chapter)
}

export default async (user, studentCourse, chapter_id: string, part: string) => {
  await validateBookBelongsToUser(chapter_id, user.id)

  const partNumber = int(part)
  const subchapters = await findSubchaptersByChapterIdAndPart(chapter_id, partNumber)
  const unreadSubchapterIds = getUnreadSubchapterIds(subchapters)
  const subchapterIds = R.pluck('id')(subchapters)
  const chapter = await findChapter({ id: chapter_id }, [])

  const contentAmountRead = R.pipe(
    getReadContentIdsFromSubchapters,
    R.length
  )(subchapters)

  const contentIds = R.pipe(
    R.pluck('contents'),
    R.flatten,
    R.pluck('id')
  )(subchapters)

  await markAsSeenByBookContentIds(contentIds)

  await earnSaltyBucksForReadingSubchapters(user.id, unreadSubchapterIds, studentCourse)
  await markPiecesAsSeenBySubchapters(subchapterIds)
  await upsertAmountContentRead(user.id, studentCourse.id, chapter.book_id, contentAmountRead)

  if (unreadSubchapterIds.length) {
    const subchapters2 = await findSubchaptersByChapterId(chapter_id)
    const unreadIds = getUnreadSubchapterIds(subchapters2)

    if (R.isEmpty(unreadIds)) {
      await earnSaltyBucksForFinishingChapter(user.id, chapter_id, studentCourse)

      await markEventAsCompletedByStudentItemId(chapter_id)

      const book = await fetchBookByChapterId(chapter_id)

      const unreadChaptersInBook = await getUnreadContentsInBookCount(book.id)

      if (unreadChaptersInBook === 0) {
        await earnSaltyBucksForFinishingBook(user.id, book.id, studentCourse)

        const unreadContentInCourse = await getUnreadContentsInCourseCount(book)

        if (unreadContentInCourse === 0) {
          await earnSaltyBucksForFinishingCourse(user.id, book.course_id, studentCourse)
        }
      }
    }
  }
}
