import { useConfigStore } from "@/@core/stores/config";
import { defineStore } from "pinia";
import { ref } from "vue";

interface Event {
  eventGuid: string;
  eventName: string;
  eventDescription: string;
  capacity?: number;
  eventBeginDt?: string;
  eventEndDt?: string;
  createdAt?: string;
  updatedAt?: string;
  campaign?: any;
  additionalData?: {
    images?: {
      artworkUrl?: string;
    };
    semantics?: {
      venueName?: string;
      eventAddress?: string;
      directionsInformationURL?: string;
    };
    additionalInfoFields?: Array<{
      key: string;
      label: string;
      value: string;
    }>;
  };
}

export const useCampaignStore = defineStore("campaign", () => {
  const campaigns = ref([]);
  const campaign = ref(null);
  const customers = ref([]);
  const statistics = ref({})
  const barchartStats = ref({})
  const events = ref<Event[]>([]);
  const selectedEvent = ref<Event | null>(null);
  const eventGuests = ref([]);
  const isLoadingGuests = ref(false);

  const fetchCampaigns = async () => {
    try {
      const response = await $wallyApi(`/campaign/merchant/`, { method: "GET" });
      campaigns.value = response.campaign || [];
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  const fetchCampaignStatistics = async (
    eventGuid: string,
    campaignGuid: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
  
      const url = `/v1/statistics/event/${eventGuid}/campaign/${campaignGuid}?${queryParams.toString()}`;
      const response = await $wallyApi(url, { method: "GET" });
      statistics.value = response?.data || {};
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };

  const fetchCampaignStatisticsMonthly = async (campaignGuid: string, startDate: string, endDate: string) => {
    try {
      const url = `/v1/statistics/${campaignGuid}/monthly?startDate=${startDate}&endDate=${endDate}`;
      const response = await $wallyApi(url, { method: "GET" });
      console.log("Fetched statistics:", response);
      barchartStats.value = response?.data || {};
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchCampaignByMerchantGuid = async (merchantGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/merchant/${merchantGuid}`, { method: "GET" });
      campaigns.value = response?.campaign_details || [];
    } catch (error) {
      console.error("Error fetching campaigns by merchant GUID:", error);
      throw error;
    }
  };

  const fetchCampaignByCampaignGuid = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}`, { method: "GET" });
      if (response?.campaign) {
        campaign.value = response.campaign;
      } else {
        campaign.value = null;
      }
      return response;
    } catch (error) {
      console.error("Error fetching campaign by campaign GUID:", error);
      throw error;
    }
  };

  const fetchCustomerByCampaignGuid = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}/customers`, { method: "GET" });
      if (response) {
        customers.value = response.customers;
      } else {
        customers.value = [];
      }
    } catch (error) {
      console.error("Error fetching customers by campaign GUID:", error);
      throw error;
    }
  };

  const fetchPassValue = async (
    campaignGuid: string,
    startDate: string,
    endDate: string,
    campaignType: string,
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("type", campaignType);
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
  
      const url = `/pass-value/campaigId/${campaignGuid}?${queryParams.toString()}`;
      const response = await $wallyApi(url, { method: "GET" });
      return response;
    } catch (error) {
      console.error("Error fetching pass value:", error);
      throw error;
    }
  };

  const addCampaign = async (campaignData) => {
    try {
      const response = await $wallyApi("/campaigns", {
        method: "POST",
        body: campaignData,
      });
      campaigns.value.push(response?.data);
    } catch (error) {
      throw error;
    }
  };

  const deleteCampaign = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/campaigns/${campaignGuid}`, { method: "DELETE" });
      if (response.status === 'success') {
        campaigns.value = campaigns.value.filter((c) => c.campaignGuid !== campaignGuid);
      } else {
        throw new Error(response.message || 'Failed to delete the campaign');
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      throw error;
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await $wallyApi(`/campaigns/${id}`, {
        method: "PATCH",
        body: campaignData,
      });
      const index = campaigns.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        campaigns.value[index] = response.data;
      }
    } catch (error) {
      console.error("Failed to update campaign:", error);
      throw error;
    }
  };

  const fetchEvents = async (campaignGuid: string) => {
    try {
      const response = await $wallyApi(`/events/campaign/${campaignGuid}`, { method: "GET" });
      console.log('Raw events response:', response);
      
      // Handle different response structures
      if (response) {
        if (Array.isArray(response)) {
          events.value = response;
        } else if (typeof response === 'object') {
          // If it's a single event object
          if (response.eventGuid && response.eventName) {
            events.value = [response];
          } 
          // If events might be nested inside the response
          else if (response.events && Array.isArray(response.events)) {
            events.value = response.events;
          }
          // For any other structure, try to find the first array or relevant data
          else {
            const potentialEvents = Object.values(response).find(val => Array.isArray(val));
            if (potentialEvents) {
              events.value = potentialEvents;
            } else {
              events.value = [];
            }
          }
        } else {
          events.value = [];
        }
      } else {
        events.value = [];
      }
      
      console.log('Processed events:', events.value);
      
      // Make sure eventName is available for all events
      events.value.forEach((event, index) => {
        if (!event.eventName && event.eventGuid) {
          console.log(`Event ${index} is missing eventName:`, event);
        }
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      events.value = [];
      throw error;
    }
  };

  const fetchEventByGuid = async (eventGuid: string) => {
    try {
      console.log('Fetching event by GUID:', eventGuid);
      const response = await $wallyApi(`/events/${eventGuid}`, { method: "GET" });
      console.log('Raw event response:', response);

      if (!response || response.status !== 'success') {
        console.error('Invalid response received from API:', response);
        selectedEvent.value = null;
        return null;
      }

      // Extract event data from the nested structure
      const eventData = response.events;
      if (!eventData || !eventData.eventGuid || !eventData.eventName) {
        console.error('Invalid event data structure:', eventData);
        selectedEvent.value = null;
        return null;
      }

      // Transform the response to match our Event interface
      const event: Event = {
        eventGuid: eventData.eventGuid,
        eventName: eventData.eventName,
        eventDescription: eventData.eventDescription || '',
        capacity: eventData.capacity,
        eventBeginDt: eventData.eventBeginDt,
        eventEndDt: eventData.eventEndDt,
        createdAt: eventData.createdAt,
        updatedAt: eventData.updatedAt,
        campaign: eventData.campaign,
        additionalData: eventData.additionalData || {},
      };

      selectedEvent.value = event;
      return event;
    } catch (error) {
      console.error("Error fetching event by GUID:", error);
      selectedEvent.value = null;
      throw error;
    }
  };

  const setSelectedEvent = (event: Event | null) => {
    selectedEvent.value = event;
  };

  // Update the function to create an event with campaignGuid
  const createEvent = async (campaignGuid: string, eventData: any) => {
    try {
      // Add campaign GUID to the event data
      const eventDataWithCampaign = {
        ...eventData,
        campaignGuid: campaignGuid // Explicitly set campaignGuid for the event
      };
      
      console.log('Creating event with data:', eventDataWithCampaign);
      
      const response = await $wallyApi('/events', {
        method: 'POST',
        body: eventDataWithCampaign
      });
      
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (campaignGuid: string, eventGuid: string, eventData: any) => {
    try {
      const response = await $wallyApi(`/events/${eventGuid}`, {
        method: "PATCH",
        body: eventData,
      });
      return response;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const createGuest = async (eventGuid: string, guestData: any) => {
    try {
      const response = await $wallyApi(`/event-tickets/guest/${eventGuid}`, {
        method: "POST",
        body: guestData,
      });
      
      return response;
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  };

  // Function to fetch guests for an event
  const fetchEventGuests = async (eventGuid: string) => {
    try {
      isLoadingGuests.value = true;
      const response = await $wallyApi(`/events/${eventGuid}/guests`, { method: "GET" });
      console.log('Event guests response:', response);
      eventGuests.value = Array.isArray(response) ? response : [];
      console.log('Event guests:', eventGuests.value);
      return eventGuests.value;
    } catch (error) {
      console.error('Error fetching event guests:', error);
      eventGuests.value = [];
      throw error;
    } finally {
      isLoadingGuests.value = false;
    }
  };

  const fetchDailyLog = async (campaignGuid: string, type: string, startDate: string, endDate: string) => {
    try {
      const response = await $wallyApi(`/pass-value/campaigId/${campaignGuid}?type=${type}&startDate=${startDate}&endDate=${endDate}`, { method: "GET" });
      console.log('Daily log response:', response);
      return response;
    } catch (error) {
      console.error("Error fetching daily log:", error);
      throw error;
    }
  };

  const deleteEventGuest = async (eventGuid: string, guestGuid: string) => {
    try {
      const response = await $wallyApi(`/event-tickets/guest/${eventGuid}/${guestGuid}`, { method: "DELETE" });
      return response;
    } catch (error) {
      console.error("Error deleting event guest:", error);  
      throw error;
    }
  };

  const updateEventGuest = async (eventGuid: string, guestGuid: string, guestData: any) => {
    try {
      const response = await $wallyApi(`/event-tickets/guest/${eventGuid}/${guestGuid}`, {
        method: "PATCH",
        body: guestData,
      });
      return response;
    } catch (error) {
      console.error("Error updating event guest:", error);
      throw error;
    }
  };

  const sendGuestEmail = async (eventGuid: string, guestGuid: string) => {
    try {
      const response = await $wallyApi(`/event-tickets/send-email/${eventGuid}/${guestGuid}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error sending guest email:', error);
      throw error;
    }
  };

  return {
    campaigns,
    campaign,
    customers,
    statistics,
    barchartStats,
    events,
    selectedEvent,
    eventGuests,
    isLoadingGuests,
    fetchCampaignByMerchantGuid,
    fetchCampaignByCampaignGuid,
    fetchCustomerByCampaignGuid,
    addCampaign,
    deleteCampaign,
    updateCampaign,
    fetchCampaignStatistics,
    fetchCampaignStatisticsMonthly,
    fetchPassValue,
    fetchEvents,
    setSelectedEvent,
    createEvent,
    fetchEventGuests,
    createGuest,
    fetchDailyLog,
    updateEvent,
    deleteEventGuest,
    updateEventGuest,
    sendGuestEmail,
    fetchEventByGuid,
  };
});
