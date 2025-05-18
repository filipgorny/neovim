import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-a858185c12b3486ca0d0c71666cea81f',
    subject: 'Course expired',
    personalizations: [
      {
        subject: 'Course expired',
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
