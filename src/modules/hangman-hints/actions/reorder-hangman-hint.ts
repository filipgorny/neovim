import { findOneOrFail, findOne, patch } from '../hangman-hints-repository'

export default async (id: string, direction: string) => {
  const hint = await findOneOrFail({ id })

  if (direction === 'up') {
    const nextHint = await findOne({ phrase_id: hint.phrase_id, order: hint.order + 1 })

    if (nextHint) {
      const result = await patch(id, { order: hint.order + 1 })

      await patch(nextHint.id, { order: hint.order })

      return result
    }
  } else if (direction === 'down') {
    const previousHint = await findOne({ phrase_id: hint.phrase_id, order: hint.order - 1 })

    if (previousHint) {
      const result = await patch(id, { order: hint.order - 1 })

      await patch(previousHint.id, { order: hint.order })

      return result
    }
  }

  return hint
}
