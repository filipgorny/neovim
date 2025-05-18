import { findActiveById } from '../question-repository'
import { notFoundExceptionWithID } from '../../../../utils/error/error-factory'

export default async (id: string) => {
  const item = await findActiveById({ id })

  if (!item) {
    throw notFoundExceptionWithID('Question', id)
  }

  return item
}
