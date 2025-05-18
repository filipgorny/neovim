
export type HangmanHint = {
  id: string
  hint_raw: string
  hint_delta_object: string | object
  hint_html: string
  order: number
  phrase_id: string
  created_at: string
  updated_at: string
}

export type HangmanHintDTO = Omit<HangmanHint, 'id' | 'created_at' | 'updated_at' | 'order'>

export const makeDTO = (
  hint_raw: string,
  hint_delta_object: string,
  hint_html: string,
  phrase_id: string
): HangmanHintDTO => ({
  hint_raw,
  hint_delta_object,
  hint_html,
  phrase_id,
})

export default HangmanHintDTO
