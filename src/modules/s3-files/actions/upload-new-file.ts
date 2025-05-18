import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { S3_PREFIX_WYSIWYG_FILES } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { saveNewFile } from '../s3-file-service'
import { fileSchema } from '../validation/schema/upload-new-file-schema'
import { validateFileMimeType } from '../validation/validate-file-mime-type'

const uploadAndSave = async image => {
  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_WYSIWYG_FILES, true)
  const url = generateStaticUrl(key)

  return saveNewFile(key, url)
}

export default async files => {
  validateFilesPayload(fileSchema)(files)
  validateFileMimeType(files.image.mimetype)

  return uploadAndSave(files.image)
}
