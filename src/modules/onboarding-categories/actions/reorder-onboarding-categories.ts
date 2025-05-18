import { findOne, findOneOrFail, patch } from '../onboarding-categories-repository'

const moveUp = async (id: string) => {
  const category = await findOneOrFail({ id })
  const previousCategory = await findOne({ order: category.order - 1 })

  if (!previousCategory) {
    return category
  }

  return Promise.all([
    patch(category.id, { order: category.order - 1 }),
    patch(previousCategory.id, { order: previousCategory.order + 1 }),
  ])
}

const moveDown = async (id: string) => {
  const category = await findOneOrFail({ id })
  const nextCategory = await findOne({ order: category.order + 1 })

  if (!nextCategory) {
    return category
  }

  return Promise.all([
    patch(category.id, { order: category.order + 1 }),
    patch(nextCategory.id, { order: nextCategory.order - 1 }),
  ])
}

const REORDER = {
  up: moveUp,
  down: moveDown,
}

export default async (id: string, direction: string) => (
  REORDER[direction](id)
)
