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
const loading = ref(false);
const isInitialized = ref(false);

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
      loading.value = true;
      try {
        await campaignStore.fetchCampaignByMerchantGuid(newMerchant.merchantGuid);
        campaigns.value = campaignStore.campaigns;
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        loading.value = false;
        isInitialized.value = true;
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

const isMerchantAvailable = computed(() => !!configStore.activeMerchant);

</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Campaigns') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Show all digital cards') }}
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn :disabled="!isMerchantAvailable" @click="$router.push('/pages/campaigns/create')">{{ $t('Create New Campaign') }}</VBtn>
    </div>
  </div>
  <template v-if="loading">
    <div class="d-flex justify-center align-center" style="height: 200px;">
      <VProgressCircular indeterminate color="primary" size="50" />
    </div>
  </template>

  <template v-if="isMerchantAvailable && !loading && isInitialized">
  <VRow>
    <VCol sm="6" cols="12" v-for="c in campaigns" :key="c.campaignGuid">
      <VCard class="campaign-card" elevation="2">
        <VRow no-gutters>
          <!-- Preview Section -->
          <v-col sm="12" md="4" class="hide-on-mobile preview-section" :style="{ backgroundColor: getBackgroundColor(c) }">
            <div class="preview-container">
              <img
                :src="c.styleSettings.campaignPreview"
                alt="Campaign Preview"
                class="preview-image"
              />
            </div>
          </v-col>

          <!-- Content Section -->
          <v-col sm="12" md="8" class="content-section">
            <div class="pa-6">
              <!-- Campaign Type Badge -->
              <VChip
                :color="c.styleSettings.type === 'event' ? 'primary' : c.styleSettings.type === 'membership' ? 'success' : 'info'"
                size="small"
                class="mb-3"
              >
                {{ c.styleSettings.type.toUpperCase() }}
              </VChip>

              <!-- Campaign Title -->
              <h3 class="text-h6 font-weight-bold mb-2">{{ c.campaignName }}</h3>
              
              <!-- Campaign Description -->
              <p class="text-body-2 text-medium-emphasis mb-6">{{ c.campaignDescription }}</p>

              <!-- Action Buttons -->
              <div class="d-flex flex-wrap gap-2">
                <!-- Primary Action -->
                <VBtn
                  :to="{ name: 'pages-campaigns-show', params: { id: c.campaignGuid}, query: { type: c.styleSettings.type }}"
                  color="primary"
                  variant="elevated"
                  prepend-icon="tabler-folder-open"
                >
                  {{ $t('Show Digital Card') }}
                </VBtn>

                <!-- Secondary Actions -->
                <div class="d-flex gap-2">
                  <VBtn
                    icon
                    variant="tonal"
                    color="secondary"
                    @click="getPlatformUrl(c)"
                  >
                    <VIcon>tabler-share</VIcon>
                  </VBtn>

                  <!-- NFC Button for Event/Membership -->
                  <VBtn
                    v-if="c.styleSettings.type === 'event' || c.styleSettings.type === 'membership'"
                    icon
                    variant="tonal"
                    color="primary"
                    :to="{ name: 'pages-campaigns-show-mobile-events', params: { id: c.campaignGuid }, query: { mode: 'pwa' } }"
                  >
                    <VIcon>tabler-nfc</VIcon>
                  </VBtn>

                  <!-- Mobile Button for Stamp -->
                  <VBtn
                    v-if="c.styleSettings.type === 'stamp'"
                    icon
                    variant="tonal"
                    color="info"
                    :to="{ name: 'pages-campaigns-show-mobile', params: { id: c.campaignGuid } }"
                  >
                    <VIcon>tabler-device-mobile</VIcon>
                  </VBtn>

                  <!-- Balance Button -->
                  <VBtn
                    v-if="c.styleSettings.type === 'balance'"
                    icon
                    variant="tonal"
                    color="success"
                    :to="{ name: 'pages-campaigns-topup-balance', params: { id: c.campaignGuid } }"
                  >
                    <VIcon>tabler-credit-card</VIcon>
                  </VBtn>

                  <!-- Delete Button -->
                  <VBtn
                    icon
                    variant="tonal"
                    color="error"
                    @click="confirmDeleteCampaign(c.campaignGuid)"
                  >
                    <VIcon>tabler-trash</VIcon>
                  </VBtn>
                </div>
              </div>
            </div>
          </v-col>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
  </template>
  <template v-else-if="!isMerchantAvailable && !loading && isInitialized">
    <div class="d-flex justify-center align-center" >
      <h4>No Merchant Found &gt; Please add merchant in Settings first</h4>
    </div>
  </template>
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

<style scoped>
.campaign-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 16px !important;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05) !important;
}

.campaign-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
}

.preview-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 1.5rem;
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border-right: 1px solid rgba(var(--v-theme-primary), 0.05);
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 150px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.content-section {
  background: transparent;
}

.gap-2 {
  gap: 0.5rem;
}

/* Modern Button Styles */
:deep(.v-btn) {
  border-radius: 12px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.2);
}

:deep(.v-btn.v-btn--icon) {
  border-radius: 8px;
}

/* Chip Styles */
:deep(.v-chip) {
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 8px;
  text-transform: uppercase;
}

.text-h6 {
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.text-body-2 {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  line-height: 1.5;
}

:deep(.v-dialog .v-card) {
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

:deep(.v-dialog .v-card-title) {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.v-snackbar) {
  border-radius: 12px;
}

:deep(.v-snackbar .v-snackbar__content) {
  font-weight: 500;
  letter-spacing: 0.5px;
}

@media (max-width: 767px) {
  .hide-on-mobile {
    display: none !important;
  }
}
</style>
