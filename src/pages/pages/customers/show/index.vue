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
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (id) {
    fetchCustomerDetails(id);
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
      <div class="d-flex gap-3">
        <VBtn
          color="primary"
          prepend-icon="tabler-edit"
          :to="`/pages/customers/edit/${route.params.id}`"
        >
          {{ $t('Edit Customer') }}
        </VBtn>
        <VBtn
          color="secondary"
          prepend-icon="tabler-dots-vertical"
          variant="tonal"
        >
          {{ $t('More Actions') }}
        </VBtn>
      </div>
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
        <div class="px-6 py-4">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Personal Information') }}</h6>
          
          <div class="user-info-list">
            <div class="info-item">
              <div class="info-label">{{ $t('Phone') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.phonenumber || '-' }}</div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Gender') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.gender || '-' }}</div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Birthday') }}</div>
              <div class="info-value">{{ customerStore.customer.customers_details.birthday || '-' }}</div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Member Since') }}</div>
              <div class="info-value">{{ new Date(customerStore.customer.customers_details.createdAt).toLocaleDateString() }}</div>
            </div>
          </div>
        </div>
      </VCard>

      <!-- Pass Details Section -->
      <VCard class="modern-card mb-6">
        <div class="px-6 py-4">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Pass Details') }}</h6>
          
          <div class="user-info-list">
            <div class="info-item">
              <div class="info-label">{{ $t('Pass Type') }}</div>
              <div class="info-value">
                <VChip
                  :color="customerStore.customer.type === 'stamp' ? 'primary' : 'success'"
                  size="small"
                  class="mr-2"
                >
                  {{ customerStore.customer.type.toUpperCase() }}
                </VChip>
              </div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Serial Number') }}</div>
              <div class="info-value">{{ customerStore.customer.serialNumber || '-' }}</div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Status') }}</div>
              <div class="info-value">
                <VChip
                  :color="customerStore.customer.status === 'active' ? 'success' : 'error'"
                  size="small"
                  class="mr-2"
                >
                  {{ customerStore.customer.status ? customerStore.customer.status.toUpperCase() : 'INACTIVE' }}
                </VChip>
                <VChip
                  v-if="customerStore.customer.isExpired"
                  color="error"
                  size="small"
                >
                  {{ $t('EXPIRED') }}
                </VChip>
              </div>
            </div>
            <VDivider />
            
            <div class="info-item">
              <div class="info-label">{{ $t('Expiration') }}</div>
              <div class="info-value">
                <template v-if="customerStore.customer.expiresAt">
                  {{ new Date(customerStore.customer.expiresAt).toLocaleDateString() }}
                  <div class="text-caption text-medium-emphasis">
                    {{ customerStore.customer.isExpired 
                      ? $t('Pass has expired') 
                      : $t('Valid pass') 
                    }}
                  </div>
                </template>
                <template v-else>
                  {{ $t('No expiration date') }}
                </template>
              </div>
            </div>
            <VDivider />
            
            <div v-if="customerStore.customer.type === 'stamp'" class="info-item">
              <div class="info-label">{{ $t('Stamps Progress') }}</div>
              <div class="d-flex align-center mt-2">
                <VProgressLinear
                  :model-value="((customerStore.customer.currentStamps || 0) / (customerStore.customer.requiredStamps || 1)) * 100"
                  color="primary"
                  height="8"
                  rounded
                />
                <span class="ml-4 text-primary font-weight-medium">
                  {{ customerStore.customer.currentStamps || 0 }} / {{ customerStore.customer.requiredStamps || '-' }}
                </span>
              </div>
            </div>
            
            <div v-if="customerStore.customer.type === 'stamp'" class="info-item">
              <div class="info-label">{{ $t('Reward Status') }}</div>
              <div class="info-value">
                <VChip
                  :color="customerStore.customer.redeemable ? 'success' : 'grey'"
                  size="small"
                  class="mr-2"
                  :disabled="customerStore.customer.isExpired"
                >
                  {{ customerStore.customer.redeemable && !customerStore.customer.isExpired 
                    ? $t('REDEEMABLE') 
                    : $t('NOT REDEEMABLE') 
                  }}
                </VChip>
              </div>
            </div>
          </div>
        </div>
      </VCard>

      <!-- Notes Section -->
      <VCard class="modern-card mb-6">
        <div class="px-6 py-4">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Notes') }}</h6>
          <VTextarea
            v-model="customerStore.customer.customers_details.note"
            :placeholder="$t('Add notes about this customer')"
            rows="4"
            hide-details
            variant="outlined"
            density="comfortable"
          />
          <div class="d-flex justify-end mt-4">
            <VBtn
              color="primary"
              size="small"
            >
              {{ $t('Save Notes') }}
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
        <div class="px-6 py-4">
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

      <!-- Activity History -->
      <VCard class="modern-card">
        <div class="px-6 py-4">
          <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Activity History') }}</h6>
          <VDataTable
            :headers="[
              { title: 'DATE', key: 'date', sortable: true },
              { title: 'ACTIVITY', key: 'description' },
            ]"
            :items="customerStore.customer.logs"
            :items-per-page="10"
            class="modern-table"
            :loading="customerStore.gettingLogs"
          >
            <template #item.date="{ item }">
              {{ new Date(item.updatedAt).toLocaleString() }}
            </template>
            <template #item.description="{ item }">
              <VChip
                :color="item.type === 'stamp' ? (item.value > 0 ? 'success' : 'error') : 'info'"
                size="small"
                class="mr-2"
              >
                {{ item.type.toUpperCase() }}
              </VChip>
              <span v-if="item.type === 'stamp' && item.value > 0">
                {{ $t("Gained {0} stamps", [item.value]) }}
              </span>
              <span v-else-if="item.type === 'stamp' && item.value < 0">
                {{ $t("Removed {0} stamps", [Math.abs(item.value)]) }}
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
  overflow: hidden;
  transition: box-shadow 0.2s;
  border: none;
}

.modern-card:hover {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.05);
}

.stamp-image {
  border-radius: 8px;
  margin: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  padding: 8px 0;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
}

.stat-card {
  background: rgb(var(--v-theme-surface));
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.modern-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

:deep(.v-data-table-header th) {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
}

:deep(.v-chip) {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
