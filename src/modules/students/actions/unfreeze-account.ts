import { unfreezeAccount } from '../student-service'

export default async (id: string) => (
  unfreezeAccount(id)
)
