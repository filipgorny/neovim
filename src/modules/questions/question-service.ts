import * as R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { DELETED_AT } from '../../../utils/generics/repository'
import { patch as patchContentQuestion } from '../book-content-questions/book-content-questions-repository'
import { findOneOrFail, create, deleteCompletely } from './question-repository'

export const copyQuestionById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }),
    copyQuestion,
  ])(true)
)

export const copyQuestion = async (question) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    create,
    R.invoker(0, 'toJSON'),
  ])(question)
)

export const copyAndArchiveQuestionById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }),
    copyAndArchiveQuestion,
  ])(true)
)

export const copyAndArchiveQuestion = async (question) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    R.set(
      R.lensProp('is_archived'),
      true
    ),
    create,
    R.invoker(0, 'toJSON'),
  ])(question)
)

export const splitQuestionById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }, ['contentQuestions.content.subchapter.chapter.book']),
    splitQuestion,
  ])(true)
)

export const splitQuestion = async (question) => (
  R.pipeWith(R.andThen)([
    asAsync(R.prop('contentQuestions')),
    mapP(
      async (contentQuestion) => {
        const book = R.path(['content', 'subchapter', 'chapter', 'book'], contentQuestion)
        let newQuestion

        if (R.prop('is_archived', book) || R.prop(DELETED_AT, book)) {
          newQuestion = await copyAndArchiveQuestionById(question.id)
        } else {
          newQuestion = await copyQuestionById(question.id)
        }

        await patchContentQuestion(contentQuestion.id, { question_id: newQuestion.id })

        return newQuestion
      }
    ),
    async questions => {
      if (questions.length > 0 && (!R.all(R.prop('is_archived'))(questions) || (R.all(R.prop('is_archived'))(questions) && R.prop('is_archived')(question)))) {
        await deleteCompletely(question.id)
      }
    },
  ])(question)
)
