import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-e489c3b0aeec439fb1c6936b4b94c170',
    personalizations: [
      {
        subject: 'Course paused',
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
