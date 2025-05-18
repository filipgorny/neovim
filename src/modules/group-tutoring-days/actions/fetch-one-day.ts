import { findOneOrFail } from '../group-tutoring-days-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
