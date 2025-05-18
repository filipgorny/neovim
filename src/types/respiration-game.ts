import { RespirationNamesDifficultyEnum } from '../modules/respiration-games/respiration-names-difficulty'

type RespirationGameAnswer = {
  respiration_id: string,
  answer: string,
  group: string,
  is_correct: boolean
}

export type RespirationGame = {
  id: string,
  student_id: string,
  score: number,
  correct_amount: number,
  incorrect_amount: number,
  blox_game_enabled: boolean,
  difficulty: RespirationNamesDifficultyEnum,
  answers: RespirationGameAnswer[],
  ia_a_win: boolean,
  expenses: number,
  is_paused: boolean,
}

export type RespirationGameDTO = Omit<RespirationGame, 'id' | 'student_id'>
