const AppSetting = bookshelf => bookshelf.model('AppSetting', {
  tableName: 'app_settings',
  uuid: true,
})

export default AppSetting
