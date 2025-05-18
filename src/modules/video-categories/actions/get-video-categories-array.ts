import { VideoCategories } from '../../videos/video-categories'

export default async () => (
  Object.values(VideoCategories).map(category => ({ id: category, name: category.charAt(0).toUpperCase() + category.slice(1) }))
)
