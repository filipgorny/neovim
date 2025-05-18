import attachProductsByAdmin from '../actions/attach-products-by-admin'
import { simulateSyncStudent } from '../actions/helpers/simulate-sync-student'
import { findOneOrFail } from '../student-repository'

describe('testing attach products by admin', () => {
  it('should attach products to student', async () => {
    const email = 'bogdan+attach+products+1@desmart.com'
    const name = 'Special student'
    const phone_number = '01592837456'
    await simulateSyncStudent(email, name, phone_number)
    const student = await findOneOrFail({ email })

    await attachProductsByAdmin(student.id, {
      exams: [],
      courses: [],
      extentions: [],
    })
  })
})
