import { findOneOrFail } from '../custom-event-groups-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
