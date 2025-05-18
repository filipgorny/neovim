import { findOneOrFail } from '../content-question-reactions-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
