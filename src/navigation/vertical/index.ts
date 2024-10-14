import { VerticalNavItems } from '@/@layouts/types'
import campaign from '../horizontal/campaign'
import settings from '../horizontal/settings'
import marketing from '../horizontal/marketing'

export default [...campaign, ...marketing, ...settings] as VerticalNavItems
