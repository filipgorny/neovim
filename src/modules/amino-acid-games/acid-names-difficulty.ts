export enum AcidNamesDifficultyEnum {
  normal = 'normal',
  short = 'short',
  oneLetter = 'one_letter',
}

export type AcidNamesDifficulty = keyof typeof AcidNamesDifficultyEnum

export const AcidNamesDifficulties = Object.values(AcidNamesDifficultyEnum)
