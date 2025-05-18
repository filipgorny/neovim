export enum RespirationNamesDifficultyEnum {
  normal = 'normal',
}

export type RespirationNamesDifficulty = keyof typeof RespirationNamesDifficultyEnum

export const RespirationNamesDifficulties = Object.values(RespirationNamesDifficultyEnum)
