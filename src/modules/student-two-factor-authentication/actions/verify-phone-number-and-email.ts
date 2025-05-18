import { existsStudentWithPhoneNumberAndEmail } from '../../students/student-service'

export default async ({ phone_number: phoneNumber, email }) => (
  existsStudentWithPhoneNumberAndEmail(phoneNumber, email)
)
