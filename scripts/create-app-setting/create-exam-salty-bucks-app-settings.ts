import { createAppSetting } from '../../src/modules/app-settings/app-settings-service'
import mapP from '../../utils/function/mapp'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const namespace = 'salty_bucks'
    const payload = [
      ['complete_default_exam', '1000'],
      ['answer_question_default_exam', '10'],
      ['review_question_default_exam', '3'],
      ['multiplier_test_question_default_exam', '2.0'],
    ]

    await mapP(
      async item => createAppSetting(namespace, item[0], item[1])
    )(payload)

    console.log('Default exam Salty Bucks app settings created')

    process.exit(0)
  }
)()
