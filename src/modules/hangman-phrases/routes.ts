import { route, files, id, payloadValidate, query } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { Router } from 'express'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'
import { HangmanPhraseWithHintsDTO } from './actions/create-hangman-phrase-with-hints'

export default (app: Router): void => {
  app.post('/hangman-phrases', authAdmin, route(Actions.createHangmanPhrase, [files, payloadValidate(Validation.createHangmanPhraseSchema)]))
  app.post('/hangman-phrases/with-hints', authAdmin, route(Actions.createHangmanPhraseWithHints, [payloadValidate(Validation.createHangmanPhraseWithHintsSchema)]))
  app.post('/hangman-phrases/upload-image-hint', authAdmin, route(Actions.uploadHangmanImageHint, [files]))

  app.get('/hangman-phrases/categories', authStudentOrAdmin, route(Actions.fetchHangmanPhraseCategories))
  app.get('/hangman-phrases/:id', authStudentOrAdmin, route(Actions.fetchHangmanPhrase, [id]))
  app.get('/hangman-phrases', authStudentOrAdmin, route(Actions.fetchHangmanPhrases, [query]))

  app.patch('/hangman-phrases/:id', authAdmin, route(Actions.updateHangmanPhrase, [id, files, payloadValidate(Validation.updateHangmanPhraseSchema)]))
  app.patch('/hangman-phrases/:id/with-hints', authAdmin, route(Actions.updateHangmanPhraseWithHints, [id, payloadValidate<Partial<HangmanPhraseWithHintsDTO>>(Validation.updateHangmanPhraseWithHintsSchema)]))

  app.delete('/hangman-phrases/:id', authAdmin, route(Actions.softDeleteHangmanPhrase, [id]))
}
