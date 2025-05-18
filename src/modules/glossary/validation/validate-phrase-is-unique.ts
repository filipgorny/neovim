import * as R from 'ramda'
import { resourceAlreadyExistsException, throwException } from '../../../../utils/error/error-factory'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import GlossaryRecordDTO from '../dto/glossary-record-dto'
import { findOneByPhrase, findOneByPhraseExcludeId } from '../glossary-repository'

const validatePhraseIsUniqueUseSearchFn = (searchFn: Function) => async (dto: GlossaryRecordDTO) => (
  R.pipeWith(R.andThen)([
    // @ts-ignore
    searchFn,
    R.prop('data'),
    collectionToJson,
    R.length,
    Boolean,
    R.when(
      R.equals(true),
      () => throwException(resourceAlreadyExistsException('GlossaryRecord'))
    ),
  ])(dto.phrase_raw)
)

export const validatePhraseIsUnique = async (dto: GlossaryRecordDTO) => (
  validatePhraseIsUniqueUseSearchFn(findOneByPhrase)(dto)
)

export const validatePhraseIsUniqueExcludeSelf = async (id: string, dto: GlossaryRecordDTO) => (
  validatePhraseIsUniqueUseSearchFn(findOneByPhraseExcludeId(id))(dto)
)
