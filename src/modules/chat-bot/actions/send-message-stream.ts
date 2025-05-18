import * as R from 'ramda'
import { sendMessageStream } from '../../../../services/chat-bot/chat-bot'
import { ChatHistoryRole } from '../../chat-history/chat-history-roles'
import { getChapterContextId, pushChatMessage } from '../../chat-history/chat-history-service'
import { find } from '../../chat-history/chat-history-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { notFoundException, renameProps, throwException } from '@desmart/js-utils'
import { handleChatEvent, handleChatFullResponse } from '../event-handlers/handle-chat-event'
import { findOneOrFail as findChapter } from '../../student-book-chapters/student-book-chapter-repository'
import { StudentCourse } from '../../../types/student-course'
import { deductSaltyBucksForAiTutorMessage } from '../../../../services/salty-bucks/salty-buck-service'

type Payload = {
  message: string,
  student_book_chapter_id: string
}

const validateBookBelongsToStudent = studentId => R.pipe(
  R.path(['book', 'student_id']),
  R.unless(
    R.equals(studentId),
    () => throwException(notFoundException('StudentBook'))
  )
)

const getChatHistory = async (user, context_id) => R.pipeWith(R.andThen)([
  async () => find({ limit: { page: 1, take: 100 }, order: { by: 'created_at', dir: 'asc' } }, { student_id: user.id, context_id }),
  R.prop('data'),
  collectionToJson,
  R.map(
    R.pick(['role', 'message'])
  ),
  R.map(
    renameProps({ message: 'content' })
  ),
])(true)

const handleResponse = async (payload: string, user, context_id: string, student_book_chapter_id: string, studentCourse: StudentCourse) => {
  // const dataChunk = payload.split('\n')

  return handleChatFullResponse(payload, user, context_id, student_book_chapter_id, studentCourse)
  // return handleChatEvent(dataChunk[0], dataChunk[1], user, context_id, student_book_chapter_id, studentCourse)
}

const onResponse = (res, user, context_id: string, student_book_chapter_id: string, studentCourse: StudentCourse) => async (chunk) => {
  // const responsePart = chunk.toString()
  const responsePart = chunk

  res.write(responsePart)

  await handleResponse(responsePart, user, context_id, student_book_chapter_id, studentCourse)
}

const getFirstName = R.pipe(
  R.split(' '),
  R.head
)

const makeMessageConfig = (student, chapter) => ({
  first_name: getFirstName(student.name),
  user_id: student.id,
  resource_id: chapter.book.book_id,
  resource_type: 'book',
  chapter_id: chapter.original_chapter_id,
})

export default async (res, user, payload: Payload, studentCourse: StudentCourse) => {
  const chapter = await findChapter({ id: payload.student_book_chapter_id }, ['book'])

  validateBookBelongsToStudent(user.toJSON().id)(chapter)

  const contextId = await getChapterContextId(chapter)
  const history = await getChatHistory(user, contextId)

  await deductSaltyBucksForAiTutorMessage(user.id)

  await pushChatMessage(user, payload.message, null, ChatHistoryRole.user, contextId, chapter.id)
  await sendMessageStream(makeMessageConfig(user.toJSON(), chapter), res, payload.message, onResponse(res, user, contextId, chapter.id, studentCourse), history)
}
