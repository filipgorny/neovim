const CalendarSetting = bookshelf => bookshelf.model('CalendarSetting', {
  tableName: 'calendar_settings',
  uuid: true,
})

export default CalendarSetting
