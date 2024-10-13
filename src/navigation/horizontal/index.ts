import type { HorizontalNavItems } from '@layouts/types'
import campaign from './campaign'
import dashboard from './dashboard'
import settings from './settings'
import marketing from './marketing'

export default [...dashboard, ...campaign, ...marketing, ...settings] as HorizontalNavItems
