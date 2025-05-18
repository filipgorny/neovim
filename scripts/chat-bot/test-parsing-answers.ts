import * as R from 'ramda'
import { findOneOrFail } from '../../src/modules/chat-history/chat-history-repository'
import { upsertChatChapterScore } from '../../src/modules/chat-chapter-scores/chat-chapter-scores-service'
import { int } from '@desmart/js-utils'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Testing AI chat bot answer parsing')

    const tryOriginalQuestionExtraction = R.pipe(
      R.when(
        R.test(/original_quiz_question/),
        R.tryCatch(
          JSON.parse,
          R.always(undefined)
        )
      )
    )

    const tryFollowUpQuestionExtraction = R.pipe(
      R.when(
        R.test(/follow_up_question/),
        R.tryCatch(
          JSON.parse,
          R.always(undefined)
        )
      )
    )

    const chatHistoryId = process.argv[2]

    const historyEntity = await findOneOrFail({ id: chatHistoryId })

    const originalQuestion = tryOriginalQuestionExtraction(historyEntity.message)
    const folowUpQuestion = tryFollowUpQuestionExtraction(historyEntity.message)

    if (originalQuestion) {
      console.log('ORIGINAL QUESTION FOUND')
      // This to be recorded in the chat history as message_raw
      console.log(originalQuestion)

      // This to be recorded in the chat history as message
      console.log('Bot said:', originalQuestion.explanation)

      if (originalQuestion.score) {
        await upsertChatChapterScore(historyEntity.student_id, historyEntity.student_book_chapter_id, int(originalQuestion.score))
      }

      // The question with answer and score to be recorded in chat_questions_table
    } else if (folowUpQuestion) {
      console.log('FOLLOW UP QUESTION FOUND')
      // This to be recorded in the chat history as message_raw
      console.log(folowUpQuestion)

      // This to be recorded in the chat history as message
      console.log('Bot said:', folowUpQuestion.explanation)

      // The question with answer and score to be recorded in chat_questions_table
    } else {
      console.log(historyEntity)
    }

    console.log('Done')

    process.exit(0)
  }
)()
