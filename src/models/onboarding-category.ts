const OnboardingCategory = bookshelf => bookshelf.model('OnboardingCategory', {
  tableName: 'onboarding_categories',
  uuid: true,

  images () {
    return this.hasMany('OnboardingImage', 'category_id', 'id')
  },
})

export default OnboardingCategory
