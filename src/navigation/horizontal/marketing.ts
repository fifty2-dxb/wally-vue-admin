export default [
  {
    title: 'Marketing',
    icon: { icon: 'tabler-messages' },
    to: 'pages-marketing-apple',
    children: [
      {
        title: 'Apple wallet push campaign',
        to: 'pages-marketing-apple',
        icon: { icon: 'tabler-brand-apple' },
      },
      {
        title: 'Google wallet push campaign',
        to: 'pages-marketing-google',
        icon: { icon: 'tabler-brand-android' },
      },
      {
        title: 'SMS Campaign',
        to: 'pages-marketing-sms',
        icon: { icon: 'tabler-message' },
      },
      {
        title: 'Email Campaign',
        to: 'pages-marketing-email',
        icon: { icon: 'tabler-mail' },
      }
    ],
  },

]
