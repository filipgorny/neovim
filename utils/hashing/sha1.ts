import crypto from 'crypto'

export const sha1 = (str: string): string => crypto.createHash('sha1').update(str).digest('hex')

export default sha1
