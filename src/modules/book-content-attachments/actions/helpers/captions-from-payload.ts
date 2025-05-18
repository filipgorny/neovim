import * as R from 'ramda'

export const captionsFromPayload = R.applySpec({
  main_caption: R.propOr('', 'mainCaption'),
  secondary_caption: R.propOr('', 'secondaryCaption'),
})
