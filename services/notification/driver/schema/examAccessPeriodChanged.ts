import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-4a88fc11684f4307adb9ed62e7a25ef5',
    personalizations: [
      {
        subject: 'Exam access period changed',
        to: [
          {
            email: payload.email
          }
        ],
        substitutions: payload,
        dynamicTemplateData: payload
      }
    ]
  }
)
