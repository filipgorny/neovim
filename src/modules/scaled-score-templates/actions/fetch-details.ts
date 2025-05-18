import { fetchFirst } from '../../../../utils/model/fetch'
import { ScaledScoreTemplate } from '../../../models'

export default async id => (
  fetchFirst(ScaledScoreTemplate)({ id }, ['scores'])
)
