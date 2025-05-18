const CustomEventGroup = bookshelf => bookshelf.model('CustomEventGroup', {
  tableName: 'custom_event_groups',
  uuid: true,

  customEventTypes () {
    return this.hasMany('CustomEventType', 'custom_event_group_id', 'id')
  },
})

export default CustomEventGroup
