import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-1471733b797d4c1085a13b9c15a2e492',
    personalizations: [
      {
        subject: 'Password reset',
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
