import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { GlossaryRecord } from '../../../types/glossary-record'
import GlossaryRecordDTO from '../dto/glossary-record-dto'
import { updateGlossaryRecord } from '../glossary-service'
import { schema } from '../validation/schema/update-glossary-record-schema'
import { validatePhraseIsUniqueExcludeSelf } from '../validation/validate-phrase-is-unique'

export default async (id: string, payload: GlossaryRecordDTO): Promise<GlossaryRecord> => {
  validateEntityPayload(schema)(payload)

  await validatePhraseIsUniqueExcludeSelf(id, payload)

  return updateGlossaryRecord(id, payload)
}
