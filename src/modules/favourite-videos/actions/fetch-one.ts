import { findOneOrFail } from '../favourite-videos-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
