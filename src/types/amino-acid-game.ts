import { AcidNamesDifficultyEnum } from '../modules/amino-acid-games/acid-names-difficulty'

type AminoAcidGameAnswer = {
  acid_id: string,
  answer: string,
  group: string,
  is_correct: boolean
}

export type AminoAcidGame = {
  id: string,
  student_id: string,
  score: number,
  correct_amount: number,
  incorrect_amount: number,
  blox_game_enabled: boolean,
  acid_names_difficulty: AcidNamesDifficultyEnum,
  answers: AminoAcidGameAnswer[],
  ia_a_win: boolean,
  expenses: number,
  is_paused: boolean,
}

export type AminoAcidGameDTO = Omit<AminoAcidGame, 'id' | 'student_id'>
