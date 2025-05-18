import R from 'ramda'

const stripTags = string => string.replace(/(<([^>]+)>)/gi, '')

const replaceEscapeCharacters = content => content.replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const removeEscapeCharacters = content => content.replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

export const correctAnswerFromExplanation = R.pipe(
  replaceEscapeCharacters,
  stripTags,
  removeEscapeCharacters,
  R.head
)
