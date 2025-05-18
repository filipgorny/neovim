import R from 'ramda'
import env from '../env'

const replaceEscapeCharacters = content => content.replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const removeEscapeCharacters = content => content.replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

export const wrapS3ImagesInHtml = content => {
  let wrapped = String(content)

  try {
    wrapped = replaceEscapeCharacters(wrapped)
    wrapped = R.replace(new RegExp(`(https://${env('S3_BUCKET_NAME')}[^\\s<]+)`, 'gm'), '<img src="$1" />')(wrapped)
    wrapped = removeEscapeCharacters(wrapped)

    return wrapped
  } catch (e) {
    return ''
  }
}
