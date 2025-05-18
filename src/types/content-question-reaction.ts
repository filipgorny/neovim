import { ContentQuestionReactionTypeEnum } from '../modules/content-question-reactions/content-question-reaction-types'

export type ContentQuestionReaction = {
  id: string,
  name: string,
  type: ContentQuestionReactionTypeEnum,
  animation: string,
  sound: string,
  created_at?: string,
}

export type ContentQuestionReactionDTO = Omit<ContentQuestionReaction, 'id'>
