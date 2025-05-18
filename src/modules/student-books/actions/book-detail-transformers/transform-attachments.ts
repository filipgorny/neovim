import * as R from 'ramda'
import { mapAttachment } from '../../../book-content-attachments/actions/get-contennt-attachments'

export const transformAttachments = R.when(
  R.has('attachments'),
  R.over(
    R.lensProp('attachments'),
    R.map(mapAttachment)
  )
)
