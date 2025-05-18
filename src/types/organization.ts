export type Organization = {
  id: string,
  title: string,
  title_slug: string,
  created_at: string,
}

export type OrganizationDTO = Omit<Organization, 'id'>
