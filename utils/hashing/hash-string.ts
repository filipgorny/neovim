import bcrypt from 'bcryptjs'

const saltRounds = 10

export default string => bcrypt.hashSync(string, saltRounds)
