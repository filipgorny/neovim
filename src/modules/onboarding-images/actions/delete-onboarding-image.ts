import { deleteRecord, findOneOrFail } from '../onboarding-images-repository'
import orm from '../../../models'

const { knex } = orm.bookshelf

export default async (id: string) => {
  const onboardingImage = await findOneOrFail({ id })
  const order = onboardingImage.order

  await deleteRecord(id)

  await knex.raw('UPDATE onboarding_images SET "order" = "order" - 1 WHERE "order" > ?', [order])
}
