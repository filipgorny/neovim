export enum BookContentQuestionTypeEnum {
  multi_choice = 'multi_choice',
  single_choice = 'single_choice',
}

export type BookContentQuestionType = keyof typeof BookContentQuestionTypeEnum

export const BookContentQuestionTypes = Object.values(BookContentQuestionTypeEnum)
