import snakeCase from 'lodash.snakecase'
import { Organization, OrganizationDTO } from '../../types/organization'
import { create, patch, deleteRecord } from './organizations-repository'

export const createEntity = async (dto: OrganizationDTO): Promise<Organization> => (
  create({
    ...dto,
    title_slug: snakeCase(dto.title),
  })
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
