import mapP from '../../../utils/function/mapp'
import { ContentQuestionReactionDTO, ContentQuestionReaction } from '../../types/content-question-reaction'
import { create, patch, deleteRecord } from './content-question-reactions-repository'

export const createEntity = async (dto: ContentQuestionReactionDTO): Promise<ContentQuestionReaction> => (
  create(dto)
)

export const updateEntity = async (id: string, entity: ContentQuestionReaction): Promise<ContentQuestionReaction> => (
  patch(id, entity)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const deleteMany = async (ids: string[]) => (
  mapP(deleteRecord)(ids)
)
