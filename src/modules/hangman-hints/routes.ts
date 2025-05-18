import { Router } from 'express'
import { route, customParam, id, payloadValidate } from '../../../utils/route/attach-route'
import Actions from './actions'
import Validation from './validation/schema'
import { authAdmin, authStudentOrAdmin } from '../../middleware/authorize'

export default (app: Router): void => {
  app.post('/hangman-hints', authAdmin, route(Actions.createHangmanHint, [payloadValidate(Validation.createHangmanHintSchema)]))

  app.get('/hangman-hints/:id', authStudentOrAdmin, route(Actions.fetchHangmanHint, [id]))
  app.get('/hangman-hints/phrase/:phrase_id', authStudentOrAdmin, route(Actions.fetchHangmanHintsByPhraseId, [customParam('phrase_id')]))

  app.patch('/hangman-hints/:id', authAdmin, route(Actions.updateHangmanHint, [id, payloadValidate(Validation.updateHangmanHintSchema)]))
  app.patch('/hangman-hints/:id/reorder/:direction', authAdmin, route(Actions.reorderHangmanHint, [id, customParam('direction')]))

  app.delete('/hangman-hints/:id', authAdmin, route(Actions.deleteHangmanHint, [id]))
}
