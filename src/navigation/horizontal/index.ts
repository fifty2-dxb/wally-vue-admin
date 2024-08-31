import type { HorizontalNavItems } from '@layouts/types'
import campaign from './campaign'
import dashboard from './dashboard'
import help from './help'
import settings from './settings'

export default [...dashboard, ...campaign, ...settings, ...help] as HorizontalNavItems
