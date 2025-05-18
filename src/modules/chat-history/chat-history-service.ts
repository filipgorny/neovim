import * as R from 'ramda'
import { create } from './chat-history-repository'
import { ChatHistoryRole } from './chat-history-roles'
import orm from '../../models'
import { CHAT_HISTORY_LIMIT } from '../../constants'
import { generateChatContextId } from '../student-book-chapters/student-book-chapter-service'

const { knex } = orm.bookshelf

const removeOldMessages = async (student, student_book_chapter_id: string, context_id: string) => {
  return knex('chat_history')
    .select('id')
    .orderBy('created_at', 'desc')
    .where('student_id', student.id)
    .andWhere('context_id', context_id)
    .andWhere('student_book_chapter_id', student_book_chapter_id)
    .offset(CHAT_HISTORY_LIMIT)
    .then(newestRecords => {
      const idsToRemove = newestRecords.map(record => record.id)

      return knex('chat_history')
        .whereIn('id', idsToRemove)
        .del()
    })
    .then(deletedRows => {
      console.log(`Deleted ${deletedRows} rows.`)
    })
}

export const pushChatMessage = async (student, message: string, message_raw: string, role: ChatHistoryRole, context_id: string, student_book_chapter_id: string) => {
  const record = await create({
    student_id: student.id,
    message,
    message_raw,
    role,
    context_id,
    student_book_chapter_id,
  })

  await removeOldMessages(student, student_book_chapter_id, context_id)

  return record
}

export const getChapterContextId = async (chapter, new_context = false) => {
  let contextId = R.path(['chat_context_id'], chapter)

  if (!contextId || new_context) {
    const updatedChapter = await generateChatContextId(chapter.id)

    contextId = updatedChapter.toJSON().chat_context_id
  }

  return contextId
}
