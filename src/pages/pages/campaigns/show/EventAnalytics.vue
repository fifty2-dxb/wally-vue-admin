<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { hexToRgb } from '@layouts/utils';

const props = defineProps<{
  accessLogsData: any[];
  eventGuests: any[];
  startDate: string;
  endDate: string;
}>();

const vuetifyTheme = useTheme();

// Computed values for analytics
const totalGuests = computed(() => props.eventGuests.length);
const successfulEntries = computed(() => props.accessLogsData.filter(log => log.passValue === 1).length);
const deniedEntries = computed(() => props.accessLogsData.filter(log => log.passValue === 0).length);
const successRate = computed(() => (successfulEntries.value / totalGuests.value * 100).toFixed(1));

// Time-based analytics
const hourlyDistribution = computed(() => {
  const distribution = new Array(24).fill(0);
  props.accessLogsData.forEach(log => {
    const hour = new Date(log.date).getHours();
    distribution[hour]++;
  });
  return distribution;
});

const peakHour = computed(() => {
  const max = Math.max(...hourlyDistribution.value);
  return hourlyDistribution.value.indexOf(max);
});

// Chart options for hourly distribution
const hourlyChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors;
  return {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
      },
    },
    colors: [`rgba(${hexToRgb(currentTheme.primary)}, 1)`],
    dataLabels: { enabled: false },
    xaxis: {
      categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Guests',
      },
    },
  };
});

const hourlyChartSeries = computed(() => [{
  name: 'Guests',
  data: hourlyDistribution.value,
}]);

// Daily trend
const dailyDistribution = computed(() => {
  const distribution = new Map();
  props.accessLogsData.forEach(log => {
    const date = new Date(log.date).toLocaleDateString();
    distribution.set(date, (distribution.get(date) || 0) + 1);
  });
  return {
    dates: Array.from(distribution.keys()),
    counts: Array.from(distribution.values()),
  };
});

const dailyChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors;
  return {
    chart: {
      type: 'line',
      height: 250,
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: [`rgba(${hexToRgb(currentTheme.success)}, 1)`],
    markers: {
      size: 4,
    },
    xaxis: {
      categories: dailyDistribution.value.dates,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Guests',
      },
    },
  };
});

const dailyChartSeries = computed(() => [{
  name: 'Daily Guests',
  data: dailyDistribution.value.counts,
}]);

// Add new computed properties for comparison analysis
const registeredGuests = computed(() => props.eventGuests.length);
const actualAttendees = computed(() => {
  const uniqueAttendees = new Set(props.accessLogsData
    .filter(log => log.passValue === 1)
    .map(log => log.name));
  return uniqueAttendees.size;
});

const noShows = computed(() => registeredGuests.value - actualAttendees.value);
const attendanceRate = computed(() => 
  ((actualAttendees.value / registeredGuests.value) * 100).toFixed(1)
);

// Add comparison chart options
const comparisonChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors;
  return {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: ['Attended', 'No Shows'],
    colors: [
      `rgba(${hexToRgb(currentTheme.success)}, 1)`,
      `rgba(${hexToRgb(currentTheme.error)}, 1)`,
    ],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
            },
            total: {
              show: true,
              label: 'Total',
              formatter: () => registeredGuests.value.toString(),
            },
          },
        },
      },
    },
  };
});

const comparisonChartSeries = computed(() => [
  actualAttendees.value,
  noShows.value,
]);

// Add new computed property for no-shows list
const noShowsList = computed(() => {
  // Get list of attendees from access logs
  const attendees = new Set(
    props.accessLogsData
      .filter(log => log.passValue === 1)
      .map(log => log.name)
  );

  // Filter registered guests who didn't attend
  return props.eventGuests.filter(guest => {
    const guestName = `${guest.name} ${guest.surname}`.trim();
    return !attendees.has(guestName);
  });
});
</script>

<template>
  <VRow>
    <!-- Summary Cards -->
    <VCol cols="12" md="3">
      <VCard>
        <VCardText class="d-flex flex-column align-center">
          <h4 class="text-h4 mb-1">{{ totalGuests }}</h4>
          <span class="text-caption">Total Guests</span>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="3">
      <VCard>
        <VCardText class="d-flex flex-column align-center">
          <h4 class="text-h4 mb-1">{{ successfulEntries }}</h4>
          <span class="text-caption">Successful Entries</span>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="3">
      <VCard>
        <VCardText class="d-flex flex-column align-center">
          <h4 class="text-h4 mb-1">{{ deniedEntries }}</h4>
          <span class="text-caption">Denied Entries</span>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="3">
      <VCard>
        <VCardText class="d-flex flex-column align-center">
          <h4 class="text-h4 mb-1">{{ successRate }}%</h4>
          <span class="text-caption">Success Rate</span>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Comparison Analysis -->
    <VCol cols="12" md="6">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-users" color="primary" class="me-2" />
          Guest Attendance Analysis
          <VSpacer />
          <VChip color="primary" size="small">
            {{ attendanceRate }}% Attendance Rate
          </VChip>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <VueApexCharts
                :options="comparisonChartOptions"
                :series="comparisonChartSeries"
                height="300"
              />
            </VCol>
            <VCol cols="12" md="6" class="d-flex flex-column justify-center">
              <div class="mb-4">
                <h4 class="text-h4 mb-1">{{ registeredGuests }}</h4>
                <span class="text-caption">Total Registered Guests</span>
              </div>
              <div class="mb-4">
                <h4 class="text-h4 mb-1 text-success">{{ actualAttendees }}</h4>
                <span class="text-caption">Actual Attendees</span>
              </div>
              <div>
                <h4 class="text-h4 mb-1 text-error">{{ noShows }}</h4>
                <span class="text-caption">No Shows</span>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- No Shows List -->
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-user-x" color="error" class="me-2" />
          No Shows List
          <VSpacer />
          <VChip color="error" size="small">
            {{ noShowsList.length }} Guests
          </VChip>
        </VCardTitle>
        <VCardText>
          <VDataTable
            :headers="[
              { title: 'Name', key: 'name' },
              { title: 'Surname', key: 'surname' },
              { title: 'Email', key: 'email' },
              { title: 'Ticket Type', key: 'ticketType' },
              { title: 'Ticket Number', key: 'ticketNumber' },
            ]"
            :items="noShowsList"
            :items-per-page="10"
            density="comfortable"
          >
            <template #item.name="{ item }">
              {{ item.name }}
            </template>
            <template #item.surname="{ item }">
              {{ item.surname }}
            </template>
            <template #item.email="{ item }">
              {{ item.email }}
            </template>
            <template #item.ticketType="{ item }">
              {{ item.ticketType || 'N/A' }}
            </template>
            <template #item.ticketNumber="{ item }">
              {{ item.ticketNumber || 'N/A' }}
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Hourly Distribution Chart -->
    <VCol cols="12" md="6">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-clock" color="primary" class="me-2" />
          Hourly Guest Distribution
          <VSpacer />
          <VChip color="primary" size="small">
            Peak Hour: {{ peakHour }}:00
          </VChip>
        </VCardTitle>
        <VCardText>
          <VueApexCharts
            :options="hourlyChartOptions"
            :series="hourlyChartSeries"
            height="250"
          />
        </VCardText>
      </VCard>
    </VCol>

    <!-- Daily Trend Chart -->
    <VCol cols="12" md="6">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-chart-line" color="success" class="me-2" />
          Daily Guest Trend
        </VCardTitle>
        <VCardText>
          <VueApexCharts
            :options="dailyChartOptions"
            :series="dailyChartSeries"
            height="250"
          />
        </VCardText>
      </VCard>
    </VCol>

    <!-- Detailed Activity Log -->
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="tabler-list" color="primary" class="me-2" />
          Detailed Activity Log
        </VCardTitle>
        <VCardText>
          <VDataTable
            :headers="[
              { title: 'Time', key: 'date', sortable: true },
              { title: 'Guest', key: 'name' },
              { title: 'Status', key: 'passValue' },
            ]"
            :items="accessLogsData"
            :items-per-page="10"
          >
            <template #item.date="{ item }">
              {{ new Date(item.date).toLocaleString() }}
            </template>
            <template #item.passValue="{ item }">
              <VChip
                :color="item.passValue === 1 ? 'success' : 'error'"
                size="small"
              >
                {{ item.passValue === 1 ? 'Granted' : 'Denied' }}
              </VChip>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table-header {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-data-table-row:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style> 