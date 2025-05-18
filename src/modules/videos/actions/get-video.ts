import { findOneOrFail } from '../video-repository'

export default async (id: string) => (
  findOneOrFail({ id }, ['courseEndDate.course'])
)
