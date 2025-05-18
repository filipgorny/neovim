import R from 'ramda'
import { fetchBookWithPageContents } from '../book-repository'
import { findByName as findSettingByName } from '../../app-settings/app-settings-repository'
import { SaltyBucksOperationSubtype } from '../../salty-bucks-log/salty-bucks-operation-subtype'
import Transform from './book-detail-transformers'

export default async (bookId: string, chapterOrder, part, user, partials?: string[]) => {
  const [baseValueSetting, multiplierSetting] = await Promise.all([
    findSettingByName(SaltyBucksOperationSubtype.answerContentQuestion),
    findSettingByName(SaltyBucksOperationSubtype.multiplierAnswerContentQuestionCorrect),
  ])

  return R.pipeWith(R.andThen)([
    async () => fetchBookWithPageContents(bookId, chapterOrder, part, partials),
    Transform.bookContents,
    Transform.flashcards,
    Transform.contentImages,
    Transform.chapterImages,
    Transform.attachments,
    Transform.resources,
    Transform.contentQuestions(baseValueSetting, multiplierSetting),
  ])(true)
}
