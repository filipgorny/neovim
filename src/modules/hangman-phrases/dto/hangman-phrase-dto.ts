
export type HangmanPhrase = {
  id: string
  phrase_raw: string
  phrase_delta_object: string | object
  phrase_html: string
  category: string
  image_hint: string
  created_at: string
  updated_at: string
  deleted_at: string
}

export type HangmanPhraseDTO = Omit<HangmanPhrase, 'id' | 'created_at' | 'deleted_at' | 'updated_at' | 'image_hint'>

export const makeDTO = (phrase_raw: string, phrase_delta_object: string, phrase_html: string, category: string): HangmanPhraseDTO => ({
  phrase_raw,
  phrase_delta_object,
  phrase_html,
  category,
})

export default HangmanPhraseDTO
