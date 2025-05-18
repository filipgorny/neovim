import env from '../../../../utils/env'

export default payload => ({
  from: env('NOTIFICATIONS_FROM_EMAIL'),
  template_id: 'd-70bf26628362420690ba8441b98918af',
  personalizations: [
    {
      subject: 'Salty bucks balance has changed',
      to: [
        {
          email: payload.email,
        },
      ],
      substitutions: payload,
      dynamicTemplateData: payload,
    },
  ],
})
