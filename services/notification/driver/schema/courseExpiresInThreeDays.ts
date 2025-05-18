import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-39ce5fb7f28e417ab1c961815ac7f947',
    subject: 'Course is about to expire',
    personalizations: [
      {
        to: [
          {
            email: payload.email,
          },
        ],
        substitutions: payload,
        dynamicTemplateData: payload,
      },
    ],
  }
)
