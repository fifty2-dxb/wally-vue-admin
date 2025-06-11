<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
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

interface WallyEvent {
  eventGuid: string;
  eventName: string;
  eventDescription: string;
  eventBeginDt?: string;
  eventEndDt?: string;
  capacity?: number;
}

const route = useRoute();
const campaignGuid = route.params.id as string;
const campaignStore = useCampaignStore();
const campaign = ref<Campaign | null>(null);
const eventGuid = ref('');
const isLoading = ref(true);
const scanState = ref('initial'); // 'initial', 'success', 'already_scanned', 'error'
const scanTime = ref('');
const scannerID = ref('');
const nfcTagId = ref('');
const showConfetti = ref(false);
const errorMessage = ref('');
const eventCustomerName = ref('');
const events = ref<WallyEvent[]>([]);
const selectedEventGuid = ref('');
const showMenu = ref(false);

// --- Offline Sync State ---
const localSerialNumbers = ref<Set<string>>(new Set());
const scannedOffline = ref<Set<string>>(new Set()); // Stores serials scanned locally but not yet synced
const isSyncing = ref(false); // Indicates if fetching serials or uploading scans
const lastSyncTime = ref<Date | null>(null);
let syncIntervalId: number | null = null;
let uploadIntervalId: number | null = null;
const SYNC_INTERVAL = 2 * 60 * 1000; // 1 minute
const UPLOAD_INTERVAL = 1 * 60 * 1000; // 1 minute

// --- Access Logs Sync State ---
const localAccessLogs = ref<Set<string>>(new Set());
const isLogsSyncing = ref(false);
const lastLogsSyncTime = ref<Date | null>(null);
let logsSyncIntervalId: number | null = null;
const LOGS_SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes

// --- End Offline Sync State ---

// Event information based on campaign type
const eventInfo = ref({
  primary: { label: '', value: '' },
  secondary: { label: '', value: '' },
  tertiary: { label: '', value: '' }
});

const scanMode = ref<'nfc' | 'qr'>('nfc');
const qrCodeInput = ref('');
const qrInputRef = ref<HTMLInputElement | null>(null);

// Add this near the top of the script section with other refs
const scannedTickets = ref<Set<string>>(new Set());

// Add this function to handle local storage
const loadScannedTickets = () => {
  const stored = localStorage.getItem(`scanned_tickets_${eventGuid.value}`);
  if (stored) {
    scannedTickets.value = new Set(JSON.parse(stored));
  }
};

const saveScannedTickets = () => {
  localStorage.setItem(`scanned_tickets_${eventGuid.value}`, JSON.stringify([...scannedTickets.value]));
};

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
  // scannerID.value = '' // Keep scanner ID potentially?
  // nfcTagId.value = '' // Keep tag ID?
  errorMessage.value = ''
  eventCustomerName.value = '' // Reset customer name
}

// --- Sync Functions ---
const fetchAndStoreSerialNumbers = async () => {
  if (!eventGuid.value || isSyncing.value) return;

  console.log('Syncing local serial numbers...');
  isSyncing.value = true;
  try {
    const response = await $wallyApi(`/v1/passes/event/${eventGuid.value}/all`);
    if (response && Array.isArray(response)) {
      //get only activated serial numbers
      const newSerialNumbers = new Set(response.filter((pass: any) => pass.activated).map((pass: any) => pass.serialNumber));
      localSerialNumbers.value = newSerialNumbers;
      lastSyncTime.value = new Date();
      console.log(`Successfully synced ${localSerialNumbers.value.size} serial numbers.`);
    } else {
      console.error('Failed to fetch or parse serial numbers:', response);
      // Optionally handle error state in UI
    }
  } catch (error) {
    console.error('Error fetching serial numbers:', error);
    // Optionally handle error state in UI
  } finally {
    isSyncing.value = false;
  }
};

const syncScannedData = async () => {
  if (scannedOffline.value.size === 0 || isSyncing.value) return;

  console.log(`Attempting to upload ${scannedOffline.value.size} offline scans...`);
  isSyncing.value = true;
  const successfullySynced = new Set<string>();

  // Use existing validation endpoints iteratively (Not ideal for batch, but works for now)
  const campaignType = campaign.value?.styleSettings?.type;
  const uploadPromises = [];

  for (const serialNumber of scannedOffline.value) {
    let uploadPromise;
    if (campaignType === 'membership') {
      uploadPromise = $wallyApi('/pass-value', {
        method: 'POST',
        body: {
          serialNumber: serialNumber,
          value: "1", // Assuming '1' means scanned/accessed
          type: "access",
          eventGuid: eventGuid.value,
        },
      }).then(response => ({ serialNumber, response }));
    } else if (campaignType === 'event') {
      uploadPromise = $wallyApi('/event-access', {
        method: 'POST',
        body: {
          serialNumber: serialNumber,
          campaignGuid, // campaignGuid is already available in component scope
        },
      }).then(response => ({ serialNumber, response }));
    } else {
      console.warn(`Cannot sync scan for unknown campaign type: ${campaignType}`);
      continue; // Skip if campaign type is unknown
    }
    uploadPromises.push(uploadPromise);
  }

  try {
    const results = await Promise.allSettled(uploadPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { serialNumber, response } = result.value;
        // Check response status to confirm successful upload
        // Assuming 200 or similar indicates success, even if it was 'already scanned' previously
        if (response.status === 200 || response.status === 403) { 
          successfullySynced.add(serialNumber);
          console.log(`Successfully uploaded scan for: ${serialNumber}`);
        } else {
          console.error(`Failed to upload scan for ${serialNumber}:`, response.message || response.status);
        }
      } else {
        console.error('Error during batch scan upload promise:', result.reason);
      }
    });

    // Remove successfully synced items from the offline set
    if (successfullySynced.size > 0) {
      const updatedScannedOffline = new Set(scannedOffline.value);
      successfullySynced.forEach(sn => updatedScannedOffline.delete(sn));
      scannedOffline.value = updatedScannedOffline;
      console.log(`${successfullySynced.size} scans removed from offline queue.`);
    }

  } catch (error) {
      console.error('Error processing batch scan upload results:', error);
  } finally {
      isSyncing.value = false;
      console.log(`${scannedOffline.value.size} scans remaining in offline queue.`);
  }
};
// --- End Sync Functions ---

// Add access logs sync function
const syncAccessLogs = async () => {
  if (!eventGuid.value || isLogsSyncing.value) return;

  console.log('Syncing access logs...');
  isLogsSyncing.value = true;
  try {
    const logs = await campaignStore.fetchDailyLog(
      campaignGuid,
      eventGuid.value,
      'access',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
      new Date().toISOString()
    );
    
    const newAccessLogs = new Set<string>(logs.map((log: { serialNumber: string }) => log.serialNumber));
    localAccessLogs.value = newAccessLogs;
    lastLogsSyncTime.value = new Date();
    console.log(`Successfully synced ${localAccessLogs.value.size} access logs.`);
  } catch (error) {
    console.error('Error syncing access logs:', error);
  } finally {
    isLogsSyncing.value = false;
  }
};

// Update the checkAccessLogs function to use local data
const checkAccessLogs = (serialNumber: string) => {
  return localAccessLogs.value.has(serialNumber);
};

// Modify the handleEventChange function to load scanned tickets
const handleEventChange = async () => {
  if (!selectedEventGuid.value) return;
  
  eventGuid.value = selectedEventGuid.value;
  // Reset states
  resetScan();
  // Load scanned tickets for the new event
  loadScannedTickets();
  // Fetch new serial numbers and access logs for selected event
  await Promise.all([
    fetchAndStoreSerialNumbers(),
    syncAccessLogs()
  ]);
};

// Modify the receiveNfcData function
const receiveNfcData = async (scannedData: string) => {
  const serialNumber = scannedData.trim();
  if (!serialNumber) {
    errorMessage.value = 'Invalid scan data.';
    scanState.value = 'error';
    return;
  }

  console.log(`Scanned: ${serialNumber}`);

  // 1. Check against local list
  if (localSerialNumbers.value.has(serialNumber)) {
    // 2. Check if already scanned locally
    if (scannedTickets.value.has(serialNumber) || scannedOffline.value.has(serialNumber)) {
      console.log(`Serial ${serialNumber} already scanned locally.`);
      scanState.value = 'already_scanned';
      scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return;
    }

    // 3. Check access logs for previous scans
    const wasPreviouslyScanned = localAccessLogs.value.has(serialNumber);
    if (wasPreviouslyScanned) {
      console.log(`Serial ${serialNumber} was previously scanned according to access logs.`);
      scanState.value = 'already_scanned';
      scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return;
    }

    // 4. New valid scan
    console.log(`Serial ${serialNumber} validated locally. Adding to offline queue.`);
    scanState.value = 'success';
    scannedOffline.value.add(serialNumber); // Add to queue for upload
    scannedTickets.value.add(serialNumber); // Add to local storage tracking
    saveScannedTickets(); // Save to local storage
    showConfetti.value = true; // Trigger confetti on local success
    setTimeout(() => showConfetti.value = false, 3000); // Hide confetti after 3s
    scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Attempt an immediate upload after a successful scan
    setTimeout(async () => {
      await syncScannedData();
      // Sync access logs after successful scan upload
      await syncAccessLogs();
    }, 100);
  } else {
    // 5. Serial not found in local list
    console.log(`Serial ${serialNumber} not found in local list.`);
    errorMessage.value = 'Invalid or inactive ticket.';
    scanState.value = 'error';
  }
};

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

const fetchInitialData = async () => {
  isLoading.value = true;
  try {
    // Fetch campaign and events
    await campaignStore.fetchEvents(campaignGuid);
    events.value = campaignStore.events;
    
    // If we have events, select the first one by default
    if (events.value.length > 0) {
      selectedEventGuid.value = events.value[0].eventGuid;
      eventGuid.value = selectedEventGuid.value;
      await Promise.all([
        fetchAndStoreSerialNumbers(),
        syncAccessLogs()
      ]);
    }
    
    const response = await campaignStore.fetchCampaignByCampaignGuid(campaignGuid);
    campaign.value = response.campaign;
    updateEventInfo(campaign.value);
  } catch (error) {
    console.error('Error fetching initial data:', error);
    errorMessage.value = 'Failed to load event details.';
    scanState.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// Modify the resetLocalState function
const resetLocalState = () => {
  scannedOffline.value.clear();
  localAccessLogs.value.clear();
  lastSyncTime.value = null;
  lastLogsSyncTime.value = null;
  scannedTickets.value.clear();
  localStorage.removeItem(`scanned_tickets_${eventGuid.value}`);
};

// Modify the handleTestScan function
const handleTestScan = async () => {
  const testSerial = '26c48ded-84cc-4893-a61d-7ec07614276c';
  
  // Check if already scanned
  if (scannedTickets.value.has(testSerial) || scannedOffline.value.has(testSerial)) {
    scanState.value = 'already_scanned';
    scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return;
  }

  // Perform the test scan
  await receiveNfcData(testSerial);
};

onMounted(async () => {
  (window as any).receiveNfcData = receiveNfcData;
  await fetchInitialData();
  await setupNFC();
  loadScannedTickets(); // Load scanned tickets on mount

  // Start periodic sync and upload
  if (eventGuid.value) {
    syncIntervalId = window.setInterval(fetchAndStoreSerialNumbers, SYNC_INTERVAL);
    uploadIntervalId = window.setInterval(syncScannedData, UPLOAD_INTERVAL);
    logsSyncIntervalId = window.setInterval(syncAccessLogs, LOGS_SYNC_INTERVAL);
  }
});

onUnmounted(() => {
  // Clean up NFC listener
  if ('NDEFReader' in window) {
    try {
      const ndef = new NDEFReader();
      ndef.removeEventListener('reading', receiveNfcData);
    } catch (e) {
      console.warn('Could not remove NDEFReader listener:', e);
    }
  }
  // Clear intervals
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
  }
  if (uploadIntervalId) {
    clearInterval(uploadIntervalId);
  }
  if (logsSyncIntervalId) {
    clearInterval(logsSyncIntervalId);
  }
})
</script>

<template>
  <div class="page-container">
    <!-- Add a syncing indicator -->
    <VProgressLinear
      v-if="isSyncing"
      indeterminate
      color="primary"
      absolute
      top
    />
    <div class="mobile-frame" :class="scanState">
      <div class="status-bar">
        <VBtn icon variant="text" :color="scanState === 'initial' ? 'black' : 'white'" @click="$router.back()">
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <VSpacer />
        <!-- Display Sync Status -->
        <VChip
          v-if="lastSyncTime"
          size="small"
          :color="scannedOffline.size > 0 ? 'warning' : 'success'"
          variant="flat"
          label
        >
          <VIcon start :icon="isSyncing ? 'tabler-refresh-alert' : 'tabler-cloud-check'" />
          {{ isSyncing ? 'Syncing...' : (scannedOffline.size > 0 ? `${scannedOffline.size} Pending` : 'Synced') }}
           @ {{ lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </VChip>
      </div>

      <!-- Minimalistic Event Selector -->
      <div v-if="events.length > 0" class="event-selector">
        <div 
          class="event-button" 
          @click="showMenu = !showMenu"
        >
          <div class="event-button-content">
            <span class="current-event">{{ events.find(e => e.eventGuid === selectedEventGuid)?.eventName || 'Select Event' }}</span>
            <VIcon 
              :icon="showMenu ? 'tabler-chevron-up' : 'tabler-chevron-down'"
              :color="scanState === 'initial' ? 'primary' : 'white'"
              size="20"
            />
          </div>
        </div>

        <VMenu
          v-model="showMenu"
          :close-on-content-click="true"
          location="bottom"
          :offset="4"
        >
          <VCard class="event-menu-card" elevation="4">
            <VList class="event-list" bg-color="white">
              <VListItem
                v-for="event in events"
                :key="event.eventGuid"
                :active="selectedEventGuid === event.eventGuid"
                @click="() => {
                  selectedEventGuid = event.eventGuid;
                  handleEventChange();
                  showMenu = false;
                }"
                :class="{ 'v-list-item--active': selectedEventGuid === event.eventGuid }"
                hover
              >
                <template #prepend>
                  <div class="event-indicator" :class="{ 'selected': selectedEventGuid === event.eventGuid }" />
                </template>
                
                <VListItemTitle>
                  <div class="event-item-content">
                    <span class="event-name">{{ event.eventName }}</span>
                    <span v-if="event.eventBeginDt" class="event-date">
                      {{ new Date(event.eventBeginDt).toLocaleDateString() }}
                    </span>
                  </div>
                </VListItemTitle>
              </VListItem>
            </VList>
          </VCard>
        </VMenu>
      </div>

      <div class="content-container">
         <template v-if="isLoading">
           <!-- Optional: Dedicated Loading Spinner -->
           <VProgressCircular indeterminate color="primary" size="64" />
           <p class="mt-4">Loading event data...</p>
         </template>
        <template v-else-if="scanState === 'initial'">
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

          <!-- Test Scan Button -->
          <!-- <VBtn
            color="secondary"
            variant="tonal"
            class="test-button"
            @click="handleTestScan"
            prepend-icon="tabler-scan"
          >
            {{ $t('Test Scan') }}
          </VBtn> -->
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
            {{ errorMessage.includes('Failed to load') ? $t('Error') : $t('Access Denied') }}
          </h1>

          <p class="error-message subtitle-text">
            {{ errorMessage || $t('Please try again or contact support.') }}
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
                    <div class="info-value">{{ eventCustomerName || 'Membership Validated' }}</div>
                  </div>
                </div>
              </template>
            </div>

            <VBtn color="white" variant="outlined" class="action-button" @click="resetScan">
              {{ $t('Scan Next') }}
            </VBtn>
          </template>

          <template v-else-if="scanState === 'already_scanned'">
            <div class="scan-info">
              <div class="scan-row">
                <span class="scan-label">{{ $t('SCANNED AT') }}</span>
                <span class="scan-value">{{ scanTime }}</span>
              </div>
            </div>

            <VBtn color="white" variant="outlined" class="action-button" @click="resetScan">
              {{ $t('Scan Next') }}
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
  position: relative;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem 1.5rem;
  text-align: center;
  position: relative;
  padding-top: 120px;
  z-index: 1;
  pointer-events: auto;
}

.scan-animation {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 1.5rem 0;
  z-index: 1;
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

/* Add styles for the sync indicator chip if needed */
.status-bar .v-chip {
  margin-left: auto;
  font-size: 0.75rem;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

/* Style for subtitle text within error state */
.error-message.subtitle-text {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  font-weight: 500;
  opacity: 1;
}

.event-selector {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: auto;
  min-width: 200px;
  max-width: 90%;
}

.event-button {
  background: v-bind('scanState === "initial" ? "white" : "rgba(255, 255, 255, 0.15)"');
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  border: 1px solid v-bind('scanState === "initial" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.2)"');
  transition: all 0.2s ease;
}

.event-button:hover {
  background: v-bind('scanState === "initial" ? "rgba(var(--v-theme-primary), 0.05)" : "rgba(255, 255, 255, 0.2)"');
}

.event-button-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.current-event {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('scanState === "initial" ? "rgba(0, 0, 0, 0.87)" : "white"');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-menu-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-width: 240px;
  max-width: 90vw;
}

.event-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.event-item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
}

.event-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.event-date {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.event-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  margin-right: 8px;
}

.event-indicator.selected {
  background: var(--v-theme-primary);
}

/* Remove old styles */
.event-selector-container,
.event-select,
.event-select-item {
  display: none;
}

/* Ensure content doesn't overlap */
.content-container {
  padding-top: 70px;
}
</style> 
