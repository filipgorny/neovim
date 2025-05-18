import { create, patchCustom, reorderFlashcardsToStudy, find as findFlashcards, deleteById as deleteFlashcardById } from './student-book-content-flashcard-repository'
import { makeDTO } from './dto/student-book-content-flashcard-dto'
import mapP from '../../../utils/function/mapp'
import asAsync from '../../../utils/function/as-async'
import R from 'ramda'
import { FlashcardPLevels } from '../../../services/student-book-content-flashcards/flashcard-p-levels'
import { deleteRecord as deleteActivityTimer } from '../flashcard-activity-timers/flashcard-activity-timers-repository'
import { deleteRecord as deleteBoxFlashcard } from '../student-box-flashcards/student-box-flashcards-repository'
import { deleteRecord as deleteArchivedFlashcard } from '../student-flashcard-archive/student-flashcard-archive-repository'
import { StudentBookContentFlashcard } from '../../models'
import { fetchRaw } from '../../../utils/model/fetch'
import { Knex } from 'knex'
import { shuffleArray } from '../../../utils/array/shuffle-array'
import { collectionToJson } from '../../../utils/model/collection-to-json'

export const createBookContentFlashcard = async (
  content_id: string,
  original_flashcard_id: string
) => (
  create(
    makeDTO(content_id, original_flashcard_id, 1)
  )
)

export const cretateBookContentFlashcardsFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.prop('id'),
      ])),
      R.apply(createBookContentFlashcard),
    ])
  )(originals)
)

const findFlashcardIds = (student_id, flashcard?) => async (knex: Knex) => (
  knex({ sbcf: 'student_book_content_flashcards' })
    .leftJoin({ sbc: 'student_book_contents' }, 'sbc.id', 'sbcf.content_id')
    .leftJoin({ sbs: 'student_book_subchapters' }, 'sbs.id', 'sbc.subchapter_id')
    .leftJoin({ sbc2: 'student_book_chapters' }, 'sbc2.id', 'sbs.chapter_id')
    .leftJoin({ sb: 'student_books' }, 'sb.id', 'sbc2.book_id')
    .where({
      ...flashcard && { 'sbcf.id': flashcard.id, original_flashcard_id: flashcard.original_flashcard_id },
      student_id,
    })
    .select('sbcf.id')
)

const getFlashcardIdsToUpdate = async (student_id, flashcard?) => (
  R.pipeWith(R.andThen)([
    async () => fetchRaw(StudentBookContentFlashcard, findFlashcardIds(student_id, flashcard))({}),
    R.prop('data'),
    R.pluck('id'),
  ])(true)
)

const increaseFlashcardPLevel = async (student_id, flashcard?) => {
  const flashcardIds = await getFlashcardIdsToUpdate(student_id, flashcard)
  const pLevel = Math.min(flashcard.proficiency_level + 1, FlashcardPLevels.maxLevel)

  await patchCustom(
    StudentBookContentFlashcard.whereIn('id', flashcardIds)
  )({
    proficiency_level: pLevel,
  })

  return pLevel
}

const decreaseFlashcardPLevel = async (student_id, flashcard?) => {
  const flashcardIds = await getFlashcardIdsToUpdate(student_id, flashcard)
  const pLevel = FlashcardPLevels.minLevel

  await patchCustom(
    StudentBookContentFlashcard.whereIn('id', flashcardIds)
  )({
    proficiency_level: pLevel,
  })

  return pLevel
}

export const changeFlashcardPLevel = async (flashcard, isCorrect: boolean, studentId: string) => (
  isCorrect
    ? increaseFlashcardPLevel(studentId, flashcard)
    : decreaseFlashcardPLevel(studentId, flashcard)
)

export const shuffleStudentFlashcards = async (studentId) => {
  const studentFlashcards = await getFlashcardIdsToUpdate(studentId)
  const shuffledArray = R.pipe(
    R.prop('length'),
    R.inc,
    R.range(1),
    shuffleArray
  )(studentFlashcards)

  const flasscardsToUpdate = R.addIndex(R.map)(
    (val, idx) => ({
      id: val,
      study_order: shuffledArray[idx],
    })
  )(studentFlashcards)

  await reorderFlashcardsToStudy(flasscardsToUpdate)
}

const deleteFlashcard = async flashcard => {
  await mapP(async activityTimer => deleteActivityTimer(activityTimer.id))(flashcard.activityTimers)
  await mapP(async boxFlashcard => deleteBoxFlashcard(boxFlashcard.id))(flashcard.boxFlashcards)
  await mapP(async archivedFlashcard => deleteArchivedFlashcard(archivedFlashcard.id))(flashcard.archivedFlashcards)

  return deleteFlashcardById(flashcard.id)
}

export const deleteByContentId = async (content_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findFlashcards({ content_id }, ['activityTimers', 'boxFlashcards', 'archivedFlashcards']),
    R.prop('data'),
    collectionToJson,
    mapP(deleteFlashcard),
  ])(true)
)
