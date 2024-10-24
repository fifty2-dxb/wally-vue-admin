export default [
  {
    title: 'Marketing',
    icon: { icon: 'tabler-messages' },
    to: 'pages-marketing-apple',
    children: [
      {
        title: 'Apple wallet push campaign',
        to: 'pages-apple-messages',
        icon: { icon: 'tabler-brand-apple' },
      },
      {
        title: 'Google wallet push campaign',
        to: 'pages-google-messages',
        icon: { icon: 'tabler-brand-android' },
      },
      {
        title: 'Branded advertising materials',
        to: 'pages-advertisement-materials',
        icon: { icon: 'tabler-ad' },
      },
      {
        title: 'SMS Campaign (Coming soon)',
        to: 'pages-marketing-sms',
        icon: { icon: 'tabler-message' },
      },
      {
        title: 'Email Campaign (Coming soon)',
        to: 'pages-marketing-email',
        icon: { icon: 'tabler-mail' },
      }
    ],
  },

]
