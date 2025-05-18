import { Router } from 'express'
import { route, userId } from '../../../utils/route/attach-route'
import { authStudentOrAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'
import { payloadValidate } from '@desmart/js-utils'

export default (app: Router): void => {
  app.post('/hangman-answered-phrases', authStudentOrAdmin, route(Actions.addHangmanAnsweredPhraseOrder, [userId, payloadValidate(Validation.addHangmanAnsweredPhraseOrderSchema)]))
  app.post('/hangman-answered-phrases/random-unanswered', authStudentOrAdmin, route(Actions.getRandomUnansweredHangmanPhrase, [userId, payloadValidate(Validation.getRandomUnansweredHangmanPhraseSchema)]))
}
