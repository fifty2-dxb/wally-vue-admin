import type { RouteRecordRaw } from 'vue-router/auto'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')
const showRouteComponent = () => import('@/pages/pages/campaigns/show/index.vue')
const showMobileCampaignComponent = () => import('@/pages/pages/customers/showMobile/index.vue')
const showTopUpBalanceComponent = () => import('@/pages/pages/campaigns/topup/index.vue')
const showThankYouBalanceComponent = () => import('@/pages/pages/campaigns/topup/ThankYouPaymentCard.vue')
const showFailedBalanceComponent = () => import('@/pages/pages/campaigns/topup/FailedPaymentCard.vue')
const showUpdateComponent = () => import('@/pages/pages/campaigns/update/index.vue')
const showCustomerComponent = () => import('@/pages/pages/customers/show/index.vue')
const editCustomerComponent = () => import('@/pages/pages/customers/edit/index.vue')
const activationRouteComponent = () => import ('@/pages/pages/activation/index.vue')
const activatioSuccessnRouteComponent = () => import ('@/pages/pages/activation/success-activation.vue')
const platformChooseRouteComponent = () => import ('@/pages/pages/platform/index.vue')
const downloadEventTicket = () => import ('@/pages/pages/platform/event-download-ticket.vue')
const welcomeToPlatform = () => import ('@/components/campaign/WelcomeToPlatform.vue')
const secretPartiesWelcome = () => import ('@/components/campaign/SecretPartiesWelcome.vue')
const googleTableRouteComponent = () => import ('@/pages/pages/marketing/google/GoogleTable.vue')
const appleTableRouteComponent = () => import ('@/pages/pages/marketing/apple/AppleTable.vue')
const notFoundRouteComponent = () => import ('@/pages/[...error].vue')

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      const userData = useCookie<Record<string, unknown> | null | undefined>('userData')
      const userRole = 'admin'

      if (userRole === 'admin')
        return { name: 'pages-campaigns' }
      if (userRole === 'client')
        return { name: 'access-control' }

      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
  {
    path: '/activation/:serialNumber',
    name: 'activation',
    component: activationRouteComponent,
    props: true, 
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/activation/success',
    name: 'activation-success',
    component: activatioSuccessnRouteComponent,
    meta: {
      requiresAuth: false,
    },
  },
  
  {
    path: '/welcome',
    name: 'welcome',
    component: welcomeToPlatform,
    props: true, 
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/secret-parties',
    name: 'secret',
    component: secretPartiesWelcome,
    props: true, 
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*', 
    name: '404',
    component: notFoundRouteComponent,
    meta: {
      layout: 'blank',
      public: true,
    },
  },
  {
    path: '/platform/:id',
    name: 'platform-choose',
    component: platformChooseRouteComponent,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/customer/:id',
    name: 'download-event-ticket',
    component: downloadEventTicket,
    meta: {
      requiresAuth: false,
    },
  },
]

export const routes: RouteRecordRaw[] = [
  // Email filter
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },
  {
    path: '/pages/google-messages',
    name: 'pages-google-messages',
    component: googleTableRouteComponent,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/pages/apple-messages',
    name: 'pages-apple-messages',
    component: appleTableRouteComponent,
    meta: {
      requiresAuth: true,
    },
  },

  // Email label
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      // contentClass: 'email-application',
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  {
    path: '/pages/campaigns/show/:id',
    name: 'pages-campaigns-show',
    component: showRouteComponent,
  },
  {
    path: '/pages/campaigns/show/mobile',
    name: 'pages-campaigns-show-mobile',
    component: showMobileCampaignComponent,
  },
  {
    path: '/pages/campaigns/topup',
    name: 'pages-campaigns-topup-balance',
    component: showTopUpBalanceComponent,
  },
  {
    path: '/pages/campaigns/topup/thankyou',
    name: 'pages-campaigns-topup-thankyou',
    component: showThankYouBalanceComponent,
  },
  {
    path: '/pages/campaigns/topup/failed',
    name: 'pages-campaigns-topup-failed',
    component: showFailedBalanceComponent,
  },
  {
    path: '/pages/campaigns/update/:id',
    name: 'pages-campaign-update',
    component: showUpdateComponent,
  },
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
  {
    path: '/pages/customers/show/:id',
    name: 'pages-customers-show',
    component: showCustomerComponent,
  },
  {
    path: '/pages/customers/edit/:id',
    name: 'pages-customers-edit',
    component: editCustomerComponent,
  },
  {
    path: '/pwa/:id',
    name: 'pages-campaigns-show-mobile-events',
    component: () => import('@/pages/pages/campaigns/show/mobile.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  },
]
