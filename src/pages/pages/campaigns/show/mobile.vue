<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ConfettiExplosion from 'vue-confetti-explosion';
import { useCampaignStore } from '@/stores/campaign';
import { useCustomerStore } from '@/stores/customer';

declare global {
  class NDEFReader {
    scan(): Promise<void>
    addEventListener(type: string, callback: (event: any) => void): void
    removeEventListener(type: string, callback: (event: any) => void): void
  }
  interface Window {
    NDEFReader: new () => NDEFReader
  }
}

interface Campaign {
  campaignName: string;
  styleSettings: {
    type: string;
    campaignPreview: string;
  };
}

interface CampaignResponse {
  status: string;
  campaign: Campaign;
  event: {
    eventGuid: string;
    eventName: string;
  };
}

const route = useRoute();
const campaignGuid = route.params.id as string;
const campaignStore = useCampaignStore();
const campaign = ref<Campaign | null>(null);
const eventGuid = ref('');
const isLoading = ref(true);
const scanState = ref('initial'); // 'initial', 'success', 'already_scanned'
const scanTime = ref('');
const scannerID = ref('');
const nfcTagId = ref('');
const showConfetti = ref(false);
const errorMessage = ref('');
const eventCustomerName = ref('');
// Event information based on campaign type
const eventInfo = ref({
  primary: { label: '', value: '' },
  secondary: { label: '', value: '' },
  tertiary: { label: '', value: '' }
});

const scanMode = ref<'nfc' | 'qr'>('nfc');
const qrCodeInput = ref('');
const qrInputRef = ref<HTMLInputElement | null>(null);

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

const resetScan = () => {
  scanState.value = 'initial'
  scanTime.value = ''
  scannerID.value = ''
  nfcTagId.value = ''
}

const receiveNfcData = async (event: any) => {
  try {
    if (!eventGuid.value) {
      console.error('Event GUID not available')
      scanState.value = 'error'
      return
    }

    //creating a loading state
    isLoading.value = true;

    //get customer by serial number
    await useCustomerStore().fetchCustomerBySerialNumber(event)
    const customerStore = useCustomerStore();
    console.log('customer', customerStore.customer);

    //check if customer is found
    if (!customerStore.customer) {
      console.error('Customer not found')
      scanState.value = 'error'
      isLoading.value = false;
      return
    }

    //hide loading state
    isLoading.value = false;

    let response;
    const campaignType = campaign.value?.styleSettings?.type;

    if (campaignType === 'membership') {
      // Show welcome message with customer name
      const customerName = `${customerStore.customer.customers_details.name} ${customerStore.customer.customers_details.surname}`;
      
      response = await $wallyApi('/pass-value', {
        method: 'POST',
        body: {
          serialNumber: event,
          value: "1",
          type: "access",
          eventGuid: eventGuid.value,
        },
      });

      console.log('response', response);
      //pass not found 
      if (response.status !== 200) {
        errorMessage.value = response.message
        scanState.value = 'error'
        return
      } else {
        if (response.passValue.value === '1') {
          scanState.value = 'success'
        } else {
          scanState.value = 'error'
        }
      }

    } else if (campaignType === 'event') {
      response = await $wallyApi('/event-access', {
        method: 'POST',
        body: {
          serialNumber: event,
          campaignGuid,
        },
      });

      console.log('scan result', response);

      if (response.status === 200) {
        scanState.value = 'success';
        eventCustomerName.value = response.customerName;
      } else if (response.status === 404) { 
        //error pass not found
        scanState.value = 'error'
        errorMessage.value = response.message
      } else if (response.status === 403) { 
        const isAlreadyScanned = response.status === 403
        eventCustomerName.value = response.customerName;
        scanState.value = isAlreadyScanned ? 'already_scanned' : 'success'
      }


    } else {
      console.error('Invalid campaign type for NFC')
      scanState.value = 'error'
      return
    }

    nfcTagId.value = eventGuid.value
    scanTime.value = new Date(response.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    scannerID.value = `Scanner-${Math.floor(Math.random() * 1000000)}`

    
  } catch (error) {
    console.error('Error validating NFC tag:', error)
    scanState.value = 'error'
  }
}

const toggleScanMode = () => {
  scanMode.value = scanMode.value === 'nfc' ? 'qr' : 'nfc';
  resetScan();
  if (scanMode.value === 'qr') {
    // Focus the input field on next tick after the element is rendered
    setTimeout(() => {
      qrInputRef.value?.focus();
    }, 0);
  }
};

const handleQrSubmit = async () => {
  if (!qrCodeInput.value.trim()) return;
  await receiveNfcData(qrCodeInput.value.trim());
  qrCodeInput.value = ''; // Clear the input after submission
};

const setupNFC = async () => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader()
      await ndef.scan()
      
      ndef.addEventListener('reading', receiveNfcData)
    } else {
      console.error('NFC not supported on this device')
    }
  } catch (error) {
    console.error('Error setting up NFC:', error)
  }
}

const fetchCampaignDetails = async () => {
  try {
    const response = await campaignStore.fetchCampaignByCampaignGuid(campaignGuid)

    console.log('response', response)

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

onMounted(async () => {
  (window as any).receiveNfcData = receiveNfcData;
  await fetchCampaignDetails()
  await setupNFC()
})

onUnmounted(() => {
  // Clean up NFC listener if needed
  if ('NDEFReader' in window) {
    const ndef = new NDEFReader()
    ndef.removeEventListener('reading', receiveNfcData)
  }
})
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
          <!-- NFC Scanning UI -->
          <div v-if="scanMode === 'nfc'" class="scan-animation">
            <div class="nfc-ring"></div>
            <div class="nfc-icon">
              <VIcon
                icon="tabler-nfc"
                color="primary"
                size="64"
              />
            </div>
          </div>

          <!-- QR Code Scanning UI -->
          <div v-else class="qr-container">
            <form @submit.prevent="handleQrSubmit">
              <input
                ref="qrInputRef"
                v-model="qrCodeInput"
                type="text"
                inputmode="numeric"
                placeholder="Scan QR Code"
                enterkeyhint="go"
              />
            </form>
          </div>

          <template v-if="campaign?.styleSettings?.type === 'event'">
            <h1 class="welcome-text text-black">
              {{ $t('Tap to Access') }} {{ campaign?.campaignName || $t('Event Location') }}
            </h1>
            <p class="subtitle-text text-primary">
              {{ scanMode === 'nfc' 
                ? $t('Hold your device near the NFC tag') 
                : $t('Scan the QR code on your ticket') 
              }}
            </p>
          </template>

          <template v-if="campaign?.styleSettings?.type === 'membership'">
            <h1 class="welcome-text text-black">
              {{ $t('Tap to Access Membership') }}
            </h1>
            <p class="subtitle-text text-primary">
              {{ scanMode === 'nfc' 
                ? $t('Hold your device near the NFC tag') 
                : $t('Scan the QR code on your membership card') 
              }}
            </p>
          </template>

          <!-- Toggle Button -->
          <VBtn
            color="primary"
            variant="tonal"
            class="toggle-button"
            @click="toggleScanMode"
            prepend-icon="tabler-refresh"
          >
            {{ scanMode === 'nfc' ? $t('Switch to QR Code') : $t('Switch to NFC') }}
          </VBtn>
        </template>
        
        <template v-else-if="scanState === 'error'">
          <div class="result-animation error">
            <div class="result-icon">
              <VIcon
                icon="tabler-alert-circle"
                color="white"
                size="64"
              />
            </div>
          </div>

          <h1 class="welcome-text">
            {{ $t('Access Denied') }}
            <br>
            {{ $t('Please try again') }}
          </h1>

          <p class="error-message">
            {{ errorMessage }}
          </p>

          <VBtn color="white" variant="outlined" class="action-button" @click="resetScan">
            {{ $t('Try Again') }}
          </VBtn>
        </template>

        <template v-else>
          <div class="result-animation" :class="scanState">
            <div class="result-icon">
              <VIcon
                :icon="scanState === 'already_scanned' ? 'tabler-alert-triangle' : 'tabler-circle-check'"
                color="white"
                size="64"
              />
            </div>
          </div>

          <h1 class="welcome-text">
            {{ scanState === 'already_scanned' ? $t('Ticket Already Scanned!') : $t('Welcome In') }}
          </h1>
          
          <h2 class="location-text">
            {{ campaign?.campaignName || $t('Event Location') }}
          </h2>

          <template v-if="scanState === 'success'">
            <div class="ticket-info">
              <ConfettiExplosion 
                v-if="showConfetti"
                :particleCount="200"
                :particleSize="12"
                :force="0.8"
                class="confetti-container"
              />
              <template v-if="campaign?.styleSettings?.type === 'event'">              
                <div class="scan-row">
                  <span class="scan-label">{{ $t('Guest Name') }}</span>
                  <span class="scan-value">{{ eventCustomerName }}</span>
                </div>
                <div class="scan-row">
                  <span class="scan-label">{{ $t('SCANNED AT') }}</span>
                  <span class="scan-value">{{ scanTime }}</span>
                </div>
                
                <div class="message-text">
                  {{ $t('Enjoy the event!') }}
                </div>
              </template>

              <template v-if="campaign?.styleSettings?.type === 'membership'">
                <div class="info-row">
                  <div class="info-col">
                    <div class="info-label">MEMBER</div>
                    <div class="info-value">{{ useCustomerStore().customer.customers_details.name }} {{ useCustomerStore().customer.customers_details.surname }}</div>
                  </div>
                </div>
              </template>
            </div>

            <VBtn color="white" variant="outlined" class="action-button" @click="resetScan">
              {{ $t('Tap Again') }}
            </VBtn>
          </template>

          <template v-else>
            <div class="scan-info">
              <div class="scan-row">
                <span class="scan-label">{{ $t('SCANNED AT') }}</span>
                <span class="scan-value">{{ scanTime }}</span>
              </div>
              <div class="scan-row">
                <span class="scan-label">{{ $t('SCANNED BY') }}</span>
                <span class="scan-value">{{ scannerID }}</span>
              </div>
              <div class="scan-row">
                <span class="scan-label">{{ $t('Guest Name') }}</span>
                <span class="scan-value">{{ eventCustomerName }}</span>
              </div>
            </div>

            <VBtn color="white" variant="outlined" class="action-button" @click="resetScan">
              {{ $t('Tap Again') }}
            </VBtn>
          </template>
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
  background: #f5f5f5;
}

.mobile-frame {
  width: 100%;
  height: 100vh;
  background: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-frame.success {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.mobile-frame.already_scanned {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.mobile-frame.error {
  background: linear-gradient(135deg, #FF5252, #D32F2F);
}

.status-bar {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  z-index: 10;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem 1.5rem;
  text-align: center;
  position: relative;
}

.scan-animation {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 1.5rem 0;
}

.nfc-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid var(--v-theme-primary);
  opacity: 0.2;
  transform: translate(-50%, -50%);
  animation: pulse 2s ease-in-out infinite;
}

.nfc-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 50%;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.qr-container {
  width: 100%;
  max-width: 280px;
  margin: 1.5rem 0;
  padding: 0 1rem;
}

.qr-container input {
  width: 100%;
  height: 48px;
  background: white;
  border: 2px solid var(--v-theme-primary);
  border-radius: 24px;
  padding: 0 1.25rem;
  font-size: 1rem;
  color: #333;
  text-align: center;
  outline: none;
  transition: border-color 0.3s ease;
}

.qr-container input:focus {
  border-color: var(--v-theme-primary-darken-1);
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.qr-container input::placeholder {
  color: #999;
}

.welcome-text {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-text.text-black {
  color: #000;
}

.subtitle-text {
  font-size: 1rem;
  margin-bottom: 2rem;
  font-weight: 500;
  opacity: 0.8;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
}

.location-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 2rem;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.ticket-info, .scan-info {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
}

.scan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.scan-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.scan-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.scan-value {
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.message-text {
  color: white;
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: 1rem;
  text-align: center;
}

.error-message {
  color: white;
  font-size: 1.1rem;
  margin: 1rem 0 2rem;
  opacity: 0.9;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.action-button {
  min-width: 160px;
  height: 48px;
  border: 2px solid white;
  border-radius: 24px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;
}

.test-button {
  min-width: 140px;
  height: 44px;
  border-radius: 22px;
  margin-top: 1rem;
  font-weight: 500;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.6;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toggle-button {
  margin-bottom: 1rem;
  border-radius: 20px;
  height: 44px;
  min-width: 180px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style> 
