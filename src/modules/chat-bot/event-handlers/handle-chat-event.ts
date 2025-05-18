import { ChatHistoryRole } from '../../chat-history/chat-history-roles'
import { pushChatMessage } from '../../chat-history/chat-history-service'
import { int } from '@desmart/js-utils'
import { StudentCourse } from '../../../types/student-course'
import { createAiTutorScore } from '../../ai-tutor-scores/ai-tutor-scores-service'
import { findByName as findAppSetting } from '../../app-settings/app-settings-repository'
import { deductSaltyBucksForAiTutorQuestionAnswer, earnSaltyBucksForAiTutorQuestionAnswer } from '../../../../services/salty-bucks/salty-buck-service'
import { findFirstScoreNumber } from './utils/find-first-score-number'

let accumulatedData = ''
let isAccumulating = false

const issueSaltyBucks = async (studentCourse: StudentCourse, scoreValue: number) => {
  if (isNaN(int(scoreValue))) {
    return
  }

  // const promptCost = await findAppSetting('ai_chat_prompt_cost')
  // const saltyBucksAmount = int(scoreValue) - int(promptCost.value)
  const saltyBucksAmount = int(scoreValue)

  if (saltyBucksAmount >= 0) {
    await earnSaltyBucksForAiTutorQuestionAnswer(studentCourse.student_id, saltyBucksAmount)
  } else {
    await deductSaltyBucksForAiTutorQuestionAnswer(studentCourse.student_id, saltyBucksAmount)
  }
}

export const handleChatEvent = async (eventType: string, data: string, user, context_id: string, student_book_chapter_id: string, studentCourse: StudentCourse) => {
  // Start accumulating on chain end
  if (eventType === 'event: on_chain_end') {
    isAccumulating = true
    accumulatedData = data
  }

  // If we're accumulating, add the data
  if (isAccumulating && eventType !== '---END---' && eventType !== 'event: on_chain_end') {
    accumulatedData += eventType
  }

  // Process accumulated data when we receive the end signal
  if (eventType === '---END---' && isAccumulating) {
    isAccumulating = false

    // Remove 'data: ' from the beginning of accumulatedData
    const cleanedData = accumulatedData.replace(/^data: /, '')

    try {
      const parsedData = JSON.parse(cleanedData)

      // console.log('parsedData', parsedData)

      await pushChatMessage(
        user,
        parsedData.output,
        parsedData.output,
        ChatHistoryRole.assistant,
        context_id,
        student_book_chapter_id
      )

      // for some reason, the score is not always present in the json array
      const scoreNumber = findFirstScoreNumber(parsedData.json)

      if (scoreNumber === null) {
        console.log('SCORE NUMBER is null')
        console.log(studentCourse.id, student_book_chapter_id)
      }

      if (scoreNumber !== null) {
        await createAiTutorScore(studentCourse, student_book_chapter_id, int(scoreNumber))
      }

      await issueSaltyBucks(studentCourse, int(scoreNumber))

      // todo handle charging wallet
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      console.log('Raw data:', cleanedData)
    }

    return true
  }
}

export const handleChatFullResponse = async (data: string, user, context_id: string, student_book_chapter_id: string, studentCourse: StudentCourse) => {
  // Remove 'data: ' from the beginning of accumulatedData
  const cleanedData = data.replace(/^data: /, '')

  try {
    const parsedData = JSON.parse(cleanedData)

    // console.log('parsedData', parsedData)

    await pushChatMessage(
      user,
      parsedData.output,
      parsedData.output,
      ChatHistoryRole.assistant,
      context_id,
      student_book_chapter_id
    )

    // for some reason, the score is not always present in the json array
    const scoreNumber = findFirstScoreNumber(parsedData.json)

    if (scoreNumber === null) {
      console.log('SCORE NUMBER is null')
      console.log(studentCourse.id, student_book_chapter_id)
    }

    if (scoreNumber !== null) {
      await createAiTutorScore(studentCourse, student_book_chapter_id, int(scoreNumber))
    }

    await issueSaltyBucks(studentCourse, int(scoreNumber))

    // todo handle charging wallet
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    console.log('Raw data:', cleanedData)
  }

  return true
}
