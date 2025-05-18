import * as R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../../salty-bucks-log/salty-bucks-log-repository'
import { SaltyBucksOperationType } from '../../salty-bucks-log/salty-bucks-operation-type'

const CATEGORY_MAP = {
  sign_up_free_trial: 'administration',
  purchase_course: 'administration',
  admin_set_balance: 'administration',
  complete_book_section: 'reading',
  complete_chapter: 'reading',
  complete_book: 'reading',
  complete_course: 'good_student',
  open_new_tmi: 'good_student',
  open_new_clinical_context: 'good_student',
  open_new_mcat_thinking: 'good_student',
  watch_new_video: 'video',
  watch_all_videos_in_chapter: 'video',
  watch_all_videos_in_book: 'video',
  flashcard_increase_p_level: 'flashcards',
  flashcard_reset_p_level: 'flashcards',
  answer_content_question: 'content_questions',
  correct_answer_content_question: 'content_questions',
  complete_chapter_quiz_mini_mcat: 'mcatq',
  answer_chapter_quiz_question_mini_mcat: 'mcatq',
  review_question_mini_mcat: 'mcatq',
  complete_full_mcat: 'mcatq',
  answer_question_full_mcat: 'mcatq',
  review_question_full_mcat: 'mcatq',
  active_on_site_2min: 'good_student',
  active_on_site_30min: 'good_student',
  dashboard_velocity_3_days_green: 'good_student',
  multiplier_test_question_full_mcat: 'mcatq',
  multiplier_answer_content_question_correct: 'content_questions',
  multiplier_chapter_quiz_question_mini_mcat: 'mcatq',
  complete_default_exam: 'mcatq',
  answer_question_default_exam: 'mcatq',
  review_question_default_exam: 'mcatq',
  multiplier_test_question_default_exam: 'mcatq',
  end_amino_acid_game: 'games',
  end_respiration_game: 'games',
  end_hangman_game: 'games',
}

const getSaltyBucksLogs = async (student_id: string) => (
  find({ limit: { page: 1, take: 1000 }, order: { by: 'created_at', dir: 'desc' } }, { student_id, operation_type: SaltyBucksOperationType.income })
)

const groupLogsByCategories = categories => R.groupBy(
  item => categories[item.operation_subtype]
)

const sumAmounts = R.pipe(
  R.pluck('amount'),
  R.sum
)

const sumAllCategories = items => (
  R.forEachObjIndexed(
    (value, key) => {
      items[key] = sumAmounts(value)
    }
  )(items)
)

const getCategoriesFromMap = R.pipe(
  R.values,
  R.uniq
)

const aggregateSaltyBuckLogs = R.pipe(
  R.juxt([
    R.pipe(
      groupLogsByCategories(CATEGORY_MAP),
      sumAllCategories,
      R.objOf('values')
    ),
    R.pipe(
      _ => getCategoriesFromMap(CATEGORY_MAP),
      R.objOf('categories')
    ),
  ]),
  R.mergeAll
)

export default async (student) => {
  return R.pipeWith(R.andThen)([
    getSaltyBucksLogs,
    R.prop('data'),
    collectionToJson,
    aggregateSaltyBuckLogs,
  ])(student.id)
}
