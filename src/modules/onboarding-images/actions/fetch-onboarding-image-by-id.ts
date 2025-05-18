import { findOneOrFail } from '../onboarding-images-repository'

export default async (id: string) => (
  findOneOrFail({ id })
)
