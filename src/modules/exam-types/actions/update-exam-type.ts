import * as R from 'ramda'
import { findOneOrFail } from '../exam-type-repository'
import { updateExamType } from '../exam-type-service'
import validateSectionTitlesPayload from '../validation/validate-section-titles-payload'

type Payload = {
  title: string,
  type_label?: string,
  section_titles?: Array<{ order: number, value: string }>
}

const transformSectionTitles = (section_titles: Array<{ order: number, value: string }>) => (
  R.pipe(
    R.sort((a, b) => a.order - b.order),
    R.map(st => [`section_${st.order}`, st.value]),
    R.map(R.apply(R.objOf)),
    R.mergeAll
  )(section_titles)
)

export default async (id: string, payload: Payload) => {
  const { title, section_titles, type_label } = payload
  const { section_count } = await findOneOrFail({ id })

  if (section_titles) {
    validateSectionTitlesPayload(section_titles, section_count)

    const transformedSectionTitles = transformSectionTitles(section_titles)

    return updateExamType(id, title, type_label, JSON.stringify(transformedSectionTitles))
  }

  return updateExamType(id, title, type_label)
}
