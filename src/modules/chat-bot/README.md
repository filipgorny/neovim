# chat-bot

Module used to communicate with the AI Tutor (3rd-party integration).

## Routes

`POST /chat-bot/send`

**DEPRECATED**

Send a message to the AI Tutor and react to a response.

`POST /chat-bot/send-stream`

Send a message to the AI Tutor and react to a response stream. Acts as a proxy between the front-end client and the AI Tutor.

`GET /chat-bot/history/:student_book_chapter_id`

Get the chat history (context) for a given subchapter. The history is added to the message sent by the student so that the AI Tutor has the context of previously sent messages. This route is used to fetch the converstation with the AI Tutor.

## Related DB tables
- `chat_history`
