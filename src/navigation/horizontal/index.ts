import type { HorizontalNavItems } from '@layouts/types'
import campaign from './campaign'
import settings from './settings'
import marketing from './marketing'

export default [...campaign, ...marketing, ...settings] as HorizontalNavItems
