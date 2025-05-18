import orm from '../../models'

const { knex } = orm.bookshelf

export const countCategoryImages = async (category_id: string): Promise<number> => {
  const { count } = await knex('onboarding_images')
    .where({ category_id })
    .count()
    .first()

  return Number(count)
}

export const nextCategoryImageOrder = async (category_id: string): Promise<number> => {
  const { max } = await knex('onboarding_images')
    .where({ category_id })
    .max('order')
    .first()

  return Number(max) + 1
}
