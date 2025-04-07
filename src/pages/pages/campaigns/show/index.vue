<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';
import DashboardCard from './DashboardCard.vue'
import DonutChart from './DonutChart.vue'
import BarChart from './BarChart.vue'
import AccessLogsTable from './AccessLogsTable.vue'

const route = useRoute();
const type = route.query.type as string;
const campaignGuid = route.params.id as string;
const campaign = ref(null);
const customers = ref([]);
const campaignType = ref('')
const campaignStore = useCampaignStore();
const statistics = ref<Record<string, number | null>>({
  customers: null,
  appleCards: null,
  googleCards: null,
  totalStamps: null,
  totalRedeemed: null,
});

const barchartStats = ref({})
const isLoading = ref(true);
const accessLogsData = ref([]);
const startDate = ref('');
const endDate = ref('');
const currentDate = new Date();
const startDateMonthly = ref(
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
);
const endDateMonthly = ref(
  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');


const isAddGuestModalOpen = ref(false);
const isAddingGuest = ref(false);
const newGuest = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  ticketNumber: '',
  ticketType: '',
  seatInfo: ''
});

// Add these refs for the modal and form
const isCreateEventModalOpen = ref(false);
const newEvent = ref({
  eventName: '',
  eventDescription: '',
  capacity: 100,
  eventBeginDt: new Date().toISOString().slice(0, 10),
  eventEndDt: new Date().toISOString().slice(0, 10)
});
const isCreatingEvent = ref(false);

const fetchEvents = async () => {
  try {
    console.log('Fetching events for campaign:', campaignGuid);
    await campaignStore.fetchEvents(campaignGuid);
    console.log('Events in component:', campaignStore.events);
  } catch (error) {
    console.error('Error fetching events:', error);
    showSnackbar('Failed to fetch events', 'error');
  }
};

const fetchEventGuests = async (eventGuid: string) => {
  if (!eventGuid) return;
  
  try {
    isLoading.value = true;
    await campaignStore.fetchEventGuests(eventGuid);
  } catch (error) {
    console.error('Error fetching event guests:', error);
    showSnackbar('Failed to fetch event guests', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleEventChange = (event: any) => {
  console.log('Event changed:', event);
  if (event) {
    campaignStore.setSelectedEvent(event);
    // Fetch guests for the selected event
    fetchEventGuests(event.eventGuid);
  } else {
    campaignStore.setSelectedEvent(null);
  }
};

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

  fetchPassValueData()
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

console.log(campaignStore)

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
    campaignType.value = campaign.value?.styleSettings.type;

    await campaignStore.fetchCustomerByCampaignGuid(campaignGuid);
    customers.value = campaignStore.customers;
  } catch (error) {
    console.error('Error fetching campaign or customers:', error);
  } finally {
    isLoading.value = false;

  }
};

const fetchStatistics = async () => {
  try {
    isLoading.value = true;
    await campaignStore.fetchCampaignStatisticsMonthly(
      campaignGuid,
      startDateMonthly.value,
      endDateMonthly.value
    );
    barchartStats.value = campaignStore.barchartStats;
  } catch (error) {
    console.error("Error fetching statistics:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCampaignDetails(campaignGuid);
  fetchStatistics();
  fetchEvents();
});

const handleMonthSelected = ({ startDate, endDate }) => {
  startDateMonthly.value = startDate;
  endDateMonthly.value = endDate;

  fetchStatistics();
};

const fetchPassValueData = async () => {
  if (!startDate.value || !endDate.value) {
    showSnackbar('Please select both start and end dates.', 'error');
    return;
  }

  try {
    isLoading.value = true;
    const passValueData = await campaignStore.fetchPassValue(
      campaignGuid,
      startDate.value,
      endDate.value,
      campaignType.value,
    );

    accessLogsData.value = passValueData?.map(item => ({
      name: item.customerName || 'Unknown',
      membershipType: item.passType || 'N/A',
      date: new Date(item.createdAt).toLocaleString(),
    }));

    console.log('Access Logs Data:', accessLogsData.value);
  } catch (error) {
    console.error("Error fetching pass value data:", error);
  } finally {
    isLoading.value = false;
  }
};

const addGuest = async () => {
  if (!newGuest.value.name || !newGuest.value.surname || !newGuest.value.email) {
    showSnackbar('Please fill in all required fields', 'error');
    return;
  }

  try {
    isAddingGuest.value = true;
    
    const guestData = {
      ...newGuest.value,
      eventGuid: campaignStore.selectedEvent.eventGuid
    };
    
    await campaignStore.createGuest(campaignStore.selectedEvent.eventGuid, guestData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSnackbar('Guest added successfully', 'success');
    isAddGuestModalOpen.value = false;
    
    newGuest.value = {
      name: '',
      surname: '',
      phone: '',
      email: '',
      ticketNumber: '',
      ticketType: '',
      seatInfo: ''
    };
    
    if (campaignStore.selectedEvent) {
      await fetchEventGuests(campaignStore.selectedEvent.eventGuid);
    }
  } catch (error) {
    console.error('Error adding guest:', error);
    showSnackbar('Failed to add guest', 'error');
  } finally {
    isAddingGuest.value = false;
  }
};

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

// Update the createEvent function to ensure campaignGuid is passed correctly
const createEvent = async () => {
  if (!newEvent.value.eventName || !newEvent.value.eventDescription) {
    showSnackbar('Please select both start and end dates.', 'error');
    return;
  }

  try {
    isCreatingEvent.value = true;
    
    // Format dates properly
    const formattedEvent = {
      ...newEvent.value,
      eventBeginDt: new Date(newEvent.value.eventBeginDt).toISOString(),
      eventEndDt: new Date(newEvent.value.eventEndDt).toISOString(),
      campaignCampaignGuid: campaignGuid // Ensure campaignGuid is included directly here as well
    };
    
    console.log('Sending create event request with campaignGuid:', campaignGuid);
    const response = await campaignStore.createEvent(campaignGuid, formattedEvent);
    
    console.log('Event created response:', response);
    
    if (response && (response.status === 'success' || response.event_details)) {
      showSnackbar('Event created successfully', 'success');
      isCreateEventModalOpen.value = false;
      
      // Reset form
      newEvent.value = {
        eventName: '',
        eventDescription: '',
        capacity: 100,
        eventBeginDt: new Date().toISOString().slice(0, 10),
        eventEndDt: new Date().toISOString().slice(0, 10)
      };
      
      // Refresh events list
      await fetchEvents();
    } else {
      showSnackbar('Failed to create event', 'error');
    }
  } catch (error) {
    console.error('Error creating event:', error);
    showSnackbar('Failed to create event', 'error');
  } finally {
    isCreatingEvent.value = false;
  }
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

  <!-- Show the event selection section only when campaign type is 'event' -->
  <VCard 
    v-if="campaignType === 'event'"
    title="Select Event" 
    class="mb-6" 
    style="padding: 1rem; border-radius: 12px;"
  >
    <div class="d-flex justify-space-between align-center px-4 py-2">
      <h6 class="text-h6">Events</h6>
      <div class="d-flex align-center gap-2">
        <VBtn
          v-if="campaignStore.selectedEvent"
          color="error"
          variant="outlined"
          @click="handleEventChange(null)"
        >
          Clear Selection
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="isCreateEventModalOpen = true"
        >
          Create Event
        </VBtn>
      </div>
    </div>
    
    <VDataTable
      :headers="[
        { title: 'EVENT NAME', key: 'eventName' },
        { title: 'DESCRIPTION', key: 'eventDescription' },
        { title: 'CAPACITY', key: 'capacity' },
        { title: 'START DATE', key: 'eventBeginDt' },
        { title: 'ACTION', key: 'actions', sortable: false }
      ]"
      :items="campaignStore.events"
      :loading="isLoading"
      class="event-table"
      density="compact"
      :items-per-page="5"
    >
      <template #item.eventName="{ item }">
        {{ item.eventName || 'Unknown Event' }}
      </template>
      <template #item.eventDescription="{ item }">
        {{ item.eventDescription || 'No description available' }}
      </template>
      <template #item.capacity="{ item }">
        {{ item.capacity || 'N/A' }}
      </template>
      <template #item.eventBeginDt="{ item }">
        {{ item.eventBeginDt ? new Date(item.eventBeginDt).toLocaleDateString() : 'N/A' }}
      </template>
      <template #item.actions="{ item }">
        <VBtn
          size="small"
          :color="campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'primary' : 'grey'"
          :variant="campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'flat' : 'tonal'"
          @click="handleEventChange(item)"
        >
          {{ campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'Selected' : 'Select' }}
        </VBtn>
      </template>
      <template #no-data>
        <div class="text-center py-4">
          No events available for this campaign
        </div>
      </template>
    </VDataTable>
  </VCard>

  <!-- Add the Guests section after the Event Selection section -->
  <VCard 
    v-if="campaignType === 'event' && campaignStore.selectedEvent"
    title="Event Guests" 
    class="mb-6" 
    style="padding: 1rem; border-radius: 12px;"
  >
    <VCardText>
      <div class="d-flex justify-space-between align-center pb-4">
        <h6 class="text-h6">
          Guests for "{{ campaignStore.selectedEvent.eventName }}"
        </h6>
        <VBtn
          color="primary"
          prepend-icon="tabler-user-plus"
          size="small"
          @click="isAddGuestModalOpen = true"
        >
          Add Guest
        </VBtn>
      </div>

      <VDataTable
        :headers="[
          { title: 'NAME', key: 'name' },
          { title: 'SURNAME', key: 'surname' },
          { title: 'EMAIL', key: 'email' },
          { title: 'TICKET TYPE', key: 'ticketType' },
          { title: 'TICKET #', key: 'ticketNumber' },
          { title: 'SEAT INFO', key: 'seatInfo' },
          { title: 'ACTIONS', key: 'actions', sortable: false }
        ]"
        :items="campaignStore.eventGuests"
        :loading="campaignStore.isLoadingGuests"
        density="compact"
        :items-per-page="10"
      >
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <VBtn
              icon
              variant="text"
              size="small"
              color="primary"
            >
              <VIcon icon="tabler-mail" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="error"
              :disabled="!item?.serialNumber"
              @click="item?.serialNumber ? $router.push(`/customer/${item?.serialNumber}`) : $event.preventDefault()"
              >
              <VIcon icon="tabler-share" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="primary"
            >
              <VIcon icon="tabler-edit" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="error"
            >
              <VIcon icon="tabler-trash" />
            </VBtn>
          </div>
        </template>
        <template #no-data>
          <div class="text-center py-4">
            No guests found for this event
          </div>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>

  <!-- Create Event Modal -->
  <VDialog
    v-model="isCreateEventModalOpen"
    max-width="600px"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-4">
        <span>Create New Event</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="isCreateEventModalOpen = false"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VForm @submit.prevent="createEvent">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="newEvent.eventName"
                label="Event Name"
                required
                :disabled="isCreatingEvent"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="newEvent.eventDescription"
                label="Event Description"
                rows="3"
                required
                :disabled="isCreatingEvent"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.number="newEvent.capacity"
                label="Capacity"
                type="number"
                min="1"
                required
                :disabled="isCreatingEvent"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="newEvent.eventBeginDt"
                label="Start Date"
                type="date"
                required
                :disabled="isCreatingEvent"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="newEvent.eventEndDt"
                label="End Date"
                type="date"
                required
                :disabled="isCreatingEvent"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="outlined"
          color="secondary"
          @click="isCreateEventModalOpen = false"
          :disabled="isCreatingEvent"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          @click="createEvent"
          :loading="isCreatingEvent"
          :disabled="isCreatingEvent"
        >
          Create Event
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog
  v-model="isAddGuestModalOpen"
  max-width="600px"
  persistent
>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center pa-4">
      <span>Add New Guest</span>
      <VBtn
        icon
        variant="text"
        size="small"
        @click="isAddGuestModalOpen = false"
      >
        <VIcon icon="tabler-x" />
      </VBtn>
    </VCardTitle>
    <VDivider />
    <VCardText class="pa-4">
      <VForm @submit.prevent="addGuest">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newGuest.name"
              label="Name"
              required
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newGuest.surname"
              label="Surname"
              required
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newGuest.phone"
              label="Phone"
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newGuest.email"
              label="Email"
              type="email"
              required
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newGuest.ticketNumber"
              label="Ticket Number"
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newGuest.ticketType"
              label="Ticket Type"
              :disabled="isAddingGuest"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newGuest.seatInfo"
              label="Seat No"
              :disabled="isAddingGuest"
            />
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
    <VDivider />
    <VCardActions class="pa-4">
      <VSpacer />
      <VBtn
        variant="outlined"
        color="secondary"
        @click="isAddGuestModalOpen = false"
        :disabled="isAddingGuest"
      >
        Cancel
      </VBtn>
      <VBtn
        color="primary"
        @click="addGuest"
        :loading="isAddingGuest"
        :disabled="isAddingGuest"
      >
        Add Guest
      </VBtn>
    </VCardActions>
  </VCard>
</VDialog>

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
        <VCol cols="6" md="6">
          <DonutChart :data="widgetData" :isLoading="isLoading" />
        </VCol>
        <VCol cols="6" md="6">

          <BarChart v-if="Object.keys(barchartStats).length > 0" @monthSelected="handleMonthSelected"
            :data="barchartStats" :campaignType="campaignType"/>
        </VCol>
        <VCol cols="12">
          <VCard v-if="accessLogsData.length > 0">
            <VCardTitle>{{ $t('Access Logs') }}</VCardTitle>
            <AccessLogsTable :accessLogs=accessLogsData />
          </VCard>
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
  background-color: rgba(var(--v-global-theme-primary), var(#fff));
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 1rem;
  min-width: 200px;
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

.event-select-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  border-radius: 12px;
}

.event-table {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgb(0 0 0 / 5%);
}

.event-select {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
</style>
