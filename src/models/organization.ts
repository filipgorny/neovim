const Organization = bookshelf => bookshelf.model('Organization', {
  tableName: 'organizations',
  uuid: true,

  admins () {
    return this.hasMany('OrganizationAdmin', 'organization_id')
  },
})

export default Organization
