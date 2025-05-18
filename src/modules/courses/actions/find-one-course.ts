import { findOneOrFail } from '../course-repository'

export default async id => (
  findOneOrFail({ id }, ['attached.exam', 'books.attached.exam', 'books.chapters.attached.exam', 'books'])
)
