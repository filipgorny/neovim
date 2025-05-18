import { findOneOrFail } from '../onboarding-categories-repository'

export default async (id: string) => (
  findOneOrFail({ id }, ['images'])
)
