import { files, route, id } from '../../../utils/route/attach-route'
import uploadNewFile from './actions/upload-new-file'
import removeFile from './actions/remove-file'
import { authAdmin } from '../../middleware/authorize'

export default app => {
  app.post('/s3-files', authAdmin, route(uploadNewFile, [files]))
  app.delete('/s3-files/:id', authAdmin, route(removeFile, [id]))
}
