import { id, payload, payloadValidate, query, route } from '../../../utils/route/attach-route'
import { authStudentOrAdmin, authAdmin } from '../../middleware/authorize'
import createGlossaryRecord from './actions/create-glossary-record'
import fetchGlossaryRecords from './actions/fetch-glossary-records'
import fetchGlossaryRecord from './actions/fetch-glossary-record'
import updateGlossaryRecord from './actions/update-glossary-record'
import scanBooksForGlossary from './actions/scan-books-for-glossary'
import scanContentForGlossary from './actions/scan-content-for-glossary'
import removeGlossaryRecord from './actions/remove-glossary-record'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'
import { schema as createGlossaryRecordSchema } from './validation/schema/create-glossary-record-schema'
import { schema as updateGlossaryRecordSchema } from './validation/schema/update-glossary-record-schema'
import searchGlossary from './actions/search-glossary'

export default app => {
  app.post('/glossary', permCheck(GlobalPerms.G), route(createGlossaryRecord, [payloadValidate(createGlossaryRecordSchema)]))
  app.post('/glossary/scan', permCheck(GlobalPerms.G), route(scanContentForGlossary, [query, payload]))

  app.get('/glossary', authStudentOrAdmin, route(fetchGlossaryRecords, [query]))
  app.get('/glossary/search', authStudentOrAdmin, route(searchGlossary, [query]))
  app.get('/glossary/:id', authStudentOrAdmin, route(fetchGlossaryRecord, [id]))
  app.get('/glossary/:id/scan-books', authAdmin, route(scanBooksForGlossary, [id, query]))

  app.patch('/glossary/:id', permCheck(GlobalPerms.G), route(updateGlossaryRecord, [id, payloadValidate(updateGlossaryRecordSchema)]))

  app.delete('/glossary/:id', permCheck(GlobalPerms.G), route(removeGlossaryRecord, [id]))
}
