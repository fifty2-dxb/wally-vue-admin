<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { useSnackbar } from '@/composables/useSnackbar';

const router = useRouter();
const route = useRoute();
const customerStore = useCustomerStore();
const { showSuccess, showError } = useSnackbar();

const loading = ref(false);
const formData = ref({
  name: '',
  surname: '',
  phonenumber: '',
  email: '',
  promotion: '',
  birthday: null as string | null,
  gender: null as string | null,
  smsMarketing: false,
  emailMarketing: false,
  note: '',
});

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' },
  { title: 'Other', value: 'Other' },
];

const fetchCustomerDetails = async (customerId: string) => {
  try {
    loading.value = true;
    await customerStore.fetchCustomerById(customerId);
    // Populate form with customer details
    const details = customerStore.customer.customers_details;
    formData.value = {
      name: details.name,
      surname: details.surname,
      phonenumber: details.phonenumber,
      email: details.email,
      promotion: details.promotion,
      birthday: details.birthday,
      gender: details.gender,
      smsMarketing: details.smsMarketing === 0 ? false : true,
      emailMarketing: details.emailMarketing === 0 ? false : true,
      note: details.note || '',
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    showError('Failed to load customer details');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const customerId = customerStore.customer.customers_details.id;
    
    const updatedData = {
      ...formData.value,
      smsMarketing: formData.value.smsMarketing ? 1 : 0,
      emailMarketing: formData.value.emailMarketing ? 1 : 0,
    };
    
    await customerStore.updateCustomer(customerId, updatedData);
    showSuccess('Customer details updated successfully');
    router.push(`/pages/customers/show/${customerId}`);
  } catch (error) {
    console.error('Error updating customer:', error);
    showError('Failed to update customer details');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (id) {
    fetchCustomerDetails(id);
  }
});
</script>

<template>
  <div class="page-header mb-6">
    <div class="d-flex justify-space-between align-center">
      <div>
        <h4 class="text-h4 font-weight-medium mb-2">
          {{ $t('Edit Customer') }}
        </h4>
        <div class="text-body-1 text-medium-emphasis">
          {{ $t('Update customer information') }}
        </div>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          color="error"
          variant="outlined"
          :to="`/pages/customers/show/${route.params.id}`"
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn
          color="primary"
          @click="handleSubmit"
          :loading="customerStore.updating"
          :disabled="loading"
        >
          {{ $t('Save Changes') }}
        </VBtn>
      </div>
    </div>
  </div>

  <VCard class="modern-card">
    <div class="pa-6">
      <VForm @submit.prevent="handleSubmit">
        <VRow>
          <!-- Personal Information -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Personal Information') }}</h6>
            
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.name"
                  :label="$t('First Name')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.surname"
                  :label="$t('Last Name')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                />
              </VCol>
              
              <VCol cols="12">
                <VTextField
                  v-model="formData.email"
                  :label="$t('Email')"
                  type="email"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                />
              </VCol>
              
              <VCol cols="12">
                <VTextField
                  v-model="formData.phonenumber"
                  :label="$t('Phone Number')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VSelect
                  v-model="formData.gender"
                  :items="genderOptions"
                  item-title="title"
                  item-value="value"
                  :label="$t('Gender')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  clearable
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.birthday"
                  :label="$t('Birthday')"
                  type="date"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Marketing Preferences -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 font-weight-medium mb-4">{{ $t('Marketing Preferences') }}</h6>
            
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formData.promotion"
                  :label="$t('Promotion Code')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
              
              <VCol cols="12">
                <VSwitch
                  v-model="formData.smsMarketing"
                  :label="$t('Receive SMS Marketing')"
                  color="primary"
                  :disabled="loading"
                  hide-details
                  class="mb-4"
                />
                
                <VSwitch
                  v-model="formData.emailMarketing"
                  :label="$t('Receive Email Marketing')"
                  color="primary"
                  :disabled="loading"
                  hide-details
                />
              </VCol>
            </VRow>

            <h6 class="text-h6 font-weight-medium mb-4 mt-8">{{ $t('Additional Notes') }}</h6>
            <VTextarea
              v-model="formData.note"
              :label="$t('Notes')"
              :placeholder="$t('Add any additional notes about this customer')"
              density="comfortable"
              variant="outlined"
              :disabled="loading"
              rows="4"
            />
          </VCol>
        </VRow>
      </VForm>
    </div>
  </VCard>
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

.gap-3 {
  gap: 12px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-label) {
  font-size: 0.875rem;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
}
</style>
