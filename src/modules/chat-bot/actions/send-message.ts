import * as R from 'ramda'
// import { sendMessage } from '../../../../services/chat-bot/chat-bot'
import { ChatHistoryRole } from '../../chat-history/chat-history-roles'
import { pushChatMessage } from '../../chat-history/chat-history-service'
import { find } from '../../chat-history/chat-history-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { renameProps } from '@desmart/js-utils'

type Payload = {
  message: string
}

const getChatHistory = async (user) => R.pipeWith(R.andThen)([
  async () => find({ limit: { page: 1, take: 100 }, order: { by: 'created_at', dir: 'asc' } }, { student_id: user.id }),
  R.prop('data'),
  collectionToJson,
  R.map(
    R.pick(['role', 'message'])
  ),
  R.map(
    renameProps({ message: 'content' })
  ),
])(true)

export default async (user, payload: Payload) => {
  // const history = await getChatHistory(user)
  // const response = await sendMessage({}, payload.message, user, history)

  // // temporary solution, not sure if will be used at all
  // await pushChatMessage(user, payload.message, '', ChatHistoryRole.user, '', '')
  // await pushChatMessage(user, response, '', ChatHistoryRole.assistant, '', '')

  // return {
  //   question: payload.message,
  //   response,
  // }
}
