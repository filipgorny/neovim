import generateStaticUrl from '../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../services/vimeo/get-vimeo-static-link'
import { FETCHED, FETCHED_COLLECTION } from './model-events'

const Video = bookshelf => bookshelf.model('Video', {
  tableName: 'videos',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        thumbnail: generateStaticUrl(instance.get('thumbnail')),
        source: getVimeoStaticLink(instance.get('source')),
        source_no_bg_music: getVimeoStaticLink(instance.get('source_no_bg_music')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        thumbnail: generateStaticUrl(instance.get('thumbnail')),
        source: getVimeoStaticLink(instance.get('source')),
        source_no_bg_music: getVimeoStaticLink(instance.get('source_no_bg_music')),
      }))
    })
  },

  resources () {
    return this.hasMany('BookContentResource', 'external_id', 'id')
  },

  studentResources () {
    return this.hasMany('StudentBookContentResource', 'external_id', 'id')
  },

  courseEndDate () {
    return this.belongsTo('CourseEndDate', 'course_end_date_id')
  },

  studentVideos () {
    return this.hasMany('StudentVideo', 'video_id')
  },
})

export default Video
