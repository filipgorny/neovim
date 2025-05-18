import R from 'ramda'
import { QuestionGroup, QuestionSet } from '../../types/exam'
import { create } from './exam-question-repository'
import { makeDTO } from './dto/exam-question-dto'
import mapP from '../../../utils/function/mapp'
import { correctAnswerFromExplanation } from '../questions/utils/correct-answer-from-explanation'
import addToExamQuestionDifficulty from '../../../services/exam-questions/add-to-question-difficulty'
import { QUESTION_TYPE_SINGLE_CHOICE } from './exam-question-types'

const createSingleQuestion = (passage_id: string) => async (item: QuestionGroup, order: number) => (
  create(
    makeDTO(
      passage_id,
      item.question,
      item.answers,
      item.explanation,
      item.chapter,
      QUESTION_TYPE_SINGLE_CHOICE,
      String(
        item.correctAnswer
          ? correctAnswerFromExplanation(item.correctAnswer)
          : correctAnswerFromExplanation(item.explanation)
      ),
      order
    )
  )
)

const hasIncorrectExplanation = R.test(/\|/)

export const createExamQuestions = async (passageId: string, questionSet: QuestionSet) => (
  R.addIndex(mapP)(
    // @ts-ignore
    async (item: QuestionGroup, index: number) => {
      if (!item.explanation || hasIncorrectExplanation(item.explanation)) {
        return
      }

      try {
        await createSingleQuestion(passageId)(item, index + 1)
      } catch (e) {
        console.log(e)
      }
    }
    // @ts-ignore
  )(questionSet.questions)
)

export const addToQuestionDifficulty = addToExamQuestionDifficulty
