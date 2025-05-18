
export type HangmanGame = {
  id: string
  student_id?: string
  amount_correct: number
  amount_incorrect: number
  score: number
  created_at: string
}

export type HangmanGameDTO = Omit<HangmanGame, 'id' | 'created_at'>

export const makeDTO = (
  student_id: string,
  amount_correct: number,
  amount_incorrect: number,
  score: number
): HangmanGameDTO => ({
  student_id,
  amount_correct,
  amount_incorrect,
  score,
})

export default HangmanGameDTO
