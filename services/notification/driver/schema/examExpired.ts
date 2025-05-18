import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-f338068cfcbb4d9fa5a9280f216eb29a',
    personalizations: [
      {
        subject: 'Exam expired',
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
