import { deductSaltyBucksForGladiatorPurchase } from '../../../../services/salty-bucks/salty-buck-service'

export default async (user, payload: any) => {
  await deductSaltyBucksForGladiatorPurchase(user.student.id, payload.gladiator_id, payload.cost)
}
