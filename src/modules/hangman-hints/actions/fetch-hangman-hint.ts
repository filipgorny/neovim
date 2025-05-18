import { findOneOrFail } from '../hangman-hints-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
