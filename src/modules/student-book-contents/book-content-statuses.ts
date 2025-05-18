export enum BookContentStatusEnum {
  seen = 'seen',
  unseen = 'unseen',
}

export type BookContentStatus = keyof typeof BookContentStatusEnum

export const BookContentStatuses = Object.values(BookContentStatusEnum)
