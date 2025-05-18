/***
 * The exam consists of sections, which have passages, which have questions. In order to display the exam navigation
 * on the front-end, we need to flatten this structure, omitting passages. We need to fetch all the questions from each
 * section and order them properly, so the following structure:

 sections: [
   {
      passages: [
        {
          questions: [
            {order: 2, id: 'q2'},
            {order: 3, id: 'q3'},
            {order: 1, id: 'q1'}
          ]
        },
        {
          questions: [
            {order: 1, id: 'q4'},
            {order: 2, id: 'q5'},
          ]
        }
      ]
    }
 ]

 * will be converted to the following:

 sections: [
   {
      questions: [
        { id: "q1", order: 1, original_order: 1 },
        { id: "q2", order: 2, original_order: 2 },
        { id: "q3", order: 3, original_order: 3 },
        { id: "q4", order: 4, original_order: 1 },
        { id: "q5", order: 5, original_order: 2 }
    ],
   }
 ]
 */

import * as R from 'ramda'

const sortByOrder = data => (
  R.sortBy(
    R.prop('order')
  )(data)
)

const extractPassages = R.pipe(
  R.prop('passages'),
  // @ts-ignore
  R.map(
    R.pick(['id', 'order', 'is_false_passage', 'original_exam_passage_id'])
  ),
  sortByOrder
)

const formatOutput = section => questions => (
  {
    id: section.id,
    title: section.title,
    full_title: section.full_title,
    order: section.order,
    section_status: section.section_status,
    questions: questions,
    // @ts-ignore
    passages: extractPassages(section),
  }
)

const appendOriginalQuestion = (question, response) => (
  R.pipe(
    R.prop('originalQuestion'),
    R.pick(['correct_answers_amount', 'all_answers_amount', 'difficulty_percentage']),
    R.objOf('original_question'),
    R.mergeLeft(response)
  )(question)
)

const formatQuestion = (withCorrectAnswer = false, withOriginalQuestions = false, withPassage = false, questionDecorator = R.always({})) => (question, index) => {
  const response = {
    order: index + 1,
    id: question.id,
    original_order: question.order,
    is_flagged: question.is_flagged,
    question_status: question.question_status,
    answer: question.answer,
    correct_answer: withCorrectAnswer ? question.correct_answer : null,
    original_exam_question_id: question.original_exam_question_id,
    passage: withPassage ? question.passage : null,
    // @ts-ignore
    ...questionDecorator(question),
  }

  return withOriginalQuestions ? appendOriginalQuestion(question, response) : response
}

const mergeQuestions = R.pipe(
  R.prop('passages'),
  sortByOrder,
  R.pluck('questions'),
  R.map(sortByOrder),
  R.flatten
)

const orderQuestions = (withCorrectAnswer, withOriginalQuestions, withPassage, questionDecorator) => R.pipe(
  R.prop('questions'),
  R.addIndex(R.map)(formatQuestion(withCorrectAnswer, withOriginalQuestions, withPassage, questionDecorator))
)

const mergeBySection = section => (
  R.pipe(
    mergeQuestions,
    formatOutput(section)
  )(section)
)

const orderBySection = (withCorrectAnswer, withOriginalQuestions, withPassage, questionDecorator) => section => (
  R.pipe(
    orderQuestions(withCorrectAnswer, withOriginalQuestions, withPassage, questionDecorator),
    formatOutput(section)
  )(section)
)

const findExamLengthBySectionTitle = examLength => title => (
  R.find(
    R.propEq('section', title)
  )(examLength)
)

const appendLengthToSection = examLength => section => (
  R.pipe(
    R.prop('title'),
    findExamLengthBySectionTitle(examLength),
    R.objOf('sectionLength'),
    R.mergeLeft(section)
  )(section)
)

const appendSectionLength = exam => payload => {
  const examLength = R.path(['exam_length', 'sections'])(exam)

  return R.map(
    appendLengthToSection(examLength)
  )(payload)
}

export const flattenQuestions = (exam, withCorrectAnswer = false, withOriginalQuestions = false, withPassage = false, questionDecorator = undefined) => (
  R.pipe(
    R.prop('sections'),
    sortByOrder,
    R.map(mergeBySection),
    R.flatten,
    R.map(orderBySection(withCorrectAnswer, withOriginalQuestions, withPassage, questionDecorator)),
    appendSectionLength(exam)
  )(exam)
)

export type FlattenQuestionsConfig = {
  withCorrectAnswer?: boolean,
  withOriginalQuestions?: boolean,
  withPassage?: boolean,
  questionDecorator?: Function
}

export const flattenQuestionsCustom = (exam, config: FlattenQuestionsConfig) => (
  flattenQuestions(
    exam,
    config.withCorrectAnswer || false,
    config.withOriginalQuestions || false,
    config.withPassage || false,
    config.questionDecorator || undefined
  )
)
