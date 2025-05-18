import * as R from 'ramda'
import { find } from '../../exam-section-scores/exam-section-scores-repository'
import { findOneOrFail } from '../exam-section-repository'

const findScores = async (section_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { dir: 'asc', by: 'score' } }, {
    section_id,
  })
)

export default async (section_id: string) => {
  const scores = await R.pipeWith(R.andThen)([
    findScores,
    R.prop('data'),
  ])(section_id)

  const section = await findOneOrFail({ id: section_id })

  return {
    ...section,
    scores,
  }
}
