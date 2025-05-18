import { create, patch, findOne } from './student-pin-variants-repository'

export const upsertPinVariant = async (student_book_id: string, student_id: string, variant: string, title?: string) => {
  const dto = {
    student_book_id,
    student_id,
    variant,
  }

  const pinVariant = await findOne(dto)

  return pinVariant
    ? patch(pinVariant.id, { title })
    : create({ ...dto, title })
}
