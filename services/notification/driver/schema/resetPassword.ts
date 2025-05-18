import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-6bcad37f3ccf45ba96d163a407d8f52f',
    personalizations: [
      {
        subject: 'Password reset',
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
