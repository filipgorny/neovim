import { find } from '../onboarding-images-repository'

export default async (category_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { category_id })
)
