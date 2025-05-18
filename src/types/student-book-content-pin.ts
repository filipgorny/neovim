export type StudentBookContentPin = {
  id: string,
  content_id: string,
  variant: string,
  note: string,
}

export type StudentBookContentPinDTO = Omit<StudentBookContentPin, 'id'>
