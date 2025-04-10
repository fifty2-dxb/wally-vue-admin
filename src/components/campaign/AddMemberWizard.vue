<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { useCampaignStore } from '@/stores/campaign';

const props = defineProps<{
  isOpen: boolean;
  eventId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'close'): void;
  (e: 'imported'): void;
}>();

const currentStep = ref(1);
const isAddingMember = ref(false);
const customerStore = useCustomerStore();
const campaignStore = useCampaignStore();

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

const newMember = ref({
  // Step 1: Personal Information
  name: '',
  surname: '',
  phonenumber: '',
  email: '',
  gender: null,
  birthday: null,

  // Step 2: Marketing Preferences
  promotion: '',
  smsMarketing: 0,
  emailMarketing: 0,
  note: '',

  // Step 3: Additional Information
  additionalFields: [] as { key: string; value: string }[],
  familyMembers: [] as Array<{
    name: string;
    relationship: string;
    emiratesId: string;
    dateOfBirth: string;
  }>,
});

const addAdditionalField = () => {
  newMember.value.additionalFields.push({ key: '', value: '' });
};

const removeAdditionalField = (index: number) => {
  newMember.value.additionalFields.splice(index, 1);
};

const addFamilyMember = () => {
  newMember.value.familyMembers.push({
    name: '',
    relationship: '',
    emiratesId: '',
    dateOfBirth: '',
  });
};

const removeFamilyMember = (index: number) => {
  newMember.value.familyMembers.splice(index, 1);
};

const validateStep1 = () => {
  if (!newMember.value.name || !newMember.value.surname || !newMember.value.email) {
    return false;
  }
  return true;
};

const validateStep2 = () => {
  return true; // No required fields in step 2
};

const validateStep3 = () => {
  return true; // No required fields in step 3
};

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) {
    return;
  }
  if (currentStep.value === 2 && !validateStep2()) {
    return;
  }
  if (currentStep.value === 3 && !validateStep3()) {
    return;
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const closeDialog = () => {
  currentStep.value = 1;
  newMember.value = {
    name: '',
    surname: '',
    phonenumber: '',
    email: '',
    gender: null,
    birthday: null,
    promotion: '',
    smsMarketing: 0,
    emailMarketing: 0,
    note: '',
    additionalFields: [],
    familyMembers: [],
  };
  emit('update:isOpen', false);
  emit('close');
};

const handleAddMember = async () => {
  if (!validateStep1()) {
    return;
  }

  try {
    isAddingMember.value = true;

    // Prepare additional data with both family members and other fields
    const additionalData = {
      familyMembers: newMember.value.familyMembers,
      ...newMember.value.additionalFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>)
    };

    const memberData = {
      ...newMember.value,
      smsMarketing: newMember.value.smsMarketing ? 1 : 0,
      emailMarketing: newMember.value.emailMarketing ? 1 : 0,
      additionalData: JSON.stringify(additionalData),
    };

    if (!props.eventId) {
      throw new Error('Event ID is required');
    }

    await customerStore.addMember(memberData, { eventId: props.eventId });
    emit('imported');
    closeDialog();
  } catch (error) {
    console.error('Error adding member:', error);
  } finally {
    isAddingMember.value = false;
  }
};
</script>

<template>
  <VDialog
    :model-value="isOpen"
    @update:model-value="(val) => emit('update:isOpen', val)"
    max-width="800"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Add New Member</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="closeDialog"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VDivider />

      <VCardText class="pa-4">
        <VStepper v-model="currentStep">
          <VStepperHeader>
            <VStepperItem
              :value="1"
              title="Personal Information"
              subtitle="Basic details"
            />
            <VDivider />
            <VStepperItem
              :value="2"
              title="Marketing Preferences"
              subtitle="Communication settings"
            />
            <VDivider />
            <VStepperItem
              :value="3"
              title="Family & Additional Info"
              subtitle="Family members and custom fields"
            />
          </VStepperHeader>

          <VStepperWindow>
            <!-- Step 1: Personal Information -->
            <VStepperWindowItem :value="1">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="newMember.name"
                    label="First Name"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                    required
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="newMember.surname"
                    label="Last Name"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="newMember.email"
                    label="Email"
                    type="email"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="newMember.phonenumber"
                    label="Phone Number"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="newMember.gender"
                    :items="genderOptions"
                    item-title="title"
                    item-value="value"
                    label="Gender"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                    clearable
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model="newMember.birthday"
                    label="Birthday"
                    type="date"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                  />
                </VCol>
              </VRow>
            </VStepperWindowItem>

            <!-- Step 2: Marketing Preferences -->
            <VStepperWindowItem :value="2">
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="newMember.promotion"
                    label="Promotion Code"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                  />
                </VCol>
                <VCol cols="12">
                  <VSwitch
                    v-model="newMember.smsMarketing"
                    label="Receive SMS Marketing"
                    color="primary"
                    :disabled="isAddingMember"
                    hide-details
                    class="mb-4"
                  />
                  <VSwitch
                    v-model="newMember.emailMarketing"
                    label="Receive Email Marketing"
                    color="primary"
                    :disabled="isAddingMember"
                    hide-details
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="newMember.note"
                    label="Notes"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                    rows="4"
                  />
                </VCol>
              </VRow>
            </VStepperWindowItem>

            <!-- Step 3: Family & Additional Information -->
            <VStepperWindowItem :value="3">
              <!-- Family Members Section -->
              <div class="section-header mb-4">
                <h6 class="text-subtitle-1 font-weight-medium mb-0">Family Members</h6>
                <VBtn
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="addFamilyMember"
                  :disabled="isAddingMember"
                  prepend-icon="tabler-user-plus"
                >
                  Add Family Member
                </VBtn>
              </div>

              <div v-for="(member, index) in newMember.familyMembers" :key="index" class="family-member-card mb-4">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h6 class="text-subtitle-1 font-weight-medium mb-0">Family Member {{ index + 1 }}</h6>
                  <VBtn
                    icon
                    variant="text"
                    color="error"
                    @click="removeFamilyMember(index)"
                    :disabled="isAddingMember"
                  >
                    <VIcon icon="tabler-trash" />
                  </VBtn>
                </div>

                <VRow>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="member.name"
                      label="Name"
                      density="comfortable"
                      variant="outlined"
                      :disabled="isAddingMember"
                      required
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VSelect
                      v-model="member.relationship"
                      :items="relationshipOptions"
                      item-title="title"
                      item-value="value"
                      label="Relationship"
                      density="comfortable"
                      variant="outlined"
                      :disabled="isAddingMember"
                      required
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="member.emiratesId"
                      label="Emirates ID"
                      density="comfortable"
                      variant="outlined"
                      :disabled="isAddingMember"
                      required
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="member.dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      density="comfortable"
                      variant="outlined"
                      :disabled="isAddingMember"
                      required
                    />
                  </VCol>
                </VRow>
              </div>

              <div v-if="newMember.familyMembers.length === 0" class="text-center py-4">
                <VIcon icon="tabler-users" size="24" class="mb-2" />
                <p class="text-medium-emphasis">No family members added yet</p>
              </div>

              <!-- Additional Fields Section -->
              <div class="section-header mb-4 mt-8">
                <h6 class="text-subtitle-1 font-weight-medium mb-0">Additional Information</h6>
                <VBtn
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="addAdditionalField"
                  :disabled="isAddingMember"
                  prepend-icon="tabler-plus"
                >
                  Add Field
                </VBtn>
              </div>

              <VRow v-for="(field, index) in newMember.additionalFields" :key="index" class="mb-4">
                <VCol cols="5">
                  <VTextField
                    v-model="field.key"
                    label="Field Name"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="field.value"
                    label="Field Value"
                    density="comfortable"
                    variant="outlined"
                    :disabled="isAddingMember"
                  />
                </VCol>
                <VCol cols="1" class="d-flex align-center">
                  <VBtn
                    icon
                    variant="text"
                    color="error"
                    @click="removeAdditionalField(index)"
                    :disabled="isAddingMember"
                  >
                    <VIcon icon="tabler-trash" />
                  </VBtn>
                </VCol>
              </VRow>

              <div v-if="newMember.additionalFields.length === 0" class="text-center py-4">
                <VIcon icon="tabler-info-circle" size="24" class="mb-2" />
                <p class="text-medium-emphasis">No additional fields added yet</p>
              </div>
            </VStepperWindowItem>
          </VStepperWindow>
        </VStepper>
      </VCardText>

      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          v-if="currentStep > 1"
          variant="tonal"
          color="secondary"
          class="me-3"
          @click="prevStep"
          :disabled="isAddingMember"
        >
          Back
        </VBtn>
        <VBtn
          v-if="currentStep < 3"
          color="primary"
          @click="nextStep"
          :disabled="isAddingMember"
        >
          Next
        </VBtn>
        <VBtn
          v-if="currentStep === 3"
          color="primary"
          @click="handleAddMember"
          :loading="isAddingMember"
          :disabled="isAddingMember"
        >
          Add Member
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.v-stepper {
  box-shadow: none !important;
}

.v-stepper-header {
  box-shadow: none !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-stepper-item {
  padding: 1rem;
}

.v-stepper-item--active {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-stepper-item--complete {
  background: rgba(var(--v-theme-success), 0.05);
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

.family-member-card {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.family-member-card:hover {
  background: rgba(var(--v-theme-surface), 0.7);
}
</style> 