import { findOneOrFail } from '../custom-event-types-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
