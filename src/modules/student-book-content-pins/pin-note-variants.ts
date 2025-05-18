export enum PinNoteVariantEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

export type PinNoteVariant = keyof typeof PinNoteVariantEnum
export const PinNoteVariants = Object.values(PinNoteVariantEnum)
