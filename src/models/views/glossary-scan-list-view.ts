import { FETCHED, FETCHED_COLLECTION, SAVED } from '../model-events'

const parseJson = (value) => value ? JSON.parse(value) : null

const BookScanListView = bookshelf => bookshelf.model('BookScanListView', {
  tableName: 'book_scan_list_view',

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      })
    })
  },
})

export default BookScanListView
