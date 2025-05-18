import { moveSaltyBucksFromWallet } from '../../../../services/salty-bucks/salty-buck-service'

export default async (student) => (
  moveSaltyBucksFromWallet(student.id)
)
