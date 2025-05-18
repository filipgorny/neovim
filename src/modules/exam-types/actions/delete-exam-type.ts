import randomString from '../../../../utils/string/random-string'
import { findOneOrFail, remove } from '../exam-type-repository'

export default async (id: string) => {
  const examType = await findOneOrFail({ id })

  return remove(id, `${examType.title}-deleted-${randomString()}`)
}
