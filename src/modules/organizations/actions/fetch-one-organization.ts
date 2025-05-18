import { findOneOrFail } from '../organizations-repository'

export default async (id: string) => (
  findOneOrFail({ id }, ['admins'])
)
