import R from 'ramda'
import { create } from './exam-passage-repository'
import { makeDTO } from './dto/exam-passage-dto'
import mapP from '../../../utils/function/mapp'
import { createExamQuestions } from '../exam-questions/exam-question-service'
import { countWords } from '../../../utils/string/count-words'

const isFalsePassage = content => content.length < 200

const contentContainsKeywords = content => R.pipe(
  R.match(/.*passage.*/gi),
  R.when(
    R.isEmpty,
    R.always(
      R.match(/.*question.*/gi)(content)
    )
  ),
  R.isEmpty,
  R.not
)(content)

export const createExamPassages = async (section_id: string, contents: string[], questions: any) => (
  R.addIndex(mapP)(
    // @ts-ignore
    async (content: string, index: number) => {
      const shouldSave = contentContainsKeywords(content)

      if (!shouldSave) {
        return
      }

      const passage = await create(
        makeDTO(section_id, content, index + 1, isFalsePassage(content), countWords(content))
      )

      await createExamQuestions(passage.id, questions[index])

      return passage
    }
    // @ts-ignore
  )(contents)
)
