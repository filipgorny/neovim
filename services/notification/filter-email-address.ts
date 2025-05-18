const R = require('ramda')

const domainsWhitelist = [
  'desmart.com',
  'examkrackers.com',
  'swordsweeper.com',
  'prep101.com',
  'xavier.edu',
]

const domainFromEmail = R.pipe(
  R.split('@'),
  R.last
)

const replaceEmailAddress = replacementEmail => R.ifElse(
  R.propSatisfies(shouldReplaceEmail, 'email'),
  R.evolve({
    email: R.always(replacementEmail),
  }),
  R.identity
)

const isProductionEnv = env => () => R.equals('production', env('NODE_ENV'))
const shouldReplaceEmail = email => R.contains(domainFromEmail(email), domainsWhitelist) === false

const replaceEmailIfNotOnProduction = (isProduction, replacementEmail) => R.ifElse(
  isProduction,
  R.identity,
  replaceEmailAddress(replacementEmail)
)

const replaceEmailInArray = (isProduction, replacementEmail) => R.evolve({
  email: R.map(replaceEmailIfNotOnProduction(isProduction, replacementEmail)),
})

const replaceEmailsInPayload = (isProduction, replacementEmail) => R.ifElse(
  R.propSatisfies(R.is(String), 'email'),
  replaceEmailIfNotOnProduction(isProduction, replacementEmail),
  replaceEmailInArray(isProduction, replacementEmail)
)

const filterEmailAddress = (isProduction, replacementEmail) => payload => (
  R.ifElse(
    R.is(Array),
    R.map(replaceEmailsInPayload(isProduction, replacementEmail)),
    replaceEmailsInPayload(isProduction, replacementEmail)
  )(payload)
)

export default env => filterEmailAddress(isProductionEnv(env), env('DEV_EMAIL_ADDRESS'))
