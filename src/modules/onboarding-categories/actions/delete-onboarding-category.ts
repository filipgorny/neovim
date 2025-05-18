import { deleteOnboardingCategory } from '../onboarding-categories-service'

export default async (id: string) => (
  deleteOnboardingCategory(id)
)
