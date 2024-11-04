<script setup lang="ts">
import { useConfigStore } from '@/@core/stores/config';
import { useCampaignStore } from '@/stores/campaign';
import { ref, computed, watch } from 'vue';

import iphoneLayout from '@images/iphoneLayout.png';

const configStore = useConfigStore();
const campaignStore = useCampaignStore();

const campaigns = ref([]);
const isDeleteConfirmationVisible = ref(false);
const campaignToDelete = ref(null);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const showSnackbar = ref(false);

const hexToRgba = (hex: string, opacity: number) => {
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
};

const getBackgroundColor = (campaign) => {
  const hexColor = campaign.styleSettings?.properties?.background || '#000000';
  return hexToRgba(hexColor, 0.3);
};

watch(
  () => configStore.activeMerchant,
  async (newMerchant, oldMerchant) => {
    if (newMerchant && newMerchant.merchantGuid !== (oldMerchant?.merchantGuid || '')) {
      try {
        await campaignStore.fetchCampaignByMerchantGuid(newMerchant.merchantGuid);
        campaigns.value = campaignStore.campaigns;
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    }
  },
  { immediate: true }
);

const showSnackbarMessage = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

const confirmDeleteCampaign = (campaignGuid) => {
  campaignToDelete.value = campaignGuid;
  isDeleteConfirmationVisible.value = true;
};

const handleDeleteCampaign = async () => {
  try {
    await campaignStore.deleteCampaign(campaignToDelete.value);
    showSnackbarMessage('Campaign deleted successfully', 'success');
    await campaignStore.fetchCampaignByMerchantGuid(configStore.activeMerchant.merchantGuid);
    campaigns.value = campaignStore.campaigns;

  } catch (error) {
    console.error(error);
    showSnackbarMessage(
      error.response?._data.message || 'An error occurred while deleting the campaign',
      'error'
    );
  } finally {
    isDeleteConfirmationVisible.value = false;
    campaignToDelete.value = null;
  }
};

const cancelDelete = () => {
  isDeleteConfirmationVisible.value = false;
  campaignToDelete.value = null;
};

const getPlatformUrl = (campaign: any) => {
  const platformUrl = `/platform/${campaign.campaignGuid}`

  window.open(platformUrl, '_blank')
}

const headers = [
  { title: 'ID', sortable: false, key: 'id' },
  { title: 'NAME', key: 'fullName' },
  { title: 'EMAIL', key: 'email' },
  { title: 'DATE', key: 'startDate' },
  { title: 'EXPERIENCE', key: 'experience' },
  { title: 'AGE', key: 'age' },
];
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Campaigns') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Show all campaigns') }}
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="$router.push('/pages/campaigns/create')">{{ $t('Create New Campaign') }}</VBtn>
    </div>
  </div>
  <VRow>
    <VCol sm="6" cols="12" v-for="c in campaigns" :key="c.campaignGuid">
      <VCard>
        <v-row>
          <v-col sm="12" md="4" :style="{ backgroundColor: getBackgroundColor(c) }">
            <div
              class="ma-auto pa-5 text-center"
            >
              <img
                width="100px"
                :src="c.styleSettings.campaignPreview"
                style="border-radius: 5px; border: 1px solid #ccc;"
              />
            </div>
          </v-col>
          <VDivider :vertical="$vuetify.display.mdAndUp" />
          <v-col sm="12" md="8">
            <VCardItem>
              <VCardTitle>{{ c.campaignName }}</VCardTitle>
            </VCardItem>

            <VCardText>
              {{ c.campaignDescription }}
            </VCardText>

            <VCardActions class="justify-space-between mt-10">
              <VBtn :to="{ name: 'pages-campaigns-show', params: { id: c.campaignGuid } }">
                <VIcon icon="tabler-folder-open" />
                <span class="ms-2">{{ $t('Show Campaign') }}</span>
              </VBtn>

              <IconBtn @click="getPlatformUrl(c)" color="secondary" icon="tabler-share" />
              <IconBtn :to="{ name: 'pages-campaigns-show-mobile', params: { id: c.campaignGuid } }">
                <VIcon icon="tabler-device-mobile" />
              </IconBtn>
              <IconBtn @click="confirmDeleteCampaign(c.campaignGuid)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
            </VCardActions>
          </v-col>
        </v-row>
      </VCard>
    </VCol>
  </VRow>
  <VDialog v-model="isDeleteConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">{{ $t('Are you sure?') }}</VCardTitle>
      <VCardText>
        {{ $t('Do you really want to delete this campaign? This action cannot be undone.') }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="cancelDelete">{{ $t('Cancel') }}</VBtn>
        <VBtn color="error" @click="handleDeleteCampaign">{{ $t('Delete') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VSnackbar v-model="showSnackbar" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
