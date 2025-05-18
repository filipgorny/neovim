import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { GlossaryRecord } from '../../../types/glossary-record'
import GlossaryRecordDTO from '../dto/glossary-record-dto'
import { createGlossaryRecord } from '../glossary-service'
import { schema } from '../validation/schema/create-glossary-record-schema'
import { validatePhraseIsUnique } from '../validation/validate-phrase-is-unique'

const createRecord = async (dto: GlossaryRecordDTO): Promise<GlossaryRecord> => (
  createGlossaryRecord(dto.phrase_raw, dto.explanation_raw, dto.phrase_delta_object, dto.explanation_delta_object, dto.phrase_html, dto.explanation_html)
)

export default async (payload: GlossaryRecordDTO): Promise<GlossaryRecord> => {
  validateEntityPayload(schema)(payload)

  await validatePhraseIsUnique(payload)

  return createRecord(payload)
}
