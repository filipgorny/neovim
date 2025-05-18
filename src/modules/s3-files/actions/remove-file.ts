import { deleteS3File } from '../s3-file-service'

export default async id => (
  deleteS3File(id)
)
