import issueAuthToken from '../../../../services/users/issue-eg-games-auth-token'

export default async (user) => (
  {
    token: issueAuthToken(user, {
      role: user.user_role,
    })(),
    role: user.user_role,
    email: user.email,
    id: user.id,
    is_email_verified: user.is_email_verified,
    is_active: user.is_active,
    username: user.student.username,
  }
)
