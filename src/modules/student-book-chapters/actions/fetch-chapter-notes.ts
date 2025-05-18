import R from 'ramda'
import { checkIfSpecifiedChapterExist } from '../student-book-chapter-repository'
import { notFoundException } from '../../../../utils/error/error-factory'
import { fetchChapterNotes } from '../student-book-chapter-service'

interface ValidateIfBookChapterExistCommand {
  studentId: string;
  chapterId: string;
}

const validateIfBookChapterExist = async (command: ValidateIfBookChapterExistCommand) => {
  const bookChapterExist = await checkIfSpecifiedChapterExist(command)

  if (!bookChapterExist) {
    throw notFoundException('StudentBookChapter')
  }

  return command
}

export default async (user: any, chapterId: string) => {
  return R.pipeWith(R.andThen)([
    validateIfBookChapterExist,
    fetchChapterNotes,
  ])({ studentId: user.get('id'), chapterId })
}
