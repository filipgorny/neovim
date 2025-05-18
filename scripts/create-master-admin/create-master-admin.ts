const prompts = require('prompts')
import hashString from '../../utils/hashing/hash-string'
import questions from './questions'
import { createMasterAdmin } from '../../src/modules/admins/admin-service'

(
  async () => {
    const { email, password } = await prompts(questions)

    await createMasterAdmin(email, hashString(password))

    console.log(`Master admin account for ${email} created`)

    return true
  }
)()