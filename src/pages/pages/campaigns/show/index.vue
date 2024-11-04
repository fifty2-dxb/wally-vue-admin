<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iphoneLayout from '@images/iphoneLayout.png';
import { useCampaignStore } from '@/stores/campaign';  // Import the store

const router = useRouter();

const route = useRoute();
const type = route.query.type as string;
const campaignGuid = route.params.id as string;
const campaign = ref(null);
const customers = ref([]);
const campaignStore = useCampaignStore();
const statistics = ref<Record<string, number | null>>({
  customers: null,
  appleCards: null,
  googleCards: null,
  totalStamps: null,
  totalRedeemed: null,
});
const isLoading = ref(true);

const widgetData = computed(() => {
  const baseData = [
    { title: 'Customers', value: statistics.value.customers, icon: 'tabler-smart-home', desc: '' },
    { title: 'Apple Cards', value: statistics.value.appleCards, icon: 'tabler-brand-apple', desc: '' },
    { title: 'Google Cards', value: statistics.value.googleCards, icon: 'tabler-brand-android', desc: '' },
  ];

  if (type === 'stamp') {
    return [
      ...baseData,
      { title: 'Total Stamps', value: statistics.value.totalStamps, icon: 'tabler-rubber-stamp', desc: '' },
      { title: 'Total Redeemed', value: statistics.value.totalRedeemed, icon: 'tabler-cash', desc: '' },
    ];
  } else if (type === 'membership') {
    return [
      ...baseData,
      { title: 'Total Access', value: statistics.value.totalAccess, icon: 'tabler-key', desc: '' },
    ];
  }

  return baseData;
});

const headers = [
  { title: 'NAME', key: 'name' },
  { title: 'SURNAME', key: 'surname' },
  { title: 'PHONENUMBER', key: 'phonenumber' },
  { title: 'EMAIL', key: 'email' },
  { title: 'PROMOTIONS', key: 'promotions' },
  { title: 'EDIT', key: 'edit', sortable: false },
];

const fetchCampaignDetails = async (campaignGuid: string) => {
  try {
    await campaignStore.fetchCampaignStatistics(campaignGuid);
    statistics.value = campaignStore.statistics
    
    await campaignStore.fetchCampaignByCampaignGuid(campaignGuid);
    campaign.value = campaignStore.campaign;

    await campaignStore.fetchCustomerByCampaignGuid(campaignGuid);
    customers.value = campaignStore.customers;
  } catch (error) {
    console.error('Error fetching campaign or customers:', error);
  } finally {
    isLoading.value = false;

  }
};

onMounted(() => {
  fetchCampaignDetails(campaignGuid);
});

// Function to convert hex color to RGBA with opacity
function hexToRgba(hex: string, opacity: number) {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    const r = (Number(c) >> 16) & 255;
    const g = (Number(c) >> 8) & 255;
    const b = Number(c) & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  // If invalid hex color, default to transparent black
  return `rgba(0,0,0,${opacity})`;
}

// Computed property to get the background color with opacity
const backgroundColorWithOpacity = computed(() => {
  const hexColor = campaign.value?.styleSettings?.properties?.background || '#000000';
  return hexToRgba(hexColor, 0.3);
});
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Campaign Details') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Configure your campaign') }}
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
                  <span v-if="isLoading">
                    <v-progress-circular indeterminate size="24" />
                  </span>
                  <span v-else>
                    {{ data.value }}
                  </span>
                </h4>

                <div class="d-flex align-center gap-x-2">
                  <div class="text-no-wrap">
                    {{ data.desc }}
                  </div>

                  <VChip v-if="data.change" label :color="data.change > 0 ? 'success' : 'error'" size="small">
                    {{ data.change > 0 ? '+' : '' }}{{ data.change }}%
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
    <VCardText class="pa-0">
      <VRow>
        <v-col sm="12" md="3" :style="{ backgroundColor: backgroundColorWithOpacity }">
          <div
            class="ma-auto pa-5 text-center"
            
          >
            <img
              width="100px"
              :src="campaign?.styleSettings.campaignPreview"
              style="border-radius: 5px; border: 1px solid #ccc;"
            />
          </div>
        </v-col>
        <VDivider :vertical="$vuetify.display.mdAndUp" />
        <v-col sm="12" md="9">
          <VCardItem>
            <VCardTitle>{{ campaign?.campaignName }}</VCardTitle>
          </VCardItem>

          <VCardText>
            {{ campaign?.campaignDescription }}
          </VCardText>

          <VCardActions class="justify-space-between mt-10">
            <VBtn :to="{ name: 'pages-campaign-update', params: { id: campaignGuid } }">
              <VIcon icon="tabler-folder" />
              <span class="ms-2">{{ $t('Edit Campaign') }}</span>
            </VBtn>

            <IconBtn color="secondary" icon="tabler-share" />
          </VCardActions>
        </v-col>
      </VRow>
    </VCardText>
  </VCard>
  <VCard class="mb-6">
    <VCardText class="px-3">
      <VRow>
        <VCol>
          <VDataTable :headers="headers" :items="customers" density="compact" :items-per-page="5">
            <template #item.edit="{ item }">
              <IconBtn :to="{ name: 'pages-customers-show', params: { id: item.id } }">
                <VIcon icon="tabler-edit" />
              </IconBtn>
            </template>
          </VDataTable>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
