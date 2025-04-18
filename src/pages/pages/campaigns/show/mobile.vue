<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
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

interface SelectableEvent {
  eventGuid: string;
  eventName: string;
}

const route = useRoute();
const campaignStore = useCampaignStore();

// --- Component State ---
const campaignGuid = ref(route.params.id as string || ''); // Initial guid from route
const selectedEventGuid = ref(route.params.id as string || ''); // Currently selected event
const campaign = ref<Campaign | null>(null);
const eventGuid = ref(''); // Tracks the *loaded* event guid
const availableEvents = ref<SelectableEvent[]>([]);
const isLoading = ref(false); // Loading state for event data/serials
const isEventListLoading = ref(false); // Loading state for the event dropdown list
const scanState = ref('initial'); // 'initial', 'success', 'already_scanned', 'error'
const scanTime = ref('');
const nfcTagId = ref(''); // Can potentially remove if not used elsewhere
const showConfetti = ref(false);
const errorMessage = ref('');
const eventCustomerName = ref(''); // Still might not be reliably available offline

// --- Offline Sync State ---
const localSerialNumbers = ref<Set<string>>(new Set());
const scannedOffline = ref<Set<string>>(new Set());
const isSyncing = ref(false);
const lastSyncTime = ref<Date | null>(null);
let syncIntervalId: number | null = null;
let uploadIntervalId: number | null = null;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const UPLOAD_INTERVAL = 1 * 60 * 1000; // 1 minute

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
  errorMessage.value = ''
  eventCustomerName.value = ''
}

// --- Data Loading Functions ---

// Fetches details and serials for a SPECIFIC event GUID
const loadEventData = async (guidToLoad: string) => {
  if (!guidToLoad) return;
  console.log(`Loading data for event: ${guidToLoad}`);
  isLoading.value = true;
  errorMessage.value = '';
  scanState.value = 'initial'; // Reset scan state when loading new event
  localSerialNumbers.value.clear(); // Clear old serials
  scannedOffline.value.clear(); // Clear offline scans for old event
  lastSyncTime.value = null; // Reset sync time
  campaign.value = null; // Clear old campaign details
  eventGuid.value = ''; // Clear loaded event guid

  // Clear existing intervals before loading new data
  clearSyncIntervals();

  try {
    // Fetch campaign details using the specific GUID
    // Assuming fetchCampaignByCampaignGuid works with eventGuid as well, or use a different store method if needed
    const response = await campaignStore.fetchCampaignByCampaignGuid(guidToLoad);
    console.log('Event details response:', response);

    if (!response || !response.campaign || !response.event || response.event.eventGuid !== guidToLoad) {
      console.error('Invalid event response structure or mismatched GUID:', response);
      errorMessage.value = 'Failed to load event details.';
      scanState.value = 'error';
      return;
    }

    // Set the currently loaded event details
    campaign.value = response.campaign;
    eventGuid.value = response.event.eventGuid; // Confirm the loaded GUID
    updateEventInfo(campaign.value);

    // Fetch initial serial numbers for the *loaded* event
    await fetchAndStoreSerialNumbers(); // This now uses eventGuid.value set above

    // Start sync intervals *after* successfully loading event data
    startSyncIntervals();

  } catch (error) {
    console.error(`Error fetching event details for ${guidToLoad}:`, error);
    errorMessage.value = 'Failed to load event details.';
    scanState.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// Fetches the list of events for the dropdown
const loadAvailableEvents = async () => {
  isEventListLoading.value = true;
  try {
    let events = campaignStore.events;

    // If events array is empty, fetch them first
    if (!events || !Array.isArray(events) || events.length === 0) {
      console.log('No events in store, fetching events...');
      await campaignStore.fetchEvents(campaignGuid.value);
      events = campaignStore.events; // Get the updated events after fetching
    }

    if (events && Array.isArray(events) && events.length > 0) {
      availableEvents.value = events.map((event: any) => ({ 
        eventGuid: event.eventGuid,
        eventName: event.eventName
      }));
      console.log('Loaded available events:', availableEvents.value);

      // If a pre-selected GUID exists (from route) and is valid, load its data
      const initialEventExists = availableEvents.value.some(e => e.eventGuid === selectedEventGuid.value);
      if (selectedEventGuid.value && initialEventExists) {
        await loadEventData(selectedEventGuid.value);
      } else {
        console.log('Please select an event from the dropdown.');
      }
    } else {
      console.error('No events available after fetching');
      errorMessage.value = 'No events available.';
      scanState.value = 'error';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    errorMessage.value = 'Could not load event list.';
    scanState.value = 'error';
  } finally {
    isEventListLoading.value = false;
  }
};

// --- Sync Functions ---
const fetchAndStoreSerialNumbers = async () => {
  // Use the currently loaded eventGuid
  if (!eventGuid.value || isSyncing.value) return;

  console.log(`Syncing serials for event ${eventGuid.value}...`);
  isSyncing.value = true;
  try {
    const response = await $wallyApi(`/v1/passes/event/${eventGuid.value}/all`);
    if (response && Array.isArray(response)) {
      const newSerialNumbers = new Set(response.map((pass: any) => pass.serialNumber));
      localSerialNumbers.value = newSerialNumbers;
      lastSyncTime.value = new Date();
      console.log(`Synced ${localSerialNumbers.value.size} serials for ${eventGuid.value}.`);
    } else {
      console.error('Failed to fetch/parse serials:', response);
    }
  } catch (error) {
    console.error(`Error fetching serials for ${eventGuid.value}:`, error);
  } finally {
    isSyncing.value = false;
  }
};

const syncScannedData = async () => {
  // Use the currently loaded eventGuid and campaign details
  if (!eventGuid.value || !campaign.value || scannedOffline.value.size === 0 || isSyncing.value) return;

  console.log(`Uploading ${scannedOffline.value.size} scans for ${eventGuid.value}...`);
  isSyncing.value = true;
  const successfullySynced = new Set<string>();
  const campaignType = campaign.value?.styleSettings?.type;
  const currentCampaignGuid = campaign.value?.campaignGuid; // Need campaignGuid for event type

  if (campaignType === 'event' && !currentCampaignGuid) {
      console.error('Cannot sync event scans: Missing campaignGuid.');
      isSyncing.value = false;
      return;
  }

  const uploadPromises = [];

  for (const serialNumber of scannedOffline.value) {
    let uploadPromise;
    if (campaignType === 'membership') {
      // Membership uses eventGuid
      uploadPromise = $wallyApi('/pass-value', { /* ... body with eventGuid.value ... */ });
    } else if (campaignType === 'event') {
      // Event access uses campaignGuid
      uploadPromise = $wallyApi('/event-access', { 
           method: 'POST',
           body: {
               serialNumber: serialNumber,
               campaignGuid: currentCampaignGuid, // Use the campaignGuid associated with the loaded event
           },
        }).then(response => ({ serialNumber, response }));
    } else {
      console.warn(`Cannot sync scan for unknown campaign type: ${campaignType}`);
      continue;
    }
    uploadPromises.push(uploadPromise);
  }

  // ... (rest of Promise.allSettled logic remains the same, checking response status) ...
  try {
    const results = await Promise.allSettled(uploadPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { serialNumber, response } = result.value;
        if (response.status === 200 || response.status === 403) { 
          successfullySynced.add(serialNumber);
          console.log(`Uploaded scan for: ${serialNumber}`);
        } else {
          console.error(`Failed upload for ${serialNumber}:`, response.message || response.status);
        }
      } else {
        console.error('Error in batch upload promise:', result.reason);
      }
    });

    if (successfullySynced.size > 0) {
      const updatedScannedOffline = new Set(scannedOffline.value);
      successfullySynced.forEach(sn => updatedScannedOffline.delete(sn));
      scannedOffline.value = updatedScannedOffline;
      console.log(`${successfullySynced.size} scans removed from queue.`);
    }

  } catch (error) {
      console.error('Error processing batch upload:', error);
  } finally {
      isSyncing.value = false;
      console.log(`${scannedOffline.value.size} scans remain in queue for ${eventGuid.value}.`);
  }
};
// --- End Sync Functions ---

// --- Interval Management ---
const startSyncIntervals = () => {
  // Clear any existing intervals first
  clearSyncIntervals();
  
  if (eventGuid.value) { // Only start if an event is loaded
    console.log(`Starting sync intervals for ${eventGuid.value}`);
    syncIntervalId = window.setInterval(fetchAndStoreSerialNumbers, SYNC_INTERVAL);
    uploadIntervalId = window.setInterval(syncScannedData, UPLOAD_INTERVAL);
  } else {
    console.warn('Cannot start sync intervals: No event loaded.');
  }
};

const clearSyncIntervals = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('Cleared serial sync interval.');
  }
  if (uploadIntervalId) {
    clearInterval(uploadIntervalId);
    uploadIntervalId = null;
    console.log('Cleared scan upload interval.');
  }
};
// --- End Interval Management ---

// Updated Scanning Logic (receiveNfcData)
const receiveNfcData = async (scannedData: string) => {
  // Ensure an event is loaded and we have serials
  if (!eventGuid.value || localSerialNumbers.value.size === 0) {
      errorMessage.value = 'Event not loaded or no tickets available.';
      scanState.value = 'error';
      console.warn('Scan attempt failed: Event/serials not loaded.');
      return;
  }

  const serialNumber = scannedData.trim();
  if (!serialNumber) {
    errorMessage.value = 'Invalid scan data.';
    scanState.value = 'error';
    return;
  }

  console.log(`Scanned: ${serialNumber}`);

  if (localSerialNumbers.value.has(serialNumber)) {
    if (scannedOffline.value.has(serialNumber)) {
      console.log(`Serial ${serialNumber} already scanned locally.`);
      scanState.value = 'already_scanned';
      scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      console.log(`Serial ${serialNumber} validated locally. Adding to offline queue.`);
      scanState.value = 'success';
      scannedOffline.value.add(serialNumber); 
      showConfetti.value = true;
      setTimeout(() => showConfetti.value = false, 3000); 
      scanTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimeout(syncScannedData, 100);
    }
  } else {
    console.log(`Serial ${serialNumber} not found in local list for ${eventGuid.value}.`);
    errorMessage.value = 'Invalid or inactive ticket.';
    scanState.value = 'error';
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

// --- Watcher for Selected Event ---
watch(selectedEventGuid, (newGuid, oldGuid) => {
  if (newGuid && newGuid !== eventGuid.value) { // Only load if different from currently loaded
    console.log(`Selected event changed to: ${newGuid}`);
    loadEventData(newGuid);
  }
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  (window as any).receiveNfcData = receiveNfcData; // Keep for potential external calls?
  await loadAvailableEvents(); // Load event list first
  // loadEventData is now called by loadAvailableEvents or the watcher
  await setupNFC();
  // Intervals are now started by loadEventData
})

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
  clearSyncIntervals();
})
</script>

<template>
  <div class="page-container">
    <VProgressLinear
      v-if="isSyncing || isLoading || isEventListLoading" 
      indeterminate
      color="primary"
      absolute
      top
    />
    <div class="mobile-frame" :class="scanState">
      <div class="status-bar">
        <VBtn 
          icon 
          variant="text" 
          :color="scanState === 'initial' && !isLoading ? 'black' : 'white'" 
          @click="$router.back()"
          :disabled="isLoading || isEventListLoading"
        >
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <VSpacer />
        <!-- Event Selector Dropdown -->
        <VSelect
          v-if="availableEvents.length > 0"
          v-model="selectedEventGuid"
          :items="availableEvents"
          item-title="eventName"
          item-value="eventGuid"
          density="compact"
          variant="solo-filled"
          hide-details
          :disabled="isLoading || isEventListLoading || isSyncing"
          class="event-selector mx-2"
          style="max-width: 180px;"
        />

        <!-- Sync Status Chip -->
        <VChip
          v-if="lastSyncTime"
          size="small"
          :color="scannedOffline.size > 0 ? 'warning' : (isSyncing ? 'blue' : 'success')"
          variant="flat"
          label
          class="sync-chip"
        >
          <VIcon start :icon="isSyncing ? 'tabler-refresh-alert' : (scannedOffline.size > 0 ? 'tabler-cloud-upload' : 'tabler-cloud-check')" />
          {{ isSyncing ? 'Syncing...' : (scannedOffline.size > 0 ? `${scannedOffline.size} Pending` : 'Synced') }}
           @ {{ lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </VChip>
         <VChip
          v-else-if="isLoading || isEventListLoading"
          size="small"
          color="grey"
          variant="flat"
          label
        >
           <VIcon start icon="tabler-loader" />
           {{ isEventListLoading ? 'Loading Events...' : 'Loading Data...' }}
         </VChip>
      </div>

      <div class="content-container">
         <template v-if="isLoading || isEventListLoading">
           <VProgressCircular indeterminate color="primary" size="64" />
           <p class="mt-4">{{ isEventListLoading ? 'Loading available events...' : 'Loading event data...' }}</p>
         </template>
        <template v-else-if="scanState === 'initial' && eventGuid"> 
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
              {{ $t('Tap to Access') }} {{ campaign?.campaignName || 'Event' }}
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
            :disabled="!eventGuid" 
          >
            {{ scanMode === 'nfc' ? $t('Switch to QR Code') : $t('Switch to NFC') }}
          </VBtn>
        </template>
         <template v-else-if="!eventGuid && !isLoading && !isEventListLoading && availableEvents.length > 0">
            <!-- Prompt to select an event if none is loaded -->
             <VIcon icon="tabler-calendar-event" size="64" color="grey-darken-1" class="mb-4" />
             <h1 class="welcome-text text-black">Select an Event</h1>
             <p class="subtitle-text text-primary">Choose an event from the dropdown above to start scanning.</p>
         </template>
        <template v-else-if="scanState === 'success'">
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
            {{ campaign?.campaignName || 'Event Location' }}
          </h2>

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
           <div class="result-animation already_scanned">
             <div class="result-icon">
               <VIcon
                 icon="tabler-alert-triangle"
                 color="white"
                 size="64"
               />
             </div>
           </div>

           <h1 class="welcome-text">
             {{ $t('Ticket Already Scanned!') }}
           </h1>
           
           <h2 class="location-text">
             {{ campaign?.campaignName || 'Event Location' }}
           </h2>

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
            {{ errorMessage.includes('load') || errorMessage.includes('No accessible events') ? $t('Error') : $t('Access Denied') }}
          </h1>

          <p class="error-message subtitle-text">
            {{ errorMessage || $t('Please try again or contact support.') }}
          </p>

          <VBtn color="white" variant="outlined" class="action-button" @click="scanState === 'initial' ? loadAvailableEvents() : resetScan">
            {{ scanState === 'initial' && errorMessage.includes('load') ? $t('Reload Events') : $t('Try Again') }}
          </VBtn>
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
  flex-grow: 0;
  flex-shrink: 1;
}

.sync-chip {
  flex-shrink: 0;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Add some gap */
}
</style> 
