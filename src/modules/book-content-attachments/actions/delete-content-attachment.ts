import { deleteAttachment } from '../book-content-attachment-service'

export default async (id: string) => (
  deleteAttachment(id)
)
