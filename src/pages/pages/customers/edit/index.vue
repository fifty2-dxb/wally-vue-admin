<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref, computed, watch } from 'vue';
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
  additionalFields: [] as { key: string; value: string }[],
  familyMembers: [] as Array<{
    name: string;
    relationship: string;
    emiratesId: string;
    dateOfBirth: string;
  }>,
});

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' },
  { title: 'Other', value: 'Other' },
];

const relationshipOptions = [
  { title: 'Mother', value: 'Mother' },
  { title: 'Father', value: 'Father' },
  { title: 'Spouse', value: 'Spouse' },
  { title: 'Child', value: 'Child' },
  { title: 'Sibling', value: 'Sibling' },
  { title: 'Other', value: 'Other' },
];

const currentStep = ref(1);
const totalSteps = ref(3);

const showFamilyMembers = computed(() => {
  if (!customerStore.customer?.customers_details?.additionalData) return false;
  
  try {
    return customerStore.customer.industry === 'healthcare';
  } catch (error) {
    console.error('Error parsing additional data:', error);
    return false;
  }
});

// Update total steps based on whether family members should be shown
watch(showFamilyMembers, (shouldShow) => {
  totalSteps.value = shouldShow ? 4 : 3; // 4 steps for healthcare (including family members), 3 for others
}, { immediate: true });

const nextStep = () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const fetchCustomerDetails = async (customerId: string) => {
  try {
    loading.value = true;
    await customerStore.fetchCustomerById(customerId);
    const details = customerStore.customer.customers_details;
    
    // Handle additional data parsing
    let additionalFields: { key: string; value: string }[] = [];
    let familyMembers: Array<{
      name: string;
      relationship: string;
      emiratesId: string;
      dateOfBirth: string;
    }> = [];
    
    if (details.additionalData) {
      try {
        const parsedData = typeof details.additionalData === 'string' 
          ? JSON.parse(details.additionalData)
          : details.additionalData;
        
        // Handle family members if they exist
        if (parsedData.familyMembers) {
          familyMembers = parsedData.familyMembers;
        }
        
        // Handle other additional fields
        const otherFields = { ...parsedData };
        delete otherFields.familyMembers;
        
        additionalFields = Object.entries(otherFields).map(([key, value]) => ({
          key,
          value: value as string
        }));
      } catch (error) {
        console.error('Error parsing additional data:', error);
        // If parsing fails, try to handle it as a string
        const fallbackData = JSON.parse(JSON.stringify(details.additionalData));
        additionalFields = Object.entries(fallbackData).map(([key, value]) => ({
          key,
          value: value as string
        }));
      }
    }

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
      additionalFields,
      familyMembers
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
    
    // Prepare additional data with both family members and other fields
    const additionalData = {
      familyMembers: formData.value.familyMembers,
      ...formData.value.additionalFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>)
    };
    
    const updatedData = {
      ...formData.value,
      smsMarketing: formData.value.smsMarketing ? 1 : 0,
      emailMarketing: formData.value.emailMarketing ? 1 : 0,
      additionalData: JSON.stringify(additionalData),
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

const addFamilyMember = () => {
  formData.value.familyMembers.push({
    name: '',
    relationship: '',
    emiratesId: '',
    dateOfBirth: '',
  });
};

const removeFamilyMember = (index: number) => {
  formData.value.familyMembers.splice(index, 1);
};

const addAdditionalField = () => {
  formData.value.additionalFields.push({ key: '', value: '' });
};

const removeAdditionalField = (index: number) => {
  formData.value.additionalFields.splice(index, 1);
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
    <VStepper
      v-model="currentStep"
      :items="showFamilyMembers ? ['Personal Information', 'Marketing Preferences', 'Family Members', 'Additional Information'] : ['Personal Information', 'Marketing Preferences', 'Additional Information']"
      class="stepper-custom"
    >
      <template #item.1>
        <VCardText class="pa-6">
          <VForm @submit.prevent="nextStep">
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.name"
                  :label="$t('First Name')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                  class="mb-4"
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
                  class="mb-4"
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.email"
                  :label="$t('Email')"
                  type="email"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                  class="mb-4"
                />
              </VCol>
              
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.phonenumber"
                  :label="$t('Phone Number')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  required
                  class="mb-4"
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
                  class="mb-4"
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
                  class="mb-4"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </template>

      <template #item.2>
        <VCardText class="pa-6">
          <VForm @submit.prevent="nextStep">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formData.promotion"
                  :label="$t('Promotion Code')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  class="mb-4"
                />
              </VCol>
              
              <VCol cols="12">
                <div class="marketing-preferences">
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
                </div>
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="formData.note"
                  :label="$t('Notes')"
                  :placeholder="$t('Add any additional notes about this customer')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                  rows="4"
                  class="mb-4"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </template>

      <template #item.3 v-if="showFamilyMembers">
        <VCardText class="pa-6">
          <VForm @submit.prevent="nextStep">
            <div class="section-header mb-4">
              <h6 class="text-h6 font-weight-medium mb-0">{{ $t('Family Members') }}</h6>
              <VBtn
                color="primary"
                variant="tonal"
                size="small"
                @click="addFamilyMember"
                :disabled="loading"
                prepend-icon="tabler-user-plus"
              >
                {{ $t('Add Family Member') }}
              </VBtn>
            </div>

            <div v-for="(member, index) in formData.familyMembers" :key="index" class="family-member-card mb-4">
              <div class="d-flex justify-space-between align-center mb-4">
                <h6 class="text-subtitle-1 font-weight-medium mb-0">{{ $t('Family Member') }} {{ index + 1 }}</h6>
                <VBtn
                  icon
                  variant="text"
                  color="error"
                  @click="removeFamilyMember(index)"
                  :disabled="loading"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </div>

              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="member.name"
                    :label="$t('Name')"
                    density="comfortable"
                    variant="outlined"
                    :disabled="loading"
                    required
                    class="mb-4"
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="member.relationship"
                    :items="relationshipOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('Relationship')"
                    density="comfortable"
                    variant="outlined"
                    :disabled="loading"
                    required
                    class="mb-4"
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="member.emiratesId"
                    :label="$t('Emirates ID')"
                    density="comfortable"
                    variant="outlined"
                    :disabled="loading"
                    required
                    class="mb-4"
                  />
                </VCol>
                
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="member.dateOfBirth"
                    :label="$t('Date of Birth')"
                    type="date"
                    density="comfortable"
                    variant="outlined"
                    :disabled="loading"
                    required
                    class="mb-4"
                  />
                </VCol>
              </VRow>
            </div>

            <div v-if="formData.familyMembers.length === 0" class="text-center py-4">
              <VIcon icon="tabler-users" size="24" class="mb-2" />
              <p class="text-medium-emphasis">{{ $t('No family members added yet') }}</p>
            </div>
          </VForm>
        </VCardText>
      </template>

      <template #item.3 v-else>
        <VCardText class="pa-6">
          <VForm @submit.prevent="handleSubmit">
            <div class="section-header mb-4">
              <h6 class="text-h6 font-weight-medium mb-0">{{ $t('Additional Information') }}</h6>
              <VBtn
                color="primary"
                variant="tonal"
                size="small"
                @click="addAdditionalField"
                :disabled="loading"
                prepend-icon="tabler-plus"
              >
                {{ $t('Add Field') }}
              </VBtn>
            </div>

            <VRow v-for="(field, index) in formData.additionalFields" :key="index" class="mb-4">
              <VCol cols="5">
                <VTextField
                  v-model="field.key"
                  :label="$t('Field Name')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="field.value"
                  :label="$t('Field Value')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
              <VCol cols="1" class="d-flex align-center">
                <VBtn
                  icon
                  variant="text"
                  color="error"
                  @click="removeAdditionalField(index)"
                  :disabled="loading"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </VCol>
            </VRow>

            <div v-if="formData.additionalFields.length === 0" class="text-center py-4">
              <VIcon icon="tabler-info-circle" size="24" class="mb-2" />
              <p class="text-medium-emphasis">{{ $t('No additional fields added yet') }}</p>
            </div>
          </VForm>
        </VCardText>
      </template>

      <template #item.4 v-if="showFamilyMembers">
        <VCardText class="pa-6">
          <VForm @submit.prevent="handleSubmit">
            <div class="section-header mb-4">
              <h6 class="text-h6 font-weight-medium mb-0">{{ $t('Additional Information') }}</h6>
              <VBtn
                color="primary"
                variant="tonal"
                size="small"
                @click="addAdditionalField"
                :disabled="loading"
                prepend-icon="tabler-plus"
              >
                {{ $t('Add Field') }}
              </VBtn>
            </div>

            <VRow v-for="(field, index) in formData.additionalFields" :key="index" class="mb-4">
              <VCol cols="5">
                <VTextField
                  v-model="field.key"
                  :label="$t('Field Name')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="field.value"
                  :label="$t('Field Value')"
                  density="comfortable"
                  variant="outlined"
                  :disabled="loading"
                />
              </VCol>
              <VCol cols="1" class="d-flex align-center">
                <VBtn
                  icon
                  variant="text"
                  color="error"
                  @click="removeAdditionalField(index)"
                  :disabled="loading"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </VCol>
            </VRow>

            <div v-if="formData.additionalFields.length === 0" class="text-center py-4">
              <VIcon icon="tabler-info-circle" size="24" class="mb-2" />
              <p class="text-medium-emphasis">{{ $t('No additional fields added yet') }}</p>
            </div>
          </VForm>
        </VCardText>
      </template>

      <template #actions>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            v-if="currentStep > 1"
            variant="tonal"
            color="secondary"
            @click="prevStep"
            :disabled="loading"
            class="me-2"
          >
            {{ $t('Previous') }}
          </VBtn>
          <VBtn
            v-if="currentStep < totalSteps"
            color="primary"
            @click="nextStep"
            :disabled="loading"
          >
            {{ $t('Next') }}
          </VBtn>
          <VBtn
            v-if="currentStep === totalSteps"
            color="primary"
            @click="handleSubmit"
            :loading="loading"
            :disabled="loading"
          >
            {{ $t('Save Changes') }}
          </VBtn>
        </VCardActions>
      </template>
    </VStepper>
  </VCard>
</template>

<style scoped>
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.05);
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

.stepper-custom {
  background: transparent !important;
}

:deep(.v-stepper-header) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.v-stepper-item__title) {
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.v-stepper-item--selected .v-stepper-item__title) {
  color: rgb(var(--v-theme-primary));
}

.marketing-preferences {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

:deep(.v-switch) {
  margin-bottom: 8px;
}

:deep(.v-switch__track) {
  opacity: 0.2;
}

:deep(.v-switch--selected .v-switch__track) {
  opacity: 0.5;
}

.family-member-card {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.family-member-card:hover {
  background: rgba(var(--v-theme-surface), 0.7);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.mt-8 {
  margin-top: 2rem;
}
</style>
