import { files, id, payloadValidate, query, route } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import { looseBookOrGlobalPermission, onlyAssignedFlashcards } from '../../middleware/book-permission'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import createFlashcard from './actions/create-flashcard'
import fetchFlashcard from './actions/fetch-a-flashcard'
import fetchFlashcards from './actions/fetch-flashcards'
import removeFlashcard from './actions/remove-flashcard'
import setFlashcardCode from './actions/set-flashcard-code'
import updateFlashcard from './actions/update-flashcard'

import { schema as createFlashcardSchema } from './validation/schema/create-flashcard-schema'
import { schema as updateFlashcardSchema } from './validation/schema/update-flashcard-schema'
import { schema as setFlashcardCodeSchema } from './validation/schema/set-flashcard-code-schema'

export default app => {
  app.post('/flashcards', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_flashcards, GlobalPerms.F), route(createFlashcard, [files, payloadValidate(createFlashcardSchema)]))
  app.post('/flashcards/:id/set-code', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_flashcards, GlobalPerms.F), route(setFlashcardCode, [id, payloadValidate(setFlashcardCodeSchema)]))

  app.patch('/flashcards/:id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_flashcards, GlobalPerms.F), onlyAssignedFlashcards, route(updateFlashcard, [id, files, payloadValidate(updateFlashcardSchema)]))

  app.get('/flashcards', authAdmin, route(fetchFlashcards, [query]))
  app.get('/flashcards/:id', authAdmin, route(fetchFlashcard, [id]))

  app.delete('/flashcards/:id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_flashcards, GlobalPerms.F), onlyAssignedFlashcards, route(removeFlashcard, [id]))
}
