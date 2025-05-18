import saltyBucksBalanceChanged from './schema/saltyBucksBalanceChanged'

const sgMail = require('@sendgrid/mail')
import env from '../../../utils/env'
import filterEmailAddress from '../filter-email-address'

import resetPassword from './schema/resetPassword'
import resetPasswordGamesUser from './schema/resetPasswordGamesUser'
import verifyEmail from './schema/verifyEmail'
import adminAccountCreated from './schema/adminAccountCreated'
import examAccessPeriodChanged from './schema/examAccessPeriodChanged'
import examExpiresInTwoDays from './schema/examExpiresInTwoDays'
import examExpired from './schema/examExpired'
import courseExpired from './schema/courseExpired'
import coursePaused from './schema/coursePaused'
import courseUnpaused from './schema/courseUnpaused'
import courseExpiresInThreeDays from './schema/courseExpiresInThreeDays'
import sent2faCode from './schema/sent2faCode'

const setup = () => {
  sgMail.setApiKey(env('SENDGRID_API_KEY'))
}

const schemas = {
  resetPassword,
  verifyEmail,
  adminAccountCreated,
  examAccessPeriodChanged,
  examExpiresInTwoDays,
  examExpired,
  resetPasswordGamesUser,
  saltyBucksBalanceChanged,
  courseExpired,
  coursePaused,
  courseUnpaused,
  courseExpiresInThreeDays,
  sent2faCode,
}

const mailer = () => sgMail
const schema = (name, payload) => schemas[name](payload)

const dispatch = (name, payload) => {
  const mailToSend = schema(name, filterEmailAddress(env)(payload))

  mailer().send(mailToSend)
}

setup()

export default dispatch
