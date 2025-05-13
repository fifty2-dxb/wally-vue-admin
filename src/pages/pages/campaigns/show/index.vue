<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';
import DashboardCard from './DashboardCard.vue'
import DonutChart from './DonutChart.vue'
import BarChart from './BarChart.vue'
import AccessLogsTable from './AccessLogsTable.vue'
import EventAnalytics from './EventAnalytics.vue'
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
const isEditEventModalOpen = ref(false);
const newEvent = ref({
  eventName: '',
  eventDescription: '',
  capacity: 100,
  eventBeginDt: new Date().toISOString().slice(0, 10),
  eventEndDt: new Date().toISOString().slice(0, 10),
  timezone: '(GMT-08:00) Pacific Time (US & Canada)'
});

// Add these refs at the top with other refs
const editingEvent = ref<Event | null>(null);
const currentStep = ref(1);
const totalSteps = 3;
const isEditingEvent = ref(false);

// Add these refs at the top with other refs
const isDeleteGuestDialogOpen = ref(false);
const guestToDelete = ref<any>(null);

// Add these refs at the top with other refs
const artworkFile = ref<File | null>(null);
const venueMapFile = ref<File | null>(null);
const artworkPreview = ref<string | null>(null);
const venueMapPreview = ref<string | null>(null);
const isUploading = ref(false);

// Add interfaces for event semantics
interface VenueLocation {
  latitude: number;
  longitude: number;
}

interface RelevantDate {
  startDate: string;
  endDate: string;
}

interface EventSemantics {
  eventLiveMessage: string;
  eventType: string;
  eventName: string;
  entranceDescription: string;
  eventAddress: string;
  venueLocation: VenueLocation;
  venueName: string;
  performerNames: string[];
  eventStartDate: string;
  eventEndDate: string;
  directionsInformationURL: string;
  contactVenueWebsite: string;
  relevantDates: RelevantDate[];
}

// Add refs for event semantics
const eventSemantics = ref<EventSemantics>({
  eventLiveMessage: '',
  eventType: 'PKEventTypeLivePerformance',
  eventName: '',
  eventAddress: '',
  entranceDescription: '',
  venueLocation: {
    latitude: 0,
    longitude: 0
  },
  venueName: '',
  performerNames: [],
  eventStartDate: '',
  eventEndDate: '',
  directionsInformationURL: '',
  contactVenueWebsite: '',
  relevantDates: []
});

const additionalFields = ref<AdditionalInfoField[]>([]);

const addAdditionalField = () => {
  const key = `additionalInfo-${additionalFields.value.length + 1}`;
  additionalFields.value.push({
    key,
    label: '',
    value: '',
    dataDetectorTypes: []
  });
};

const removeAdditionalField = (index: number) => {
  additionalFields.value.splice(index, 1);
};

// Add refs for time fields
const eventBeginTime = ref('');
const eventEndTime = ref('');
// Add timezone ref
const eventTimezone = ref('(GMT-08:00) Pacific Time (US & Canada)');

// Add timezones list
const timezones = [
  '(GMT-11:00) International Date Line West',
  '(GMT-11:00) Midway Island',
  '(GMT-10:00) Hawaii',
  '(GMT-09:00) Alaska',
  '(GMT-08:00) Pacific Time (US & Canada)',
  '(GMT-08:00) Tijuana',
  '(GMT-07:00) Arizona',
  '(GMT-07:00) Chihuahua',
  '(GMT-07:00) La Paz',
  '(GMT-07:00) Mazatlan',
  '(GMT-07:00) Mountain Time (US & Canada)',
  '(GMT-06:00) Central America',
  '(GMT-06:00) Central Time (US & Canada)',
  '(GMT-06:00) Guadalajara',
  '(GMT-06:00) Mexico City',
  '(GMT-06:00) Monterrey',
  '(GMT-06:00) Saskatchewan',
  '(GMT-05:00) Bogota',
  '(GMT-05:00) Eastern Time (US & Canada)',
  '(GMT-05:00) Indiana (East)',
  '(GMT-05:00) Lima',
  '(GMT-05:00) Quito',
  '(GMT-04:00) Atlantic Time (Canada)',
  '(GMT-04:00) Caracas',
  '(GMT-04:00) La Paz',
  '(GMT-04:00) Santiago',
  '(GMT-03:30) Newfoundland',
  '(GMT-03:00) Brasilia',
  '(GMT-03:00) Buenos Aires',
  '(GMT-03:00) Georgetown',
  '(GMT-03:00) Greenland',
  '(GMT-02:00) Mid-Atlantic',
  '(GMT-01:00) Azores',
  '(GMT-01:00) Cape Verde Is.',
  '(GMT+00:00) Casablanca',
  '(GMT+00:00) Dublin',
  '(GMT+00:00) Edinburgh',
  '(GMT+00:00) Lisbon',
  '(GMT+00:00) London',
  '(GMT+01:00) Amsterdam',
  '(GMT+01:00) Berlin',
  '(GMT+01:00) Brussels',
  '(GMT+01:00) Madrid',
  '(GMT+01:00) Paris',
  '(GMT+01:00) Prague',
  '(GMT+01:00) Rome',
  '(GMT+01:00) Stockholm',
  '(GMT+01:00) Vienna',
  '(GMT+01:00) Warsaw',
  '(GMT+02:00) Athens',
  '(GMT+02:00) Bucharest',
  '(GMT+02:00) Cairo',
  '(GMT+02:00) Helsinki',
  '(GMT+02:00) Istanbul',
  '(GMT+02:00) Jerusalem',
  '(GMT+02:00) Kyiv',
  '(GMT+03:00) Minsk',
  '(GMT+03:00) Moscow',
  '(GMT+03:00) Riyadh',
  '(GMT+03:30) Tehran',
  '(GMT+04:00) Abu Dhabi',
  '(GMT+04:00) Baku',
  '(GMT+04:00) Muscat',
  '(GMT+04:00) Tbilisi',
  '(GMT+04:30) Kabul',
  '(GMT+05:00) Karachi',
  '(GMT+05:00) Tashkent',
  '(GMT+05:30) Chennai',
  '(GMT+05:30) Kolkata',
  '(GMT+05:30) Mumbai',
  '(GMT+05:30) New Delhi',
  '(GMT+05:45) Kathmandu',
  '(GMT+06:00) Almaty',
  '(GMT+06:00) Dhaka',
  '(GMT+06:30) Yangon',
  '(GMT+07:00) Bangkok',
  '(GMT+07:00) Jakarta',
  '(GMT+08:00) Beijing',
  '(GMT+08:00) Hong Kong',
  '(GMT+08:00) Perth',
  '(GMT+08:00) Singapore',
  '(GMT+08:00) Taipei',
  '(GMT+09:00) Osaka',
  '(GMT+09:00) Seoul',
  '(GMT+09:00) Tokyo',
  '(GMT+09:30) Adelaide',
  '(GMT+09:30) Darwin',
  '(GMT+10:00) Brisbane',
  '(GMT+10:00) Melbourne',
  '(GMT+10:00) Sydney',
  '(GMT+11:00) Noumea',
  '(GMT+12:00) Auckland',
  '(GMT+12:00) Wellington',
];

// Update handleEditEvent to handle time fields
const handleEditEvent = (event: Event) => {
  editingEvent.value = {
    ...event,
    eventBeginDt: new Date(event.eventBeginDt).toISOString().split('T')[0],
    eventEndDt: new Date(event.eventEndDt).toISOString().split('T')[0],
  };
  
  // Set time fields
  eventBeginTime.value = new Date(event.eventBeginDt).toTimeString().slice(0, 5);
  eventEndTime.value = new Date(event.eventEndDt).toTimeString().slice(0, 5);
  
  // Handle additionalData
  try {
    if (typeof event.additionalData === 'string') {
      const parsedData = event.additionalData ? JSON.parse(event.additionalData) : {};
      additionalFields.value = parsedData.additionalInfoFields || [];
      if (parsedData.semantics) {
        eventSemantics.value = parsedData.semantics;
      }
      if (parsedData.images) {
        artworkPreview.value = parsedData.images.artworkUrl || null;
        venueMapPreview.value = parsedData.images.venueMapUrl || null;
      }
      // Set timezone if available
      if (parsedData.timezone) {
        eventTimezone.value = parsedData.timezone;
      }
    } else if (event.additionalData && typeof event.additionalData === 'object') {
      additionalFields.value = event.additionalData.additionalInfoFields || [];
      if (event.additionalData.semantics) {
        eventSemantics.value = event.additionalData.semantics;
      }
      if (event.additionalData.images) {
        artworkPreview.value = event.additionalData.images.artworkUrl || null;
        venueMapPreview.value = event.additionalData.images.venueMapUrl || null;
      }
      // Set timezone if available
      if (event.additionalData.timezone) {
        eventTimezone.value = event.additionalData.timezone;
      }
    } else {
      additionalFields.value = [];
    }
  } catch (error) {
    console.error('Error parsing additionalData:', error);
    additionalFields.value = [];
  }
  
  currentStep.value = 1;
  isEditEventModalOpen.value = true;
};

const isCreatingEvent = ref(false);
const isAddMemberWizardOpen = ref(false);

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' },
  { title: 'Other', value: 'Other' },
];

//"PKEventTypeGeneric" | "PKEventTypeMovie" | "PKEventTypeConference" | "PKEventTypeConvention" | "PKEventTypeWorkshop" | "PKEventTypeSocialGathering" | "PKEventTypeSports" | "PKEventTypeLivePerformance";
const eventType = [
  { title: 'Generic', value: 'PKEventTypeGeneric' },
  { title: 'Movie', value: 'PKEventTypeMovie' },
  { title: 'Conference', value: 'PKEventTypeConference' },
  { title: 'Convention', value: 'PKEventTypeConvention' },
  { title: 'Workshop', value: 'PKEventTypeWorkshop' },
  { title: 'Social Gathering', value: 'PKEventTypeSocialGathering' },
  { title: 'Live Performance', value: 'PKEventTypeLivePerformance' },
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
    fetchLatestLogs();
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
    //also load the access logs
    await fetchLatestLogs();

    await campaignStore.fetchCampaignStatistics(
      campaignStore.selectedEvent.eventGuid,
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
    //fetch the campaign by campaign guid
    console.log("fetching campaign details for campaignGuid", campaignGuid);
    await campaignStore.fetchCampaignByCampaignGuid(campaignGuid);
    campaign.value = campaignStore.campaign;
    campaignType.value = campaign.value?.styleSettings.type;

    //if campaign type is stamp, select the first event
    if (campaignType.value === 'stamp') {
      campaignStore.selectedEvent = campaignStore.events[0];
      console.log("selectedEvent", campaignStore.selectedEvent);
    }

    //if campaign type is membership, select the first event
    if (campaignType.value === 'membership') {
      campaignStore.selectedEvent = campaignStore.events[0];
      console.log("selectedEvent", campaignStore.selectedEvent);
    }
    
    console.log("fetching campaign statistics for campaignGuid", campaignGuid);
    await campaignStore.fetchCampaignStatistics(campaignStore.selectedEvent.eventGuid, campaignGuid);
    statistics.value = campaignStore.statistics

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
      campaignStore.selectedEvent.eventGuid,
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

    const logs = await campaignStore.fetchDailyLog(
      campaignGuid,
      campaignStore.selectedEvent.eventGuid,
      'access',
      startDate.value,
      endDate.value
    );

    accessLogsData.value = logs.map(log => ({
      eventName: log.eventName,
      eventDescription: log.eventDescription,
      name: log.customerName,
      date: new Date(log.createdAt),
      serialNumber: log.serialNumber,
      passValue: log.passValue || 0 // Default to 0 if passValue is undefined
    }));

  } catch (error) {
    console.error('Error fetching daily logs:', error);
    showSnackbar('Failed to fetch access logs, event not selected', 'error');
  }
};

onMounted(() => {
  fetchCampaignDetails(campaignGuid);
  //fetchStatistics();
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
      campaignCampaignGuid: campaignGuid, // Ensure campaignGuid is included directly here as well
      additionalData: JSON.stringify({
        timezone: newEvent.value.timezone
      })
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
        eventEndDt: new Date().toISOString().slice(0, 10),
        timezone: '(GMT-08:00) Pacific Time (US & Canada)'
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

const uploadImages = async (): Promise<EventImages> => {
  const images: EventImages = {};
  
  try {
    isUploading.value = true;
    
    // Only upload artwork if a new file was selected
    if (artworkFile.value) {
      const formData = new FormData();
      formData.append('file', artworkFile.value);
      const response = await $wallyApi('/photo', {
        method: 'POST',
        body: formData,
      });
      images.artworkUrl = response.url;
    } else if (artworkPreview.value) {
      // If no new file but preview exists, use the existing URL
      images.artworkUrl = artworkPreview.value;
    }

    // Only upload venue map if a new file was selected
    if (venueMapFile.value) {
      const formData = new FormData();
      formData.append('file', venueMapFile.value);
      const response = await $wallyApi('/photo', {
        method: 'POST',
        body: formData,
      });
      images.venueMapUrl = response.url;
    } else if (venueMapPreview.value) {
      // If no new file but preview exists, use the existing URL
      images.venueMapUrl = venueMapPreview.value;
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    showSnackbar('Failed to upload images', 'error');
  } finally {
    isUploading.value = false;
  }

  return images;
};

const updateEvent = async () => {
  if (!editingEvent.value) {
    showSnackbar('No event selected', 'error');
    return;
  }

  if (!editingEvent.value.eventName || !editingEvent.value.eventDescription) {
    showSnackbar('Please fill in all required fields', 'error');
    return;
  }

  try {
    isEditingEvent.value = true;
    
    // Upload images and get URLs (only uploads changed images)
    const images = await uploadImages();
    
    // Combine date and time for start and end dates
    const startDateTime = new Date(editingEvent.value.eventBeginDt);
    const [startHours, startMinutes] = eventBeginTime.value.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
    
    const endDateTime = new Date(editingEvent.value.eventEndDt);
    const [endHours, endMinutes] = eventEndTime.value.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));
    
    const formattedEvent = {
      ...editingEvent.value,
      eventBeginDt: startDateTime.toISOString(),
      eventEndDt: endDateTime.toISOString(),
      additionalData: JSON.stringify({
        additionalInfoFields: additionalFields.value,
        semantics: eventSemantics.value,
        timezone: eventTimezone.value,
        images: {
          artworkUrl: images.artworkUrl,
          venueMapUrl: images.venueMapUrl
        }
      })
    };
    
    await campaignStore.updateEvent(campaignGuid, editingEvent.value.eventGuid, formattedEvent);
    
    showSnackbar('Event updated successfully', 'success');
    closeModal();
    await fetchEvents();
  } catch (error) {
    console.error('Error updating event:', error);
    showSnackbar('Failed to update event', 'error');
  } finally {
    isEditingEvent.value = false;
  }
};

// Add a watch to handle modal closing
watch(isEditEventModalOpen, (newValue) => {
  if (!newValue) {
    // Reset states when modal is closed
    editingEvent.value = null;
    isEditingEvent.value = false;
    additionalFields.value = [];
  }
});

const closeModal = () => {
  isEditEventModalOpen.value = false;
  editingEvent.value = null;
  isEditingEvent.value = false;
  additionalFields.value = [];
};

// Add step management functions
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Add the delete guest function
const handleDeleteGuest = (guest: any) => {
  console.log('Guest to delete:', guest);
  guestToDelete.value = guest;
  isDeleteGuestDialogOpen.value = true;
};

const closeDeleteGuestDialog = () => {
  isDeleteGuestDialogOpen.value = false;
  guestToDelete.value = null;
};

const deleteGuestConfirm = async () => {
  if (!guestToDelete.value || !campaignStore.selectedEvent) return;

  try {
    await campaignStore.deleteEventGuest(
      campaignStore.selectedEvent.eventGuid,
      guestToDelete.value.id
    );
    
    showSnackbar('Guest deleted successfully', 'success');
    await fetchEventGuests(campaignStore.selectedEvent.eventGuid);
  } catch (error) {
    console.error('Error deleting guest:', error);
    showSnackbar('Failed to delete guest', 'error');
  } finally {
    closeDeleteGuestDialog();
  }
};

// Add these functions after other functions
const handleArtworkDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file && file.type.startsWith('image/')) {
    artworkFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      artworkPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleVenueMapDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file && file.type.startsWith('image/')) {
    venueMapFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      venueMapPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleArtworkInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && file.type.startsWith('image/')) {
    artworkFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      artworkPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleVenueMapInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && file.type.startsWith('image/')) {
    venueMapFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      venueMapPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Add these refs at the top with other refs
const isEditGuestModalOpen = ref(false);
const editingGuest = ref<Guest | null>(null);
const isEditingGuest = ref(false);

const additionalInfoFields = ref<{ key: string; value: string }[]>([]);

const addAdditionalInfoField = () => {
  additionalInfoFields.value.push({ key: '', value: '' });
};

const removeAdditionalInfoField = (index: number) => {
  additionalInfoFields.value.splice(index, 1);
};

const handleEditGuest = (guest: any) => {
  editingGuest.value = {
    ...guest,
    phonenumber: guest.phone || '',
    ticketType: guest.ticketType || '',
    ticketNumber: guest.ticketNumber || '',
    seatInfo: guest.seatInfo || '',
  };

  // Parse and set additional info fields
  try {
    const additionalInfo = typeof guest.additionalInfo === 'string' 
      ? JSON.parse(guest.additionalInfo)
      : guest.additionalInfo || {};
    
    // Convert the additionalInfo object to array of key-value pairs
    additionalInfoFields.value = Object.entries(additionalInfo).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  } catch (error) {
    console.error('Error parsing additionalInfo:', error);
    additionalInfoFields.value = [];
  }

  isEditGuestModalOpen.value = true;
};

const closeEditGuestModal = () => {
  isEditGuestModalOpen.value = false;
  editingGuest.value = null;
  isEditingGuest.value = false;
  additionalInfoFields.value = [];
};

const updateGuest = async () => {
  if (!editingGuest.value || !campaignStore.selectedEvent) {
    showSnackbar('No guest or event selected', 'error');
    return;
  }

  try {
    isEditingGuest.value = true;
    
    // Convert additional info fields to object
    const additionalInfo = additionalInfoFields.value.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    const guestData = {
      ...editingGuest.value,
      phone: editingGuest.value.phonenumber,
      eventGuid: campaignStore.selectedEvent.eventGuid,
      additionalInfo
    };
    
    await campaignStore.updateEventGuest(
      campaignStore.selectedEvent.eventGuid,
      editingGuest.value.id,
      guestData
    );
    
    showSnackbar('Guest updated successfully', 'success');
    await fetchEventGuests(campaignStore.selectedEvent.eventGuid);
    
    // Reset state after successful update
    editingGuest.value = null;
    isEditGuestModalOpen.value = false;
    isEditingGuest.value = false;
  } catch (error) {
    console.error('Error updating guest:', error);
    showSnackbar('Failed to update guest', 'error');
  } finally {
    isEditingGuest.value = false;
  }
};

const handleSendEmail = async (guest: any) => {
  if (!campaignStore.selectedEvent) {
    showSnackbar('No event selected', 'error');
    return;
  }

  try {
    await campaignStore.sendGuestEmail(campaignStore.selectedEvent.eventGuid, guest.id);
    showSnackbar('Email sent successfully', 'success');
  } catch (error) {
    console.error('Error sending email:', error);
    showSnackbar('Failed to send email', 'error');
  }
};

const searchQuery = ref('');

// Add this computed property to filter guests
const filteredGuests = computed(() => {
  if (!searchQuery.value) return campaignStore.eventGuests;
  
  const query = searchQuery.value.toLowerCase();
  return campaignStore.eventGuests.filter(guest => {
    return (
      guest.name?.toLowerCase().includes(query) ||
      guest.surname?.toLowerCase().includes(query) ||
      guest.email?.toLowerCase().includes(query)
    );
  });
});

// Add this computed property to check if analytics should be shown
const showAnalytics = computed(() => {
  return campaignStore.selectedEvent && startDate.value && endDate.value && accessLogsData.value.length > 0;
});

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
                {{ $t('Edit Digital Card') }}
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
        <span class="text-caption text-medium-emphasis d-block">
          {{ item.additionalData?.timezone || '(Local timezone)' }}
        </span>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
        <VBtn
          size="small"
          :color="campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'primary' : 'grey'"
          :variant="campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'flat' : 'tonal'"
          @click="handleEventChange(item)"
        >
          {{ campaignStore.selectedEvent?.eventGuid === item.eventGuid ? 'Selected' : 'Select' }}
        </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="handleEditEvent(item)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="secondary"
            :to="{ name: 'pages-events-show', params: { id: item.eventGuid }}"
          >
            <VIcon icon="tabler-eye" />
          </VBtn>
        </div>
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

      <!-- Add search field -->
      <VTextField
        v-model="searchQuery"
        prepend-inner-icon="tabler-search"
        placeholder="Search by name, surname, or email"
        class="mb-4"
        density="compact"
        clearable
        hide-details
      />

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
        :items="filteredGuests"
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
              @click="handleEditGuest(item)"
            >
              <VIcon icon="tabler-edit" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="success"
              :disabled="!item?.serialNumber"
              @click="item?.serialNumber ? $router.push(`/customer/${item?.serialNumber}`) : $event.preventDefault()"
              >
              <VIcon icon="tabler-share" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="success"
              :disabled="!item.email"
              @click="handleSendEmail(item)"
            >
              <VIcon icon="tabler-mail" />
            </VBtn>
            <VBtn
              icon
              variant="text"
              size="small"
              color="error"
              @click="handleDeleteGuest(item)"
            >
              <VIcon icon="tabler-trash" />
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>

  <!-- Stats and Charts Section -->
  <VRow class="mb-5" v-if="campaignType === 'event' || campaignType === 'membership'|| campaignType === 'stamp'">
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

  <VCard v-if="campaignType === 'membership' || campaignType === 'stamp'" class="modern-card mb-5">
    <VCardTitle class="pa-6">
      <div class="d-flex flex-wrap justify-space-between align-center gap-y-4">
        <h6 class="text-h6 mb-0">{{ campaignType === 'membership' ? 'Members' : 'Customers' }}</h6>
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
            <VCol cols="12" md="4">
              <VSelect
                v-model="newEvent.timezone"
                label="Timezone"
                :items="timezones"
                :menu-props="{ maxHeight: 300 }"
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
    :event-id="campaignStore.events[0]?.eventGuid"
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

  <!-- Edit Event Modal -->
  <VDialog
    v-model="isEditEventModalOpen"
    max-width="800"
    class="modern-modal"
    @click:outside="closeModal"
    persistent
  >
    <VCard v-if="editingEvent">
      <VCardTitle class="modal-header d-flex justify-space-between align-center">
        <span class="text-h6">Edit Event</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="closeModal"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      
      <VStepper v-model="currentStep" class="stepper-custom">
        <VStepperHeader>
          <VStepperItem
            :value="1"
            title="Basic Info"
            subtitle="Event Details"
          />
      <VDivider />
          <VStepperItem
            :value="2"
            title="Additional Info"
            subtitle="Event Information"
          />
          <VDivider />
          <VStepperItem
            :value="3"
            title="Event Semantics"
            subtitle="Event Details"
          />
        </VStepperHeader>

        <VStepperWindow>
          <VStepperWindowItem :value="1">
            <VCardText class="modal-body">
              <VForm>
              <VRow>
                  <VCol cols="12">
                  <VTextField
                      v-model="editingEvent.eventName"
                      label="Event Name"
                    required
                      :disabled="isEditingEvent"
                  />
                </VCol>
                  <VCol cols="12">
                    <VTextarea
                      v-model="editingEvent.eventDescription"
                      label="Event Description"
                      rows="3"
                    required
                      :disabled="isEditingEvent"
                  />
                </VCol>
                  <VCol cols="12" md="4">
                  <VTextField
                      v-model.number="editingEvent.capacity"
                      label="Capacity"
                      type="number"
                      min="1"
                    required
                      :disabled="isEditingEvent"
                  />
                </VCol>
                <VCol cols="12">
                    <div class="d-flex align-center mb-4">
                      <VIcon
                        icon="tabler-calendar-time"
                        color="primary"
                        class="me-2"
                      />
                      <h6 class="text-h6 mb-0">Event Schedule</h6>
                    </div>
                    
                    <!-- Add timezone selector -->
                    <VRow class="mb-4">
                      <VCol cols="12">
                        <VSelect
                          v-model="eventTimezone"
                          label="Timezone"
                          :items="timezones"
                          :menu-props="{ maxHeight: 300 }"
                          placeholder="Select Timezone"
                          variant="outlined"
                          density="comfortable"
                          :disabled="isEditingEvent"
                        />
                      </VCol>
                    </VRow>
                    
                    <VRow>
                      <VCol cols="12" md="6">
                        <div class="mb-4">
                          <div class="text-subtitle-2 mb-2">Start</div>
                          <VRow>
                            <VCol cols="12" md="6">
                  <VTextField
                                v-model="editingEvent.eventBeginDt"
                                label="Date"
                                type="date"
                                required
                                :disabled="isEditingEvent"
                    variant="outlined"
                                density="comfortable"
                  />
                </VCol>
                <VCol cols="12" md="6">
                              <VTextField
                                v-model="eventBeginTime"
                                label="Time"
                                type="time"
                                required
                                :disabled="isEditingEvent"
                    variant="outlined"
                                density="comfortable"
                  />
                </VCol>
                          </VRow>
                        </div>
                      </VCol>
                      <VCol cols="12" md="6">
                        <div class="mb-4">
                          <div class="text-subtitle-2 mb-2">End</div>
                          <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                                v-model="editingEvent.eventEndDt"
                                label="Date"
                    type="date"
                                required
                                :disabled="isEditingEvent"
                                variant="outlined"
                    density="comfortable"
                              />
                            </VCol>
                            <VCol cols="12" md="6">
                              <VTextField
                                v-model="eventEndTime"
                                label="Time"
                                type="time"
                                required
                                :disabled="isEditingEvent"
                    variant="outlined"
                                density="comfortable"
                  />
                </VCol>
              </VRow>
                        </div>
            </VCol>
                    </VRow>
                  </VCol>
                <VCol cols="12">
                    <div class="d-flex align-center mb-4">
                      <VIcon
                        icon="tabler-photo"
                        color="primary"
                        class="me-2"
                      />
                      <h6 class="text-h6 mb-0">Event Images</h6>
                    </div>
                    <VRow>
                      <VCol cols="12" md="6">
                        <div class="image-upload-container">
                          <div
                            class="drop-zone"
                            @dragover.prevent
                            @drop="handleArtworkDrop"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              class="file-input"
                              @change="handleArtworkInput"
                            />
                            <div class="upload-content">
                              <VIcon
                                icon="tabler-upload"
                                size="32"
                                color="primary"
                                class="mb-2"
                              />
                              <div class="text-subtitle-2 mb-1">Event Artwork</div>
                              <div class="text-caption text-medium-emphasis">
                                Drag & drop or click to upload
                              </div>
                            </div>
                            <div
                              v-if="artworkPreview"
                              class="image-preview"
                            >
                              <img
                                :src="artworkPreview"
                                alt="Event Artwork"
                                class="preview-image"
                              />
                              <VBtn
                                icon
                                variant="text"
                                color="error"
                                size="small"
                                class="remove-image"
                                @click="artworkPreview = null; artworkFile = null"
                              >
                                <VIcon icon="tabler-x" />
                              </VBtn>
                            </div>
                          </div>
                        </div>
                </VCol>
                      <VCol cols="12" md="6">
                        <div class="image-upload-container">
                          <div
                            class="drop-zone"
                            @dragover.prevent
                            @drop="handleVenueMapDrop"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              class="file-input"
                              @change="handleVenueMapInput"
                            />
                            <div class="upload-content">
                              <VIcon
                                icon="tabler-upload"
                                size="32"
                                color="primary"
                                class="mb-2"
                              />
                              <div class="text-subtitle-2 mb-1">Venue Map</div>
                              <div class="text-caption text-medium-emphasis">
                                Drag & drop or click to upload
                              </div>
                            </div>
                            <div
                              v-if="venueMapPreview"
                              class="image-preview"
                            >
                              <img
                                :src="venueMapPreview"
                                alt="Venue Map"
                                class="preview-image"
                              />
                              <VBtn
                                icon
                                variant="text"
                                color="error"
                                size="small"
                                class="remove-image"
                                @click="venueMapPreview = null; venueMapFile = null"
                              >
                                <VIcon icon="tabler-x" />
                              </VBtn>
                            </div>
                          </div>
                        </div>
                      </VCol>
                    </VRow>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VStepperWindowItem>

          <VStepperWindowItem :value="2">
            <VCardText class="modal-body">
              <div class="d-flex justify-space-between align-center mb-6">
                <div>
                  <h6 class="text-h6 mb-1">Additional Information</h6>
                  <p class="text-body-2 text-medium-emphasis">Add custom fields to display in the event pass</p>
                </div>
                <VBtn
                    color="primary"
                  prepend-icon="tabler-plus"
                  @click="addAdditionalField"
                  :disabled="isEditingEvent"
                >
                  Add Field
                </VBtn>
              </div>
              
              <VForm>
                <div v-if="!additionalFields.length" class="text-center py-8">
                  <VIcon
                    icon="tabler-info-circle"
                    size="48"
                    color="primary"
                    class="mb-4"
                  />
                  <h6 class="text-h6 mb-2">No Additional Fields</h6>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    Add custom fields to display additional information in the event pass
                  </p>
                  <VBtn
                    color="primary"
                    variant="tonal"
                    prepend-icon="tabler-plus"
                    @click="addAdditionalField"
                    :disabled="isEditingEvent"
                  >
                    Add Your First Field
                  </VBtn>
                </div>

                <div v-else>
                  <div v-for="(field, index) in additionalFields" :key="field.key" class="mb-6">
                    <VCard class="pa-4" variant="outlined">
                      <div class="d-flex justify-space-between align-center mb-4">
                        <div class="d-flex align-center">
                          <VIcon
                            icon="tabler-file-text"
                    color="primary"
                            class="me-2"
                          />
                          <h6 class="text-h6 mb-0">{{ field.label || 'Unnamed Field' }}</h6>
                        </div>
                        <VBtn
                          icon
                          variant="text"
                          color="error"
                          @click="removeAdditionalField(index)"
                          :disabled="isEditingEvent"
                        >
                          <VIcon icon="tabler-trash" />
                        </VBtn>
                      </div>
                      
                      <VRow>
                        <VCol cols="12" md="6">
                          <VTextField
                            v-model="field.label"
                            label="Field Label"
                            placeholder="e.g., Event Details, Dress Code"
                            :disabled="isEditingEvent"
                          />
                        </VCol>
                        <VCol cols="12">
                          <VTextarea
                            v-model="field.value"
                            label="Field Value"
                            rows="3"
                            placeholder="Enter the information to display"
                            :disabled="isEditingEvent"
                          />
                        </VCol>
                        <VCol cols="12">
                          <VSelect
                            v-model="field.dataDetectorTypes"
                            :items="[
                              { title: 'Phone Number', value: 'PKDataDetectorTypePhoneNumber' },
                              { title: 'Link', value: 'PKDataDetectorTypeLink' },
                              { title: 'Address', value: 'PKDataDetectorTypeAddress' },
                              { title: 'Calendar Event', value: 'PKDataDetectorTypeCalendarEvent' }
                            ]"
                            label="Data Detector Types"
                            multiple
                            chips
                            :disabled="isEditingEvent"
                            hint="Select data types to enable automatic detection in Apple Wallet"
                            persistent-hint
                  />
                </VCol>
              </VRow>
                    </VCard>
                  </div>
                </div>
              </VForm>
            </VCardText>
          </VStepperWindowItem>

          <VStepperWindowItem :value="3">
            <VCardText class="modal-body">
              <div class="d-flex justify-space-between align-center mb-6">
                <div>
                  <h6 class="text-h6 mb-1">Event Semantics</h6>
                  <p class="text-body-2 text-medium-emphasis">Configure event details for pass display</p>
                </div>
              </div>
              
              <VForm>
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="eventSemantics.eventLiveMessage"
                      label="Event Live Message"
                      placeholder="This event is going to start soon!"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VTextField
                      v-model="eventSemantics.eventAddress"
                      label="Event Address"
                      placeholder="123 Main St, Anytown, USA"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="eventSemantics.venueName"
                      label="Venue Name"
                      placeholder="Renaissance Business Bay Hotel"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="eventSemantics.entranceDescription"
                      label="Entrance Description"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model.number="eventSemantics.venueLocation.latitude"
                      label="Venue Latitude"
                      type="number"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model.number="eventSemantics.venueLocation.longitude"
                      label="Venue Longitude"
                      type="number"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="eventSemantics.directionsInformationURL"
                      label="Directions URL"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="eventSemantics.contactVenueWebsite"
                      label="Venue Website"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VSelect
                      v-model="eventSemantics.eventType"
                      label="Event Type"
                      :items="eventType"
                      :disabled="isEditingEvent"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VSelect
                      v-model="eventSemantics.performerNames"
                      label="Performers"
                      multiple
                      chips
                      :items="eventSemantics.performerNames"
                      :disabled="isEditingEvent"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
          </VStepperWindowItem>
        </VStepperWindow>
      </VStepper>

      <VCardActions class="modal-footer">
        <VSpacer />
        <VBtn
          v-if="currentStep > 1"
          variant="tonal"
          color="secondary"
          class="me-3"
          @click="prevStep"
          :disabled="isEditingEvent"
        >
          Previous
        </VBtn>
        <VBtn
          v-if="currentStep < totalSteps"
          color="primary"
          class="me-3"
          @click="nextStep"
          :disabled="isEditingEvent"
        >
          Next
        </VBtn>
        <VBtn
          v-if="currentStep === totalSteps"
          color="primary"
          @click="updateEvent"
          :loading="isEditingEvent"
          :disabled="isEditingEvent"
        >
          Update Event
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Delete Guest Dialog -->
  <VDialog
    v-model="isDeleteGuestDialogOpen"
    max-width="500px"
  >
    <VCard title="Delete Guest">
      <VCardText>
        Are you sure you want to delete this guest? This action cannot be undone.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="closeDeleteGuestDialog"
        >
          Cancel
        </VBtn>
        <VBtn
          color="error"
          variant="elevated"
          @click="deleteGuestConfirm"
          :loading="isLoading"
        >
          Delete
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isEditGuestModalOpen"
    max-width="800px"
    persistent
    class="modern-modal"
  >
    <VCard v-if="editingGuest" class="guest-edit-modal">
      <VCardTitle class="d-flex justify-space-between align-center pa-4">
        <div class="d-flex align-center">
          <VIcon icon="tabler-user-edit" color="primary" class="me-2" />
          <span class="text-h6">Edit Guest</span>
        </div>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="closeEditGuestModal"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VForm @submit.prevent="updateGuest">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField
                v-model="editingGuest.name"
                label="Name"
                required
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-user"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="editingGuest.surname"
                label="Surname"
                required
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-user"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="editingGuest.email"
                label="Email"
                type="email"
                required
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-mail"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="editingGuest.phonenumber"
                label="Phone Number"
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-phone"
              />
            </VCol>
            
            <!-- Ticket Information Section -->
            <VCol cols="12">
              <div class="section-header d-flex align-center mb-4">
                <VIcon icon="tabler-ticket" color="primary" class="me-2" />
                <h6 class="text-h6 mb-0">Ticket Information</h6>
              </div>
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="editingGuest.ticketType"
                label="Ticket Type"
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-ticket"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="editingGuest.ticketNumber"
                label="Ticket Number"
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-hash"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="editingGuest.seatInfo"
                label="Seat Information"
                :disabled="isEditingGuest"
                variant="outlined"
                density="comfortable"
                prepend-icon="tabler-chair-director"
              />
            </VCol>

            <!-- Additional Information Section -->
            <VCol cols="12">
              <div class="section-header d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <VIcon icon="tabler-info-circle" color="primary" class="me-2" />
                  <h6 class="text-h6 mb-0">Additional Information</h6>
                </div>
                <VBtn
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-plus"
                  @click="addAdditionalInfoField"
                  :disabled="isEditingGuest"
                >
                  Add Field
                </VBtn>
              </div>
            </VCol>

            <!-- Additional Info Fields -->
            <VCol cols="12">
              <VCard
                v-for="(field, index) in additionalInfoFields"
                :key="index"
                class="mb-4"
                variant="outlined"
              >
                <VCardText class="pa-4">
                  <VRow>
                    <VCol cols="12" md="5">
                      <VTextField
                        v-model="field.key"
                        label="Field Name"
                        :disabled="isEditingGuest"
                        variant="outlined"
                        density="comfortable"
                        prepend-icon="tabler-key"
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTextField
                        v-model="field.value"
                        label="Field Value"
                        :disabled="isEditingGuest"
                        variant="outlined"
                        density="comfortable"
                        prepend-icon="tabler-text"
                      />
                    </VCol>
                    <VCol cols="12" md="1" class="d-flex align-center">
                      <VBtn
                        icon
                        variant="text"
                        color="error"
                        @click="removeAdditionalInfoField(index)"
                        :disabled="isEditingGuest"
                      >
                        <VIcon icon="tabler-trash" />
                      </VBtn>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <VCol cols="12">
              <div class="d-flex justify-end gap-4 mt-4">
                <VBtn
                  color="error"
                  variant="text"
                  @click="closeEditGuestModal"
                  :disabled="isEditingGuest"
                >
                  Cancel
                </VBtn>
                <VBtn
                  color="primary"
                  type="submit"
                  :loading="isEditingGuest"
                  prepend-icon="tabler-check"
                >
                  Save Changes
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard v-if="showAnalytics" class="mt-4">
    <VCardTitle class="d-flex align-center">
      <VIcon icon="tabler-chart-bar" color="primary" class="me-2" />
      Event Analytics
    </VCardTitle>
    <VCardText>
      <EventAnalytics
        :access-logs-data="accessLogsData"
        :event-guests="campaignStore.eventGuests"
        :start-date="startDate"
        :end-date="endDate"
      />
    </VCardText>
  </VCard>
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
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.05);
  position: sticky;
  top: 0;
  z-index: 1;
}

.modal-body {
  padding: 2rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(var(--v-theme-primary), 0.05);
  position: sticky;
  bottom: 0;
  background: rgba(var(--v-theme-surface), 0.95);
  z-index: 1;
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

.stepper-custom {
  background: transparent !important;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.stepper-custom :deep(.v-stepper-header) {
  background: transparent !important;
  box-shadow: none !important;
  position: sticky;
  top: 0;
  z-index: 1;
}

.stepper-custom :deep(.v-stepper-window) {
  flex: 1;
  overflow-y: auto;
}

.stepper-custom :deep(.v-stepper-item) {
  padding: 1rem;
}

.stepper-custom :deep(.v-stepper-item__title) {
  font-size: 0.875rem;
  font-weight: 600;
}

.stepper-custom :deep(.v-stepper-item__subtitle) {
  font-size: 0.75rem;
  opacity: 0.7;
}

.image-upload-container {
  position: relative;
  width: 100%;
}

.drop-zone {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.02);
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  text-align: center;
  padding: 1rem;
}

.image-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface), 0.8);
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(var(--v-theme-surface), 0.9);
  border-radius: 50%;
}

.guest-edit-modal {
  border-radius: 12px;
}

.section-header {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  margin-bottom: 16px;
}

:deep(.v-field__prepend-inner) {
  padding-right: 8px;
}

:deep(.v-field__input) {
  padding-left: 8px;
}

:deep(.v-field--variant-outlined) {
  background: rgba(var(--v-theme-surface), 0.5);
}

:deep(.v-field--variant-outlined:hover) {
  background: rgba(var(--v-theme-surface), 0.8);
}

:deep(.v-field--variant-outlined:focus-within) {
  background: rgba(var(--v-theme-surface), 1);
}

:deep(.v-card--variant-outlined) {
  border-color: rgba(var(--v-border-color), 0.12);
  transition: all 0.3s ease;
}

:deep(.v-card--variant-outlined:hover) {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}
</style>