<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import {useCustomerStore} from '@/stores/customer';  // Import the store
const router = useRouter()

const route = useRoute('pages-customers-show')

const customerStore = useCustomerStore()
const fetchCustomerDetails = async (customerId: string) => {
  try {
    await customerStore.fetchCustomerById(customerId);
  } catch (error) {
    console.error('Error fetching customer:', error);
  }
};

onMounted(() => {
  // Convert route.params.id to string if it exists
  const customerId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (customerId) {
    fetchCustomerDetails(customerId);
  }
})

</script>
<template>
  <div class="page-header mb-6">
    <div class="d-flex justify-space-between align-center">
      <div>
        <h4 class="text-h4 font-weight-medium mb-2">
          {{ customerStore.customer.customers_details.name }} {{ customerStore.customer.customers_details.surname }}
        </h4>
        <div class="text-body-1 text-medium-emphasis">
          {{ customerStore.customer.customers_details.email }}
        </div>
      </div>
      <VBtn
        color="primary"
        prepend-icon="tabler-dots-vertical"
        variant="tonal"
      >
        {{ $t("Actions") }}
      </VBtn>
    </div>
  </div>

  <VRow>
    <!-- Left Column -->
    <VCol md="4" sm="12">
      <!-- Stamp Card Section -->
      <VCard 
        v-if="customerStore.customer.type === 'stamp'"
        class="modern-card mb-6"
      >
        <v-img 
          :src="customerStore.customer.stampImageUrl"
          class="stamp-image"
        />
        <VCardActions class="pa-4 d-flex gap-2">
          <VBtn
            block
            :color="customerStore.customer.redeemable ? 'grey' : 'success'"
            @click="customerStore.stamp(1)"
            :loading="customerStore.stamping"
            :disabled="customerStore.customer.redeemable"
            prepend-icon="tabler-rubber-stamp"
          >
            {{ $t("Stamp") }}
          </VBtn>
          <VBtn
            block
            :color="customerStore.customer.redeemable ? 'grey' : 'error'"
            @click="customerStore.stamp(-1)"
            :loading="customerStore.stamping"
            :disabled="customerStore.customer.redeemable"
            prepend-icon="tabler-rubber-stamp"
          >
            {{ $t("Unstamp") }}
          </VBtn>
          <VBtn
            block
            :color="!customerStore.customer.redeemable ? 'grey' : 'info'"
            @click="customerStore.redeem()"
            :loading="customerStore.redeeming"
            :disabled="!customerStore.customer.redeemable"
            prepend-icon="tabler-gift"
          >
            {{ $t("Redeem") }}
          </VBtn>
        </VCardActions>
      </VCard>

      <!-- User Data Section -->
      <VCard class="modern-card mb-6">
        <div class="pa-6">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Personal Information') }}</h6>
          
          <div class="user-info-list">
            <div class="info-item">
              <div class="info-label">{{ $t('Name') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ $t('Surname') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.surname }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ $t('Email') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.email }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ $t('Phone Number') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.phonenumber }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ $t('Gender') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.gender || 'Not specified' }}</div>
            </div>
          </div>
        </div>
      </VCard>

      <!-- Notes Section -->
      <VCard class="modern-card mb-6">
        <div class="pa-6">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Notes') }}</h6>
          <VTextarea
            v-model="customerStore.customer.customers_details.note"
            :placeholder="$t('Add notes about this customer')"
            rows="5"
            hide-details
            density="comfortable"
            variant="outlined"
            class="mb-4"
          />
          <div class="d-flex justify-end">
            <VBtn
              color="primary"
              variant="elevated"
            >
              {{ $t("Save Notes") }}
            </VBtn>
          </div>
        </div>
      </VCard>
    </VCol>

    <!-- Right Column -->
    <VCol md="8" sm="12">
      <!-- Statistics Cards -->
      <VCard 
        v-if="customerStore.customer.stats.length > 0"
        class="modern-card mb-6"
      >
        <div class="pa-6">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Statistics') }}</h6>
          <VRow>
            <VCol 
              v-for="stat in customerStore.customer.stats"
              :key="stat.label"
              cols="12"
              sm="6"
              md="4"
            >
              <div class="stat-card">
                <div class="stat-label">{{ $t(stat.label) }}</div>
                <div class="stat-value">{{ stat.value }}</div>
              </div>
            </VCol>
          </VRow>
        </div>
      </VCard>

      <!-- Customer History -->
      <VCard class="modern-card">
        <div class="pa-6">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Activity History') }}</h6>
          <VDataTable
            :headers="[
              { title: 'Date', key: 'date', align: 'start' },
              { title: 'Description', key: 'description', align: 'start' },
            ]"
            :items="customerStore.customer.logs"
            :items-per-page="10"
            class="modern-table"
            :loading="customerStore.gettingLogs"
          >
            <template v-slot:item.date="{ item }">
              {{ new Date(item.updatedAt).toLocaleString() }}
            </template>
            <template v-slot:item.description="{ item }">
              <VChip
                :color="item.type === 'stamp' ? (item.value > 0 ? 'success' : 'error') : 'info'"
                size="small"
                class="mr-2"
              >
                {{ item.type.toUpperCase() }}
              </VChip>
              <span v-if="item.type === 'stamp' && item.value > 0">
                {{ $t("Gained") }} {{ item.value }} {{ $t("stamps") }}
              </span>
              <span v-else-if="item.type === 'stamp' && item.value < 0">
                {{ Math.abs(item.value) }} {{ $t("stamps reverted") }}
              </span>
              <span v-else-if="item.type === 'redeem'">
                {{ $t("Redeemed reward") }}
              </span>
            </template>
          </VDataTable>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.modern-card {
  border-radius: 12px;
  border: none;
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.modern-card:hover {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}

.stamp-image {
  border-radius: 8px;
  margin: 16px;
}

.user-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface));
}

.stat-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.modern-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

:deep(.v-data-table-header th) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

:deep(.v-chip) {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
