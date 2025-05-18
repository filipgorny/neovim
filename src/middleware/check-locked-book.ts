import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { bookLockedException, throwException } from '../../utils/error/error-factory'
import { findOneOrFail as findBook } from '../modules/books/book-repository'
import { findOneOrFail as findChapter } from '../modules/book-chapters/book-chapter-repository'
import { findOneOrFail as findSubchapter } from '../modules/book-subchapters/book-subchapter-repository'
import { findOneOrFail as findContent } from '../modules/book-contents/book-content-repository'

const isLockedByPath = path => R.pipe(
  R.path([...path.split('.'), 'is_locked']),
  R.equals(true)
)

export const checkLockedBook = wrap(async (req, res, next) => {
  const book = await findBook({ id: req.params.id })

  if (book.is_locked) {
    throwException(bookLockedException())
  }

  next()
})

export const checkLockedBookCustomIdPath = (path) => wrap(async (req, res, next) => {
  const book = await findBook({ id: R.path(path)(req) })

  if (book.is_locked) {
    throwException(bookLockedException())
  }

  next()
})

const checkIfBookIsLockedByRelationPath = (relationPath, findFn, idPath = ['params', 'id']) => async req => {
  const entityId = R.path(idPath)(req)
  const entity = await findFn({ id: entityId }, [relationPath])

  if (isLockedByPath(relationPath)(entity)) {
    throwException(bookLockedException())
  }
}

export const checkLockedBookByChapterId = wrap(async (req, res, next) => {
  await checkIfBookIsLockedByRelationPath('book', findChapter)(req)

  next()
})

export const checkLockedBookByChapterIdCustomPath = path => wrap(async (req, res, next) => {
  await checkIfBookIsLockedByRelationPath('book', findChapter, path)(req)

  next()
})

export const checkLockedBookBySubchapterId = wrap(async (req, res, next) => {
  await checkIfBookIsLockedByRelationPath('chapter.book', findSubchapter)(req)

  next()
})

export const checkLockedBookBySubchapterIdCustomPath = path => wrap(async (req, res, next) => {
  await checkIfBookIsLockedByRelationPath('chapter.book', findSubchapter, path)(req)

  next()
})

export const checkLockedBookByContentId = wrap(async (req, res, next) => {
  await checkIfBookIsLockedByRelationPath('subchapter.chapter.book', findContent)(req)

  next()
})
