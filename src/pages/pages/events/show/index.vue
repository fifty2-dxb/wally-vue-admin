<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';

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

const route = useRoute();
const eventGuid = route.params.id as string;
const campaignStore = useCampaignStore();
const isLoading = ref(true);

const event = ref<Event | null>(null);
const registrationCount = ref(0);

const fetchEventDetails = async () => {
  try {
    isLoading.value = true;
    console.log('Fetching event details for eventGuid:', eventGuid);
    
    const eventData = await campaignStore.fetchEventByGuid(eventGuid);
    console.log('Received event data:', eventData);
    
    if (!eventData) {
      console.error('No event data received');
      event.value = null;
      return;
    }

    event.value = eventData;
    
    // Fetch guest count if needed
    if (event.value) {
      console.log('Fetching guest count for event:', event.value.eventGuid);
      const guests = await campaignStore.fetchEventGuests(event.value.eventGuid);
      registrationCount.value = guests?.length || 0;
      console.log('Guest count:', registrationCount.value);
    }
  } catch (error) {
    console.error('Error fetching event details:', error);
    event.value = null;
  } finally {
    isLoading.value = false;
  }
};

const formattedDate = computed(() => {
  const beginDate = event.value?.eventBeginDt;
  if (!beginDate) return '';
  
  const date = new Date(beginDate as string);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
});

const formattedTime = computed(() => {
  const beginDate = event.value?.eventBeginDt;
  const endDate = event.value?.eventEndDt;
  if (!beginDate || !endDate) return '';
  
  const startTime = new Date(beginDate as string);
  const endTime = new Date(endDate as string);
  
  return `${startTime.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  })} - ${endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`;
});

const handleRegister = () => {
  // Implement registration logic
  console.log('Register clicked');
};

const handleShare = () => {
  // Implement share logic
  console.log('Share clicked');
};

onMounted(() => {
  fetchEventDetails();
});
</script>

<template>
  <VCard v-if="event" class="event-details-card">
    <!-- Event Header -->
    <div class="event-header">
      <div class="event-cover" :style="{ backgroundImage: 'url(' + (event.additionalData?.images?.artworkUrl || '/images/event-default.jpg') + ')' }">
        <div class="event-overlay">
          <VContainer>
            <VRow>
              <VCol cols="12" md="8">
                <div class="event-meta">
                  <div class="date-badge" v-if="event.eventBeginDt">
                    <span class="month">{{ new Date(event.eventBeginDt as string).toLocaleString('default', { month: 'short' }) }}</span>
                    <span class="day">{{ new Date(event.eventBeginDt as string).getDate() }}</span>
                  </div>
                  <h1 class="event-title text-h3 font-weight-bold text-white mb-4">
                    {{ event.eventName }}
                  </h1>
                  <div class="event-info d-flex align-center flex-wrap gap-4">
                    <div class="info-item" v-if="formattedDate">
                      <VIcon icon="tabler-calendar" color="white" class="me-2" />
                      <span>{{ formattedDate }}</span>
                    </div>
                    <div class="info-item" v-if="formattedTime">
                      <VIcon icon="tabler-clock" color="white" class="me-2" />
                      <span>{{ formattedTime }}</span>
                    </div>
                    <div class="info-item">
                      <VIcon icon="tabler-map-pin" color="white" class="me-2" />
                      <span>{{ event.additionalData?.semantics?.venueName || 'Online Event' }}</span>
                    </div>
                  </div>
                </div>
              </VCol>
              <VCol cols="12" md="4" class="d-flex align-center justify-end">
                <div class="action-buttons">
                  <VBtn
                    color="primary"
                    size="x-large"
                    class="register-btn"
                    @click="handleRegister"
                  >
                    Register Now
                  </VBtn>
                  <VBtn
                    variant="outlined"
                    color="white"
                    size="x-large"
                    class="share-btn mt-4"
                    @click="handleShare"
                  >
                    <VIcon icon="tabler-share" class="me-2" />
                    Share Event
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VContainer>
        </div>
      </div>
    </div>

    <!-- Event Content -->
    <VContainer class="event-content py-8">
      <VRow>
        <VCol cols="12" md="8">
          <!-- Event Description -->
          <VCard class="mb-6" variant="flat">
            <VCardTitle class="text-h5 font-weight-bold pb-4">
              About This Event
            </VCardTitle>
            <VCardText class="text-body-1">
              {{ event.eventDescription }}
            </VCardText>
          </VCard>

          <!-- Additional Information -->
          <VCard v-if="event.additionalData?.additionalInfoFields?.length" variant="flat">
            <VCardTitle class="text-h5 font-weight-bold pb-4">
              Additional Information
            </VCardTitle>
            <VCardText>
              <div v-for="field in event.additionalData.additionalInfoFields" :key="field.key" class="mb-4">
                <h3 class="text-h6 font-weight-medium mb-2">{{ field.label }}</h3>
                <p class="text-body-1">{{ field.value }}</p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <!-- Event Details Sidebar -->
          <VCard class="event-sidebar" variant="outlined">
            <VCardText>
              <!-- Date & Time -->
              <div class="sidebar-section">
                <h3 class="text-h6 font-weight-bold mb-4">
                  <VIcon icon="tabler-calendar-event" color="primary" class="me-2" />
                  Date and Time
                </h3>
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-medium">{{ formattedDate }}</div>
                  <div class="text-body-1">{{ formattedTime }}</div>
                </div>
              </div>

              <VDivider class="my-4" />

              <!-- Location -->
              <div class="sidebar-section">
                <h3 class="text-h6 font-weight-bold mb-4">
                  <VIcon icon="tabler-map-pin" color="primary" class="me-2" />
                  Location
                </h3>
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ event.additionalData?.semantics?.venueName || 'Online Event' }}
                  </div>
                  <div class="text-body-1">
                    {{ event.additionalData?.semantics?.eventAddress || 'Virtual Meeting' }}
                  </div>
                </div>
                <VBtn
                  v-if="event.additionalData?.semantics?.directionsInformationURL"
                  color="primary"
                  variant="tonal"
                  block
                  :href="event.additionalData.semantics.directionsInformationURL"
                  target="_blank"
                >
                  Get Directions
                </VBtn>
              </div>

              <VDivider class="my-4" />

              <!-- Registration Info -->
              <div class="sidebar-section">
                <h3 class="text-h6 font-weight-bold mb-4">
                  <VIcon icon="tabler-users" color="primary" class="me-2" />
                  Registration
                </h3>
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1">Registered</div>
                  <div class="text-h6 font-weight-bold">{{ registrationCount }}</div>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <div class="text-subtitle-1">Capacity</div>
                  <div class="text-h6 font-weight-bold">{{ event.capacity || 'Unlimited' }}</div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </VCard>

  <!-- Loading State -->
  <VCard v-else-if="isLoading" class="pa-4">
    <VSkeletonLoader
      type="article"
      class="mb-4"
    />
  </VCard>

  <!-- Error State -->
  <VCard v-else class="pa-4">
    <VAlert
      type="error"
      title="Error"
      text="Unable to load event details"
    />
  </VCard>
</template>

<style scoped>
.event-details-card {
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.event-header {
  position: relative;
  margin: 0;
  width: 100%;
}

.event-cover {
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
  width: 100%;
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  padding: 64px 0 48px;
  display: flex;
  align-items: flex-end;
}

.event-meta {
  color: white;
  max-width: 800px;
}

.date-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: rgba(var(--v-theme-primary), 1);
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.date-badge .month {
  font-size: 16px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
}

.date-badge .day {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-top: 4px;
}

.event-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px !important;
  line-height: 1.2;
}

.info-item {
  display: flex;
  align-items: center;
  color: white;
  font-size: 1.1rem;
  margin-right: 32px;
}

.info-item .v-icon {
  margin-right: 12px !important;
  opacity: 0.9;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 16px;
}

.register-btn {
  min-width: 220px;
  height: 52px;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.share-btn {
  border: 2px solid white;
  min-width: 220px;
  height: 52px;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  margin-top: 16px !important;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
}

.event-content {
  max-width: 1200px;
  margin: 0 auto;
}

.event-sidebar {
  position: sticky;
  top: 24px;
  border-radius: 12px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

@media (max-width: 959px) {
  .event-cover {
    min-height: 500px;
  }

  .event-overlay {
    padding: 48px 0 32px;
  }

  .action-buttons {
    margin-top: 40px;
    align-items: center;
  }

  .event-title {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 599px) {
  .event-cover {
    min-height: 400px;
  }

  .event-overlay {
    padding: 32px 0 24px;
  }

  .event-title {
    font-size: 2rem !important;
  }

  .info-item {
    font-size: 0.9rem;
    margin-right: 24px;
    margin-bottom: 12px;
  }

  .date-badge {
    padding: 10px 16px;
    margin-bottom: 24px;
  }

  .register-btn,
  .share-btn {
    min-width: 100%;
    height: 48px;
  }
}
</style> 