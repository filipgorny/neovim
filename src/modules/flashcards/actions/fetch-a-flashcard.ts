import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findOneOrFail } from '../flashcard-repository'

export default async (id: string) => R.pipeWith(R.andThen)([
  async () => findOneOrFail({ id }),
  R.evolve({
    question_image: value => value ? generateStaticUrl(value) : null,
    explanation_image: value => value ? generateStaticUrl(value) : null,
  }),
])(true)
