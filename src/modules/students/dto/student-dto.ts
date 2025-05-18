type StudentDTO = {
  email: string
  name: string
  phone_number: string
  salty_bucks_balance: number
  is_student?: boolean
  external_id?: number
  username?: string
}

export const makeDTO = (email: string, name: string, phone_number: string, salty_bucks_balance: number, is_student?: boolean, username?: string, external_id?: number): StudentDTO => ({
  email,
  name,
  phone_number,
  salty_bucks_balance,
  is_student,
  external_id,
  username,
})

export default StudentDTO
