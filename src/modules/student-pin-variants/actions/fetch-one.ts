import { findOneOrFail } from '../student-pin-variants-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
