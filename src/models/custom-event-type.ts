const CustomEventType = bookshelf => bookshelf.model('CustomEventType', {
  tableName: 'custom_event_types',
  uuid: true,

  customEventGroup () {
    return this.belongsTo('CustomEventGroup', 'custom_event_group_id')
  },
})

export default CustomEventType
