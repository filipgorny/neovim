export enum BookContentResourceTypeEnum {
  video = 'video',
  tmi = 'tmi',
  clinical_context = 'clinical_context',
  mcat_think = 'mcat_think'
}

export type BookContentResourceType = keyof typeof BookContentResourceTypeEnum

export const BookContentResourceTypes = Object.values(BookContentResourceTypeEnum)
