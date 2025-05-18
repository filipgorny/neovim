import { findOneOrFail } from '../course-map-repository'

export default async (id: string, itemId: string) => (
  findOneOrFail({ id: itemId })
)
