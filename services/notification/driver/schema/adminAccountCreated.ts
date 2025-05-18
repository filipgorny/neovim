import env from '../../../../utils/env'

export default payload => (
  {
    from: env('NOTIFICATIONS_FROM_EMAIL'),
    template_id: 'd-282755b165494d5d9f5e052762a8dc9d',
    personalizations: [
      {
        subject: 'Admin account created',
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
