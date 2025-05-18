import { find } from '../onboarding-categories-repository'

export default async () => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, {}, ['images'])
)
