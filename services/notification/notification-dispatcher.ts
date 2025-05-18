/**
 * @example notificationDispatcher.candidateRegistration({email: 'user@example.com'})
 */

import moment from 'moment'
import R from 'ramda'

import { EMAIL_NOTIFICATION } from './available-drivers'
import dispatch from './dispatch'
import getDriver from './get-driver'

const basicNotificationChannels = [EMAIL_NOTIFICATION]

const fire = (name, payload, requiredProps = [], drivers = basicNotificationChannels) => (
  R.pipe(
    R.set(R.lensProp('currentYear'), moment().format('YYYY')),
    dispatch(getDriver, name, drivers)
  )(payload)
)

/**
 * Templates
 */
export const verifyEmail = payload => fire('verifyEmail', payload, [])
export const resetPassword = payload => fire('resetPassword', payload, [])
export const resetPasswordGamesUser = payload => fire('resetPasswordGamesUser', payload, [])
export const adminAccountCreated = payload => fire('adminAccountCreated', payload, [])
export const examAccessPeriodChanged = payload => fire('examAccessPeriodChanged', payload, [])
export const examExpiresInTwoDays = payload => fire('examExpiresInTwoDays', payload, [])
export const examExpired = payload => fire('examExpired', payload, [])
export const courseExpired = payload => fire('courseExpired', payload, [])
export const saltyBucksBalanceChanged = payload => fire('saltyBucksBalanceChanged', payload, [])
export const coursePaused = payload => fire('coursePaused', payload, [])
export const courseUnpaused = payload => fire('courseUnpaused', payload, [])
export const courseExpiresInThreeDays = payload => fire('courseExpiresInThreeDays', payload, [])
export const sent2faCode = payload => fire('sent2faCode', payload, [])
