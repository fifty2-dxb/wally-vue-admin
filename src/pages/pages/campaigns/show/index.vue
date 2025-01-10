<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import iphoneLayout from '@images/iphoneLayout.png';
import { useCampaignStore } from '@/stores/campaign';
import DashboardCard from './DashboardCard.vue'
import DonutChart from './DonutChart.vue'
import LogisticsShipmentStatistics from '@/views/apps/logistics/LogisticsShipmentStatistics.vue'
import LogisticsDeliveryExpectations from '@/views/apps/logistics/LogisticsDeliveryExpectations.vue'


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

const startDate = ref('');
const endDate = ref('');
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const applyFilters = async () => {
  if (!startDate.value || !endDate.value) {
    showSnackbar('Please select both start and end dates.', 'error')
    return;
  }

  try {
    isLoading.value = true;
    await campaignStore.fetchCampaignStatistics(
      campaignGuid,
      startDate.value,
      endDate.value
    );
    statistics.value = campaignStore.statistics;
  } catch (error) {
    console.error("Error applying filters:", error);
  } finally {
    isLoading.value = false;
  }
};

const widgetData = computed(() => {
  const baseData = [
    { title: 'Customers', value: statistics.value.customers, icon: 'tabler-smart-home', color: 'primary', desc: '', isHover: false },
    { title: 'Apple Cards', value: statistics.value.appleCards, icon: 'tabler-brand-apple', color: 'secondary', desc: '', isHover: false },
    { title: 'Google Cards', value: statistics.value.googleCards, icon: 'tabler-brand-android', color: 'success', desc: '', isHover: false },
  ];

  if (type === 'stamp') {
    return [
      ...baseData,
      { title: 'Total Stamps', value: statistics.value.totalStamps, icon: 'tabler-rubber-stamp', color: 'warning', desc: '', isHover: false },
      { title: 'Total Redeemed', value: statistics.value.totalRedeemed, icon: 'tabler-cash', color: 'error', desc: '', isHover: false },
    ];
  } else if (type === 'membership') {
    return [
      ...baseData,
      { title: 'Total Access', value: statistics.value.totalAccess, icon: 'tabler-key', color: 'info', desc: '', isHover: false },
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

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

</script>

<template>
  <div class="d-flex justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
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
    <VCardText class="pa-0">
      <VRow>
        <v-col sm="12" md="3" :style="{ backgroundColor: backgroundColorWithOpacity }">
          <div class="ma-auto pa-5 text-center">
            <img width="100px" :src="campaign?.styleSettings.campaignPreview"
              style="border-radius: 5px; border: 1px solid #ccc;" />
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

  <VCard title="Filters" class="mb-6" style="padding: 1rem; border-radius: 12px;">
    <VCardText>
      <div class="filter-container">
        <VTextField v-model="startDate" label="Start Date" :clearable="true" prepend-icon="tabler-calendar" type="date"
          class="filter-input" />
        <VTextField v-model="endDate" label="End Date" :clearable="true" prepend-icon="tabler-calendar" type="date"
          class="filter-input" />
        <VBtn color="primary" @click="applyFilters" class="apply-button">
          <VIcon icon="tabler-filter" class="me-2" />
          Apply Filters
        </VBtn>
      </div>
      <VDivider class="my-4" />

      <VCol cols="12">
        <DashboardCard :data="widgetData" :isLoading="isLoading" />
      </VCol>

      <VRow class="mt-10">
        <VCol cols="12" md="12">
          <DonutChart :data="widgetData" :isLoading="isLoading" />
        </VCol>
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
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>

<style scoped>
.filter-input {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 1rem
}

.apply-button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: 0.2s ease-in-out;
}

.apply-button:hover {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #5a4fcf;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgb(0 0 0 / 5%)
}
</style>
