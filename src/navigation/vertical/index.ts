import { VerticalNavItems } from '@/@layouts/types'
import campaign from '../horizontal/campaign'
import dashboard from '../horizontal/dashboard'
import settings from '../horizontal/settings'
import marketing from '../horizontal/marketing'

export default [...dashboard, ...campaign, ...marketing, ...settings] as VerticalNavItems
