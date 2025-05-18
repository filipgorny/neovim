import { RANDOM } from '../../hangman-answered-phrases/validation/schema/get-random-unanswered-hangman-phrase-schema'
import { HangmanPhraseCategory } from '../hangman-phrases-categories-enum'

export default async (): Promise<string[]> => (
  Object.values(HangmanPhraseCategory)
)
