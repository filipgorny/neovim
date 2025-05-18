import { setSaltyBucksBalance } from '../student-service'

interface Payload {
  salty_bucks_balance: number;
}

export default async (studentId: string, adminId: string, payload: Payload) => (
  setSaltyBucksBalance({ studentId, adminId, saltyBuckBalance: payload.salty_bucks_balance })
)
