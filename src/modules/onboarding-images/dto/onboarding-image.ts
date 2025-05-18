export type OnboardingImageDTO = {
  category_id: string
  title: string
  image_url: string
  order: number
}

export type OnboardingImage = { id: string } & OnboardingImageDTO

export const makeDTO = (
  category_id: string,
  title: string,
  image_url: string,
  order: number
): OnboardingImageDTO => ({
  category_id,
  title,
  image_url,
  order,
})

export default OnboardingImageDTO
