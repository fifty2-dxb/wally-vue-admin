<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';
import DashboardCard from './DashboardCard.vue'
import DonutChart from './DonutChart.vue'
import BarChart from './BarChart.vue'
import AccessLogsTable from './AccessLogsTable.vue'
import { useCustomerStore } from '@/stores/customer';
import ImportMembersWizard from '@/components/campaign/ImportMembersWizard.vue';
import AddMemberWizard from '@/components/campaign/AddMemberWizard.vue';

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

const isAddMemberWizardOpen = ref(false);

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' },
  { title: 'Other', value: 'Other' },
];

const deleteDialog = ref(false);
const memberToDelete = ref<any>(null);

const isImportMembersWizardOpen = ref(false);

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

const handleDeleteMember = async (item: any) => {
  memberToDelete.value = item;
  deleteDialog.value = true;
};

const closeDelete = () => {
  deleteDialog.value = false;
  memberToDelete.value = null;
};

const deleteItemConfirm = async () => {
  try {
    if (!memberToDelete.value) return;
    
    await useCustomerStore().deleteMember(memberToDelete.value.id);
    showSnackbar('Member deleted successfully', 'success');
    
    await fetchCampaignDetails(campaignGuid);
  } catch (error) {
    console.error('Error deleting member:', error);
    showSnackbar('Failed to delete member', 'error');
  } finally {
    closeDelete();
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
  { title: 'Actions', key: 'edit', sortable: false },
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
    console.log("customers", customers.value);
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

const fetchLatestLogs = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    const logs = await campaignStore.fetchDailyLog(
      campaignGuid,
      'access',
      startDate,
      endDate
    );

    accessLogsData.value = logs.map(log => ({
      name: log.customerName,
      date: new Date(log.createdAt),
      serialNumber: log.serialNumber,
      passValue: log.passValue || 0 // Default to 0 if passValue is undefined
    }));

  } catch (error) {
    console.error('Error fetching daily logs:', error);
    showSnackbar('Failed to fetch access logs', 'error');
  }
};

onMounted(() => {
  fetchCampaignDetails(campaignGuid);
  fetchStatistics();
  fetchEvents();
  fetchLatestLogs();
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

const isAddMemberDisabled = computed(() => {
  return campaignType.value === 'event' && !campaignStore.selectedEvent;
});

const addAdditionalField = () => {
  newMember.value.additionalFields.push({ key: '', value: '' });
};

const removeAdditionalField = (index: number) => {
  newMember.value.additionalFields.splice(index, 1);
};

const handleAddMember = async () => {
  if (!newMember.value.name || !newMember.value.surname || !newMember.value.email) {
    showSnackbar('Please fill in all required fields', 'error');
    return;
  }

  try {
    isAddingMember.value = true;

    // Convert additional fields to JSON string
    const additionalData = newMember.value.additionalFields.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const memberData = {
      ...newMember.value,
      smsMarketing: newMember.value.smsMarketing ? 1 : 0,
      emailMarketing: newMember.value.emailMarketing ? 1 : 0,
      additionalData: JSON.stringify(additionalData),
    };

    let eventGuid;
    if (campaignType.value === 'membership') {
      eventGuid = campaignStore.events[0]?.eventGuid;
    } else if (campaignType.value === 'event') {
      eventGuid = campaignStore.selectedEvent?.eventGuid;
    }

    if (!eventGuid) {
      showSnackbar('No event found for this campaign', 'error');
      return;
    }

    await useCustomerStore().addMember(memberData, { eventId: eventGuid });

    showSnackbar('Member added successfully', 'success');
    isAddMemberWizardOpen.value = false;

    // Reset form
    newMember.value = {
      name: '',
      surname: '',
      phonenumber: '',
      email: '',
      promotion: '',
      gender: null,
      birthday: null,
      smsMarketing: 0,
      emailMarketing: 0,
      note: '',
      additionalFields: [],
    };
    
    // Refresh members list
    await fetchCampaignDetails(campaignGuid);
  } catch (error) {
    console.error('Error adding member:', error);
    showSnackbar('Failed to add member', 'error');
  } finally {
    isAddingMember.value = false;
  }
};

</script>

<template>
  <!-- Campaign Header -->
  <VRow no-gutters>
    <VCol cols="12" md="8">
      <VCard class="modern-card mb-5">
        <VRow align="center" no-gutters>
          <VCol cols="12" sm="4" md="3" class="text-center pa-4">
            <img width="150" :src="campaign?.styleSettings.campaignPreview" class="campaign-preview" />
          </VCol>
          <VCol cols="12" sm="8" md="9" class="pa-4">
            <h3 class="text-h4 font-weight-medium mb-2">{{ campaign?.campaignName }}</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">{{ campaign?.campaignDescription }}</p>
            <div class="d-flex gap-4">
              <VBtn 
                prepend-icon="tabler-edit"
                :to="{ name: 'pages-campaign-update', params: { id: campaignGuid } }"
                class="action-btn"
              >
                {{ $t('Edit Campaign') }}
              </VBtn>
              <VBtn
                icon
                variant="tonal"
                color="secondary"
                class="action-btn"
              >
                <VIcon icon="tabler-share" />
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCard>

      <!-- Members Section -->
      <VCard v-if="campaignType === 'membership'" class="modern-card mb-5">
        <VCardTitle class="pa-4">
          <div class="d-flex flex-wrap justify-space-between align-center gap-y-4">
            <h6 class="text-h6 mb-0">Members</h6>
            <div class="d-flex gap-3">
              <VBtn
                color="primary"
                prepend-icon="tabler-user-plus"
                @click="isAddMemberWizardOpen = true"
                size="small"
              >
                Add Member
              </VBtn>
              <VBtn
                color="secondary"
                variant="tonal"
                prepend-icon="tabler-file-import"
                @click="isImportMembersWizardOpen = true"
              >
                Import Members
              </VBtn>
            </div>
          </div>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-0">
          <VDataTable
            :headers="headers"
            :items="customers"
            density="comfortable"
            :items-per-page="10"
            class="modern-table"
          >
            <template #item.edit="{ item }">
              <div class="d-flex gap-2">
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  :disabled="!item?.passes?.[0]?.serialNumber"
                  @click="item?.passes?.[0]?.serialNumber ? $router.push(`/customer/${item?.passes?.[0]?.serialNumber}`) : $event.preventDefault()"
                >
                  <VIcon icon="tabler-mail" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  class="action-btn"
                  :to="{ name: 'pages-customers-show', params: { id: item.id } }"
                >
                  <VIcon icon="tabler-edit" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  class="action-btn"
                  @click="handleDeleteMember(item)"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </div>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Access Logs Section -->
    <VCol cols="12" md="4" class="ps-md-4">
      <VCard class="modern-card sticky-card">
        <VCardTitle class="pa-4 d-flex align-center">
          <VIcon icon="tabler-history" color="primary" class="me-2" />
          <span>Latest Activity</span>
          <VSpacer />
          <VBtn
            icon
            variant="text"
            size="small"
            @click="fetchLatestLogs"
          >
            <VIcon icon="tabler-refresh" />
          </VBtn>
        </VCardTitle>
        <VDivider />
        <VList class="pa-0">
          <VListItem
            v-for="log in accessLogsData"
            :key="log.id"
            class="px-4 py-3"
          >
            <template #prepend>
              <VAvatar
                :color="log.passValue === 1 ? 'success' : 'error'"
                variant="tonal"
                size="40"
                class="me-4"
              >
                <VIcon
                  :icon="log.passValue === 1 ? 'tabler-check' : 'tabler-x'"
                  size="24"
                  color="black"
                />
              </VAvatar>
            </template>
            <VListItemTitle class="font-weight-medium">
              {{ log.name }}
            </VListItemTitle>
            <VListItemSubtitle class="text-medium-emphasis">
              {{ new Date(log.date).toLocaleString() }}
            </VListItemSubtitle>
            <template #append>
              <VChip
                size="small"
                :color="log.passValue === 1 ? 'success' : 'error'"
                variant="tonal"
                class="ml-2"
              >
                {{ log.passValue === 1 ? 'Access Granted' : 'Access Denied' }}
              </VChip>
            </template>
          </VListItem>
        </VList>
        <VDivider />
        <div class="d-flex justify-center pa-2">
          <VPagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
            density="comfortable"
          />
        </div>
      </VCard>
    </VCol>
  </VRow>

  <!-- Event Selection (if campaign type is event) -->
  <VCard 
    v-if="campaignType === 'event'"
    class="modern-card  mb-6"
  >
    <div class="d-flex justify-space-between align-center px-6 py-4">
      <h5 class="text-h6 font-weight-medium">Events</h5>
      <div class="d-flex gap-3">
        <VBtn
          v-if="campaignStore.selectedEvent"
          color="error"
          variant="tonal"
          class="action-btn"
          @click="handleEventChange(null)"
        >
          Clear Selection
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          class="action-btn"
          @click="isCreateEventModalOpen = true"
        >
          Create Event
        </VBtn>
      </div>
    </div>
    
    <VDivider />
    
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
      class="modern-table"
      density="comfortable"
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
    class="modern-card mb-5"
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
              :disabled="!item?.passes?.[0]?.serialNumber"
              @click="item?.passes?.[0]?.serialNumber ? $router.push(`/customer/${item?.passes?.[0]?.serialNumber}`) : $event.preventDefault()"
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

  <!-- Stats and Charts Section -->
  <VRow class="mb-5">
    <VCol cols="12">
      <VCard class="modern-card">
        <VCardText>
          <!-- Filters -->
          <div class="filter-section">
            <div class="filter-container">
              <VTextField
                v-model="startDate"
                label="Start Date"
                clearable
                prepend-icon="tabler-calendar"
                type="date"
                class="filter-input"
                hide-details
                variant="outlined"
                density="comfortable"
              />
              <VTextField
                v-model="endDate"
                label="End Date"
                clearable
                prepend-icon="tabler-calendar"
                type="date"
                class="filter-input"
                hide-details
                variant="outlined"
                density="comfortable"
              />
              <VBtn
                color="primary"
                @click="applyFilters"
                class="apply-button"
                elevation="0"
              >
                <VIcon icon="tabler-filter" class="me-2" />
                Apply Filters
              </VBtn>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div v-for="(stat, index) in widgetData" :key="index" class="stat-card">
              <div class="stat-icon-wrapper">
                <div class="stat-icon" :style="{ background: `linear-gradient(135deg, rgba(var(--v-theme-${stat.color}), 0.1), rgba(var(--v-theme-${stat.color}), 0.05))` }">
                  <VIcon :icon="stat.icon" :color="stat.color" size="24" />
                </div>
                <div class="stat-title">{{ stat.title }}</div>
              </div>
              <div class="stat-value" :style="{ background: `linear-gradient(135deg, var(--v-theme-${stat.color}), rgba(var(--v-theme-${stat.color}), 0.8))` }">
                {{ stat.value || 0 }}
              </div>
            </div>
          </div>

          <VRow>
            <VCol cols="12" md="6">
              <div class="chart-section">
                <div class="chart-title">
                  <div class="icon">
                    <VIcon icon="tabler-chart-pie" size="20" color="primary" />
                  </div>
                  <span class="text">Customer Distribution</span>
                </div>
                <div class="chart-container">
                  <DonutChart :data="widgetData" :isLoading="isLoading" />
                </div>
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="chart-section">
                <div class="chart-title">
                  <div class="icon">
                    <VIcon icon="tabler-chart-bar" size="20" color="primary" />
                  </div>
                  <span class="text">Monthly Trends</span>
                </div>
                <div class="chart-container">
                  <BarChart 
                    v-if="Object.keys(barchartStats).length > 0"
                    @monthSelected="handleMonthSelected"
                    :data="barchartStats"
                    :campaignType="campaignType"
                  />
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VCard v-if="campaignType === 'event'" class="modern-card mb-5">
    <VCardTitle class="pa-6">
      <div class="d-flex flex-wrap justify-space-between align-center gap-y-4">
        <h6 class="text-h6 mb-0">Members</h6>
        <div class="d-flex flex-wrap gap-3">
          <VTooltip
            :disabled="!isAddMemberDisabled"
            location="top"
            content-class="tooltip-custom"
          >
            <template v-slot:activator="{ props }">
              <div v-bind="props">
                <VBtn
                  color="primary"
                  prepend-icon="tabler-user-plus"
                  @click="isAddMemberWizardOpen = true"
                  :disabled="isAddMemberDisabled"
                >
                  Add Member
                </VBtn>
              </div>
            </template>
            <span>Please select an event first</span>
          </VTooltip>
          <VBtn
            color="secondary"
            variant="tonal"
            prepend-icon="tabler-file-import"
            @click="isImportMembersWizardOpen = true"
          >
            Import Members
          </VBtn>
        </div>
      </div>
    </VCardTitle>
    <VDivider />
    <VCardText class="pa-0">
      <VDataTable
        :headers="headers"
        :items="customers"
        density="comfortable"
        :items-per-page="5"
        class="modern-table"
      >
        <template #item.edit="{ item }">
          <VBtn
            icon
            variant="text"
            color="primary"
            class="action-btn"
            :to="{ name: 'pages-customers-show', params: { id: item.id } }"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>

  <!-- Modals -->
  <VDialog
    v-model="isCreateEventModalOpen"
    max-width="600"
    class="modern-modal"
  >
    <VCard>
      <VCardTitle class="modal-header d-flex justify-space-between align-center">
        <span class="text-h6">Create New Event</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="isCreateEventModalOpen = false"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VCardText class="modal-body">
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
      <VCardActions class="modal-footer">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          class="me-3"
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

  <!-- Add Member Wizard -->
  <AddMemberWizard
    v-model:isOpen="isAddMemberWizardOpen"
    :event-id="campaignStore.selectedEvent?.eventGuid"
    @imported="fetchCampaignDetails(campaignGuid)"
  />

  <VDialog
    v-model="deleteDialog"
    max-width="500px"
  >
    <VCard title="Delete Member">
      <VCardText>
        Are you sure you want to delete this member? This action cannot be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="closeDelete"
        >
          Cancel
        </VBtn>
        <VBtn
          color="error"
          variant="elevated"
          @click="deleteItemConfirm"
          :loading="isLoading"
        >
          Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="snackbarVisible"
    :color="snackbarColor"
    :timeout="5000"
    location="top right"
    class="modern-snackbar"
  >
    {{ snackbarMessage }}
  </VSnackbar>

  <ImportMembersWizard
    v-model:isOpen="isImportMembersWizardOpen"
    :event-id="campaignStore.selectedEvent?.eventGuid"
    @imported="fetchCampaignDetails(campaignGuid)"
  />
</template>

<style scoped>
/* Modern Card Styles */
.modern-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.05) !important;
}

.campaign-preview {
  max-width: 120px;
  height: auto;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 200px;
  max-width: none;
  background: rgba(var(--v-theme-surface), 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.filter-input:hover {
  background: rgba(var(--v-theme-surface), 0.1);
}

.apply-button {
  min-width: 140px;
  height: 44px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.2);
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.7), rgba(var(--v-theme-primary), 0.1));
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-right: 1rem;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--v-theme-primary), rgba(var(--v-theme-primary), 0.8));
  line-height: 1.2;
}

/* Chart Sections */
.chart-section {
  background: linear-gradient(145deg, rgba(var(--v-theme-surface), 0.8), rgba(var(--v-theme-background), 0.8));
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.chart-title .icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
}

.chart-title .text {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.chart-container {
  position: relative;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.05);
  /* border: 1px solid rgba(var(--v-theme-primary), 0.05); */
}

/* Table Styles */
.modern-table {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  font-size: 0.875rem;
}

.modern-table :deep(th) {
  font-size: 0.75rem;
  padding: 0.5rem 1rem !important;
}

.modern-table :deep(td) {
  padding: 0.5rem 1rem !important;
}

/* Action Buttons */
.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* Modal Styles */
.modern-modal {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  background: rgba(var(--v-theme-surface), 0.5);
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(var(--v-theme-primary), 0.05);
}

.sticky-card {
  position: sticky;
  top: 1rem;
}

.access-logs-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.access-logs-list :deep(.v-list-item) {
  padding: 12px 16px;
  min-height: 72px;
}

.access-logs-list :deep(.v-list-item:not(:last-child)) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.access-logs-list :deep(.v-list-item__prepend) {
  margin-right: 16px;
}

.access-logs-list :deep(.v-list-item__title) {
  font-weight: 500;
  font-size: 0.875rem;
}

.access-logs-list :deep(.v-list-item__subtitle) {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Update spacing for better visual hierarchy */
.mt-8 {
  margin-top: 2rem !important;
}

.filter-section {
  margin-bottom: 2.5rem;
}

.stats-grid {
  margin-bottom: 2.5rem;
}

.chart-section {
  margin-bottom: 1.5rem;
}

:deep(.tooltip-custom) {
  background-color: rgba(var(--v-theme-surface), 0.9);
  color: rgba(var(--v-theme-on-surface), 0.87);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 599px) {
  .gap-y-4 {
    row-gap: 1rem !important;
  }
  
  .d-flex.flex-wrap.gap-3 {
    width: 100%;
    justify-content: flex-start;
  }
  
  .d-flex.flex-wrap.gap-3 .v-btn {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 767px) {
  .ps-md-4 {
    padding-left: 0 !important;
    margin-top: 1.25rem;
  }
  
  .modern-card {
    margin-bottom: 1.25rem !important;
  }
}
</style>