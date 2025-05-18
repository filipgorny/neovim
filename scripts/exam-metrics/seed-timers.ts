// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts = require('prompts')
import * as R from 'ramda'
import questions from './questions'
import { find as findQuestionMetrics, deleteAll as deleteAllQuestionMetrics } from '../../src/modules/exam-metrics/exam-metrics-repository'
import { find as findQuestionMetricsAvg, deleteAll as deleteAllQuestionMetricsAvg } from '../../src/modules/exam-metrics-avg/exam-metrics-avg-repository'
import { find as findPassageMetrics, deleteAll as deleteAllPassageMetrics } from '../../src/modules/exam-passage-metrics/exam-passage-metrics-repository'
import { find as findPassageMetricsAvg, deleteAll as deleteAllPassageMetricsAvg } from '../../src/modules/exam-passage-metrics-avg/exam-passage-metrics-avg-repository'
import { find as findExamTypes } from '../../src/modules/exam-types/exam-type-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import mapP from '../../utils/function/mapp'
import { seedTimerMetrics } from '../../services/exam-types/seed-timer-metrics'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const deleteAll = async (fetchMethod, deleteMethod) => (
      R.pipeWith(R.andThen)([
        fetchMethod,
        R.prop('data'),
        collectionToJson,
        R.pluck('id'),
        deleteMethod,
      ])(true)
    )

    const getExamTypeIds = async () => (
      R.pipeWith(R.andThen)([
        findExamTypes,
        R.prop('data'),
        collectionToJson,
        R.pluck('id'),
        // @ts-ignore
      ])(true)
    )

    const { confirmed } = await prompts(questions)

    if (!confirmed) {
      console.log('Aborting')

      return Promise.resolve()
    }

    await Promise.all([
      deleteAll(findQuestionMetrics, deleteAllQuestionMetrics),
      deleteAll(findQuestionMetricsAvg, deleteAllQuestionMetricsAvg),
      deleteAll(findPassageMetrics, deleteAllPassageMetrics),
      deleteAll(findPassageMetricsAvg, deleteAllPassageMetricsAvg),
    ])

    console.log('Timers for passages and questions removed.')

    const examTypeIds = await getExamTypeIds()

    await mapP(
      seedTimerMetrics
    )(examTypeIds)

    console.log('Seeded initial passage and question timers for all exam types.')

    return Promise.resolve()
  }
)()
