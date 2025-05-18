import * as R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findOneOrFailWithoutDeleted } from '../hangman-phrases-repository'

export default async (id: string) => {
  const result = await findOneOrFailWithoutDeleted({ id }, ['hints'])

  return {
    ...R.over(R.lensProp('hints'), R.sortBy(R.prop('order')), result),
    image_hint: generateStaticUrl(result.image_hint),
  }
}
