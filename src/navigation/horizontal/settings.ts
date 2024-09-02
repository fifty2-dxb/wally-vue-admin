export default [
  {
    title: 'Settings',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'Organisations',
        to: 'pages-organisations',
        icon: { icon: 'tabler-building' },
      },
      {
        title: 'API Keys',
        to: 'pages-api-keys',
        icon: { icon: 'tabler-api' },
      },
      {
        title: 'Certificates',
        to: 'pages-certificates',
        icon: { icon: 'tabler-file-certificate' },
      },
      {
        title: 'NFC Keys',
        to: 'dashboards-crm',
        icon: { icon: 'tabler-nfc' },
      },
      {
        title: 'Domain Names',
        to: 'dashboards-crm',
        icon: { icon: 'tabler-world' },
      },
      {
        title: 'Languages',
        to: 'dashboards-crm',
        icon: { icon: 'tabler-language' },
      },
    ],
  },

]
