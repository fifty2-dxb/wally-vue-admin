<script setup lang="ts">
import iphoneLayout from '@images/iphoneLayout.png';
const router = useRouter()

const route = useRoute('pages-campaigns-show')

const widgetData = ref([
  { title: 'Customers', value: '250', icon: 'tabler-smart-home', desc: '5 new', change: 5.7 },
  { title: 'Push Notifications', value: '85', icon: 'tabler-brand-apple', desc: '21k orders', change: 12.4 },
  { title: 'Android Notifications', value: '5', icon: 'tabler-brand-android', desc: '6k orders' },
  { title: 'Total Stamps', value: '375', icon: 'tabler-rubber-stamp', desc: '150 orders', change: -3.5 },
])

const headers = [
  { title: 'NAME', key: 'fullName' },
  { title: 'SURNAME', key: 'surName' },
  { title: 'PHONENUMBER', key: 'phoneNumber' },
  { title: 'EMAIL', key: 'email' },
  { title: 'PROMOTIONS', key: 'promotions' },
  { title: 'EDIT', key: 'edit', sortable: false },
]

const data = [
  {
    id: 95,
    fullName: 'Oktay',
    surName: 'Curebal',
    email: 'oktaycurebal@gmail.com',
    phoneNumber: '058 173 62 78',
    promotions: 'Birthday promotion'
  },
  {
    responsiveId: '',
    id: 96,
    fullName: 'Onur',
    surName: 'Yildiz',
    email: 'onur.yildiz@qodify.eu',
    phoneNumber: '058 173 62 78',
    promotions: 'Birthday promotion'
  }]

const showCustomer = (id: number) => {
  router.push({ name: 'pages-customers-edit' })
};
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        Campaign Details
      </h4>
      <div class="text-body-1">
        Configure your campaign
      </div>
    </div>
  </div>
  <VCard class="mb-6">
    <VCardText class="px-3">
      <VRow>
        <template v-for="(data, id) in widgetData" :key="id">
          <VCol cols="12" sm="6" md="3" class="px-6">
            <div class="d-flex justify-space-between" :class="$vuetify.display.xs
              ? id !== widgetData.length - 1 ? 'border-b pb-4' : ''
              : $vuetify.display.sm
                ? id < (widgetData.length / 2) ? 'border-b pb-4' : ''
                : ''">
              <div class="d-flex flex-column gap-y-1">
                <div class="text-body-1 text-capitalize">
                  {{ data.title }}
                </div>

                <h4 class="text-h4">
                  {{ data.value }}
                </h4>

                <div class="d-flex align-center gap-x-2">
                  <div class="text-no-wrap">
                    {{ data.desc }}
                  </div>

                  <VChip v-if="data.change" label :color="data.change > 0 ? 'success' : 'error'" size="small">
                    {{ prefixWithPlus(data.change) }}%
                  </VChip>
                </div>
              </div>

              <VAvatar variant="tonal" rounded size="44">
                <VIcon :icon="data.icon" size="28" class="text-high-emphasis" />
              </VAvatar>
            </div>
          </VCol>
          <VDivider v-if="$vuetify.display.mdAndUp ? id !== widgetData.length - 1
            : $vuetify.display.smAndUp ? id % 2 === 0
              : false" vertical inset length="92" />
        </template>
      </VRow>
    </VCardText>
  </VCard>
  <VCard class="mb-6">
    <VCardText class="px-3">
      <VRow>
        <VCol>
          <div class="d-flex justify-space-between flex-wrap flex-md-nowrap flex-column flex-md-row">
            <div class=" pa-5">
              <VImg width="137" height="176" style="object-fit: cover;object-position: center top;"
                :src="iphoneLayout" />
            </div>

            <VDivider :vertical="$vuetify.display.mdAndUp" />

            <div>
              <VCardItem>
                <VCardTitle> Supper Coffee Loyalty Card</VCardTitle>
              </VCardItem>

              <VCardText>
                The description of the loyalty
              </VCardText>

              <VCardActions class="justify-space-between mt-10">

                <VBtn>
                  <VIcon icon="tabler-folder" />
                  <span class="ms-2">Edit Campaign</span>
                </VBtn>

                <IconBtn color="secondary" icon="tabler-share" />
              </VCardActions>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VCard class="mb-6">
    <VCardText class="px-3">
      <VRow>
        <VCol>
          <VDataTable :headers="headers" :items="data" density="compact" :items-per-page="5">
            <template #item.edit="{ item }">
              <IconBtn @click="showCustomer(item.id)">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VDataTable>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
