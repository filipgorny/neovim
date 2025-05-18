import { findReactions } from '../content-question-reactions-repository'
import { transformReaction } from './transformers/transform-reaction'

export default async (query) => {
  const reactions = await findReactions(query, query.filter)

  return {
    ...reactions,
    data: transformReaction(reactions.data.toJSON()),
  }
}
