import { VerticalNavItems } from '@/@layouts/types'
import campaign from '../horizontal/campaign'
import dashboard from '../horizontal/dashboard'
import settings from '../horizontal/settings'

export default [...dashboard, ...campaign, ...settings] as VerticalNavItems
