import { findUserWithStudentData } from '../users-service'

export const getUserWithStudentData = async (user_id: string) => (
  findUserWithStudentData(user_id)
)
