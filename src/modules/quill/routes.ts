import { customParam, id, payloadValidate, query, route } from '@desmart/js-utils'
import { authAdmin } from '../../middleware/authorize'
import fetchLinks from './actions/fetch-links'
import getDeltaObject from './actions/get-delta-object'
import updateHtmlData from './actions/update-html-data'
import { schema as updateHtmlDataSchema } from './validation/schema/update-html-data'

export default app => {
  app.get('/quill/links/:table/:column', authAdmin, route(fetchLinks, [customParam('table'), customParam('column'), query]))
  app.get('/quill/delta/:table/:column/:id', authAdmin, route(getDeltaObject, [customParam('table'), customParam('column'), id]))
  app.patch('/quill/html/:id', authAdmin, route(updateHtmlData, [id, payloadValidate(updateHtmlDataSchema)]))
}
