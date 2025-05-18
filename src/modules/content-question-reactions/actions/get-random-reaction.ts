import { ContentQuestionReactionTypeEnum } from '../content-question-reaction-types'
import { getRandomRecord } from '../content-question-reactions-repository'
import { transformReaction } from './transformers/transform-reaction'

export default async () => {
  const [correct, incorrect] = await Promise.all([
    getRandomRecord(ContentQuestionReactionTypeEnum.correct),
    getRandomRecord(ContentQuestionReactionTypeEnum.incorrect),
  ])

  return {
    correct: transformReaction(correct),
    incorrect: transformReaction(incorrect),
  }
}
