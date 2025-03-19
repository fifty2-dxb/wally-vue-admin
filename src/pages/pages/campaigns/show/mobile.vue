<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ConfettiExplosion from 'vue-confetti-explosion';
import { useCampaignStore } from '@/stores/campaign';
import { $wallyApi } from '@/utils/wally-api'

interface Campaign {
  campaignName: string;
  styleSettings: {
    type: string;
    campaignPreview: string;
  };
}


const route = useRoute();
const campaignGuid = route.params.id as string;
const campaignStore = useCampaignStore();
const campaign = ref<Campaign | null>(null);
const eventGuid = ref('');
const isLoading = ref(true);
const scanState = ref('initial');
const scanTime = ref('');
const scannerID = ref('');
const nfcTagId = ref('');
const customerName = ref('');
const showConfetti = ref(false);

// Event information based on campaign type
const eventInfo = ref({
  primary: { label: '', value: '' },
  secondary: { label: '', value: '' },
  tertiary: { label: '', value: '' }
});

const updateEventInfo = (campaign: Campaign | null) => {
  if (!campaign) return;
  
  switch (campaign.styleSettings?.type) {
    case 'movie':
      eventInfo.value = {
        primary: { label: 'ZONE', value: 'A1' },
        secondary: { label: 'GATE', value: '2' },
        tertiary: { label: 'SEAT', value: '12' }
      };
      break;
    default:
      eventInfo.value = {
        primary: { label: 'ZONE', value: '1' },
        secondary: { label: 'GATE', value: 'A' },
        tertiary: { label: 'SPOT', value: '1' }
      };
  }
};

const receiveNfcData = async (data: string) => {
  try {
    if (!data) {
      console.error('No NFC data received');
      scanState.value = 'error';
      return;
    }

    console.log('NFC data received from mobile:', data);
    
    const response = await $wallyApi('/event-access', {
      method: 'POST',
      body: {
        serialNumber: data,
      },
    });

    nfcTagId.value = data;
    scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    scannerID.value = `Scanner-${Math.floor(Math.random() * 1000000)}`;
    customerName.value = response.customerName || '';

    const isDeniedOrAlreadyScanned = response.status === 403 || response.status === 'already_scanned';
    scanState.value = isDeniedOrAlreadyScanned ? 'denied' : 'success';
    
    if (isDeniedOrAlreadyScanned) {
      console.log('Access denied or already scanned:', response.message);
      scanTime.value = new Date(response.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      showConfetti.value = true;
      setTimeout(() => {
        showConfetti.value = false;
      }, 2500);
    }
  } catch (error) {
    console.error('Error validating NFC tag:', error);
    scanState.value = 'error';
  }
}

const fetchCampaignDetails = async () => {
  try {
    const response = await campaignStore.fetchCampaignByCampaignGuid(campaignGuid)

    if (!response) {
      console.error('No response received from campaign store')
      scanState.value = 'error'

      return
    }

    if (!response.campaign || !response.event) {
      console.error('Invalid response structure:', response)
      scanState.value = 'error'
      return
    }

    campaign.value = response.campaign
    eventGuid.value = response.event.eventGuid
    updateEventInfo(campaign.value)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    scanState.value = 'error'
  } finally {
    isLoading.value = false
  }
}

const resetScan = () => {
  scanState.value = 'initial';
  nfcTagId.value = '';
  scanTime.value = '';
  scannerID.value = '';
  customerName.value = '';
};

onMounted(() => {
  fetchCampaignDetails();
  
  (window as any).receiveNfcData = receiveNfcData;
});

onUnmounted(() => {
  (window as any).receiveNfcData = null;
});
</script>

<template>
  <div class="page-container">
    <div class="mobile-frame" :class="scanState">
      <div class="status-bar">
        <VBtn icon variant="text" :color="scanState === 'initial' ? 'black' : 'white'" @click="$router.back()">
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
      </div>

      <div class="content-container">
        <template v-if="scanState === 'initial'">
          <div class="icon-container">
            <VIcon
              icon="tabler-nfc"
              color="primary"
              size="64"
            />
          </div>

          <h2 class="location-text text-black">
            {{ campaign?.campaignName || $t('Event Location') }}
          </h2>

          <h1 class="welcome-text text-black">
            {{ $t('Tap NFC to Enter Event') }}
          </h1>
          <p class="subtitle-text text-primary">
            {{ $t('Hold your device near the NFC tag') }}
          </p>
        </template>
        
        <template v-else-if="scanState === 'error'">
          <div class="icon-container">
            <VIcon
              icon="tabler-alert-circle"
              color="white"
              size="64"
            />
          </div>

          <h1 class="welcome-text">
            {{ $t('Error Scanning Tag') }}
          </h1>
          
          <h2 class="location-text">
            {{ $t('Please try again') }}
          </h2>

          <VBtn color="white" variant="outlined" class="mt-4" @click="resetScan">
            {{ $t('Try Again') }}
          </VBtn>
        </template>

        <template v-else-if="scanState === 'denied'">
          <div class="icon-container">
            <VIcon
              icon="tabler-alert-circle"
              color="white"
              size="64"
            />
          </div>

          <h1 class="welcome-text">
            {{ $t('Access Denied') }}
          </h1>
          
          <h2 class="location-text">
            {{ $t('Already scanned') }}
          </h2>

          <div class="scan-info">
            <div class="scan-row">
              <span class="scan-label">{{ $t('SCANNED AT') }}</span>
              <span class="scan-value">{{ scanTime }}</span>
            </div>
            <div class="scan-row">
              <span class="scan-label">{{ $t('Customer Name') }}</span>
              <span class="scan-value">{{ customerName }}</span>
            </div>
            <div class="scan-row">
              <span class="scan-label">{{ $t('NFC TAG ID') }}</span>
              <span class="scan-value">{{ nfcTagId }}</span>
            </div>
          </div>

          <VBtn color="white" variant="outlined" class="mt-4" @click="resetScan">
            {{ $t('Try Again') }}
          </VBtn>
        </template>

        <template v-else-if="scanState === 'success'">
          <div class="icon-container">
            <VIcon
              icon="tabler-circle-check"
              color="white"
              size="64"
            />
          </div>

          <h1 class="welcome-text">
            {{ $t('Welcome In') }}
          </h1>
          
          <h2 class="location-text">
            {{ campaign?.campaignName || $t('Event Location') }}
          </h2>

          <div class="ticket-info">
            <ConfettiExplosion 
              v-if="showConfetti"
              :particleCount="200"
              :particleSize="12"
              :force="0.8"
              class="confetti-container"
            />
            <div class="info-row">
              <div class="info-col">
                <div class="info-label">{{ eventInfo.primary.label }}</div>
                <div class="info-value">{{ eventInfo.primary.value }}</div>
              </div>
              <div class="info-col">
                <div class="info-label">{{ eventInfo.secondary.label }}</div>
                <div class="info-value">{{ eventInfo.secondary.value }}</div>
              </div>
              <div class="info-col">
                <div class="info-label">{{ eventInfo.tertiary.label }}</div>
                <div class="info-value">{{ eventInfo.tertiary.value }}</div>
              </div>
            </div>
            <div class="scan-row">
              <span class="scan-label">{{ $t('Customer Name') }}</span>
              <span class="scan-value">{{ customerName }}</span>
            </div>
          </div>

          <div class="message-text">
            {{ $t('Enjoy the event!') }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f5;
}

.mobile-frame {
  width: 100%;
  max-width: 390px;
  height: 844px;
  max-height: 90vh;
  background: white;
  border-radius: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.mobile-frame.success {
  background: #4CAF50;
}

.mobile-frame.already_scanned {
  background: #FF5252;
}

.mobile-frame.error {
  background: #FF9800;
}

.mobile-frame.denied {
  background: #FF5252;
}

.status-bar {
  padding: 1rem;
  display: flex;
  align-items: center;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  text-align: center;
}

.icon-container {
  margin-bottom: 2rem;
  min-height: 64px;
}

.welcome-text {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.welcome-text.text-black {
  color: #000;
}

.subtitle-text {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  font-weight: 500;
}

.location-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 3rem;
}

.location-text.text-black {
  color: #000;
}

.ticket-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.info-col {
  flex: 1;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.info-value {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.message-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.scan-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
}

.scan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scan-row:last-child {
  margin-bottom: 0;
}

.scan-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.scan-value {
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.mt-4 {
  margin-top: 1rem;
}

.confetti-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

@media (max-width: 480px) {
  .page-container {
    padding: 0;
  }

  .mobile-frame {
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
  }
}
</style> 
