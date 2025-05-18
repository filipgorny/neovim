import { GlossaryRecord } from '../../types/glossary-record'
import GlossaryRecordDTO from './dto/glossary-record-dto'
import { create, update, patch, findOneOrFail, detachGlossaryFromBookContents, deleteRecord, detachGlossaryFromBookContentResources } from './glossary-repository'

export const createGlossaryRecord = async (
  phrase_raw: string,
  explanation_raw: string,
  phrase_delta_object: string,
  explanation_delta_object: string,
  phrase_html: string,
  explanation_html: string
): Promise<GlossaryRecord> => (
  create({
    phrase_raw,
    explanation_raw,
    phrase_delta_object,
    explanation_delta_object,
    phrase_html,
    explanation_html,
  })
)

export const updateGlossaryRecord = async (id: string, dto: GlossaryRecordDTO) => (
  update(id, dto)
)

export const patchGlossaryRecord = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const removeGlossaryRecord = async id => {
  const glossary = await findOneOrFail({ id })

  await detachGlossaryFromBookContents(glossary.id)
  await detachGlossaryFromBookContentResources(glossary.id)

  return deleteRecord(glossary.id)
}
