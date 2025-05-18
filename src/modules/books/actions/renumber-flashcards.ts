import { int } from '../../../../utils/number/int'
import { renumberFlashcards } from '../book-repository'

type Payload = {
  start_number: number,
}

export default async (id: string, payload: Payload) => (
  renumberFlashcards(id, int(payload.start_number))
)
