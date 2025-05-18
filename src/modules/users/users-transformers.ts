import * as R from 'ramda'

export const hideSensitiveData = R.pipe(
  R.set(R.lensProp('password'), null),
  R.set(R.lensProp('email_verification_token'), null),
  R.set(R.lensProp('is_email_verified'), null),
  R.set(R.lensProp('password_reset_token'), null),
  R.set(R.lensProp('password_reset_token_created_at'), null)
)
