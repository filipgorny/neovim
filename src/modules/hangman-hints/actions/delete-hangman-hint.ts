import { deleteRecord, findOneOrFail } from '../hangman-hints-repository'
import { shiftOrdersDown } from '../hangman-hints-service'

export default async (id: string) => {
  const hint = await findOneOrFail({ id })

  await deleteRecord(id)

  await shiftOrdersDown(hint.phrase_id, hint.order)
}
