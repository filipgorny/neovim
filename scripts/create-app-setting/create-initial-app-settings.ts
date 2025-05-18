import { createAppSetting } from '../../src/modules/app-settings/app-settings-service'
import mapP from '../../utils/function/mapp'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const namespace = 'salty_bucks'
    const payload = [
      ['sign_up_free_trial', '2000'],
      ['purchase_course', '5000'],
      ['complete_book_section', '10'],
      ['complete_chapter', '1000'],
      ['complete_book', '5000'],
      ['complete_course', '25000'],
      ['open_new_tmi', '1'],
      ['open_new_clinical_context', '1'],
      ['open_new_mcat_think', '1'],
      ['watch_new_video', '5'],
      ['watch_all_videos_in_chapter', '500'],
      ['watch_all_videos_in_book', '2000'],
      ['flashcard_increase_p_level', '2'],
      ['flashcard_reset_p_level', '1'],
      ['answer_content_question', '5'],
      ['complete_chapter_quiz_mini_mcat', '200'],
      ['answer_chapter_quiz_question_mini_mcat', '10'],
      ['review_question_mini_mcat', '3'],
      ['complete_full_mcat', '1000'],
      ['answer_question_full_mcat', '10'],
      ['review_question_full_mcat', '3'],
      ['active_on_site_2min', '2'],
      ['active_on_site_30min', '30'],
      ['dashboard_velocity_3_days_green', '100'],
      ['multiplier_test_question_full_mcat', '2.0'],
      ['multiplier_answer_content_question_correct', '1.0'],
      ['multiplier_chapter_quiz_question_mini_mcat', '2.0'],
    ]

    await mapP(
      async item => createAppSetting(namespace, item[0], item[1])
    )(payload)

    console.log('Initial app settings created')

    process.exit(0)
  }
)()
