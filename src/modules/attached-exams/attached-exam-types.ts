export enum AttachedExamTypeEnum {
  course = 'course',
  book = 'book',
  chapter = 'chapter'
}

export type AttachedExamType = keyof typeof AttachedExamTypeEnum

export const AttachedExamTypes = Object.values(AttachedExamTypeEnum)
