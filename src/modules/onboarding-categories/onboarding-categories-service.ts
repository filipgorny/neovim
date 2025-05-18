import { findOneOrFail, create, patch, deleteRecord, fixOrderingAfterDeleting } from './onboarding-categories-repository'

export const createOnboardingCategory = async (dto: {title: string}, order: number, image_url: string) => (
  create({
    ...dto,
    order,
    image_url,
  })
)

export const patchOnboardingCategory = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteOnboardingCategory = async (id: string) => {
  const item = await findOneOrFail({ id })

  await fixOrderingAfterDeleting(item.order)

  return deleteRecord(id)
}
