import { Admin } from './admin'
import { Student } from './student'

export type User = {
  id: string,
  email: string,
  password: string,
  email_verification_token: string,
  is_email_verified: boolean,
  is_active: boolean,
  password_reset_token: string,
  password_reset_token_created_at: string,
  user_role: string,
  student: Student,
}
