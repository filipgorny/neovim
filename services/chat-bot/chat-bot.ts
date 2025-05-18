import axios from 'axios'
import env from '../../utils/env'

type MessageConfig = {
  first_name: string,
  user_id: string,
  resource_id: string,
  chapter_id: string,
  resource_type: string,
}

const chatConfig = {
  method: 'post',
  // url: 'https://examkracker-chat-7tydlz45wa-uc.a.run.app/api/copilot',
  url: 'https://test.examkrackers.com/AI_API/copilot.php',
  headers: {
    accept: 'application/json',
    'CF-Access-Client-Id': env('SLAY_SCHOOL_AI_ACCESS_CLIENT_ID'),
    'CF-Access-Client-Secret': env('SLAY_SCHOOL_AI_ACCESS_CLIENT_SECRET'),
    'Content-Type': 'application/json',
  },
  responseType: 'stream',
}

const responseConfig = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
}

/**
 * The chat bot was fed production data so we must provide a hardcoded resource_id for non-production envs
 */
const getResourceId = (messageConfig: MessageConfig) => (
  env('APP_ENV') === 'production' ? messageConfig.resource_id : '01e5f551-40af-432a-ae78-191fcbcbafef'
)

export const sendMessageStream = async (messageConfig: MessageConfig, res, chat_message: string, streamHandler, chat_history = []) => {
  let fullResponse = ''

  const data = {
    first_name: messageConfig.first_name,
    user_id: messageConfig.user_id,
    resource_id: getResourceId(messageConfig),
    resource_type: messageConfig.resource_type,
    chapter_id: messageConfig.chapter_id,
    chat_history,
    chat_message,
  }

  console.log('CHAT DATA PARTIAL', { resource_id: data.resource_id, chapter_id: data.chapter_id })

  const config = {
    ...chatConfig,
    data,
  }

  res.writeHead(200, responseConfig)

  // @ts-ignore
  axios(config)
    .then(response => {
      response.data.on('data', (chunk) => {
        fullResponse += chunk
        // streamHandler(chunk)
      })

      response.data.on('end', async () => {
        // streamHandler('---END---', '')

        // console.log('Full response:', fullResponse)
        streamHandler(fullResponse)

        res.end()
      })
    })
    .catch(error => {
      console.error(error)

      res.write('data: Chat error\n\n')
      res.end()
    })

  return fullResponse
}
