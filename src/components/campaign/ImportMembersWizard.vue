<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCustomerStore } from '@/stores/customer';
import { useSnackbar } from '@/composables/useSnackbar';

const props = defineProps({
  isOpen: Boolean,
  eventId: String,
});

const emit = defineEmits(['close', 'imported', 'update:isOpen']);
const { showSuccess, showError } = useSnackbar();
const customerStore = useCustomerStore();

const currentStep = ref(1);
const file = ref<File | null>(null);
const csvData = ref<any[]>([]);
const validationErrors = ref<string[]>([]);
const isImporting = ref(false);

const headers = [
  { title: 'Full Name', key: 'fullName' },
  { title: 'Birthday', key: 'birthday' },
  { title: 'Phone Number', key: 'phoneNumber' },
  { title: 'Additional Data', key: 'additionalData' },
];

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    file.value = input.files[0];
    parseCSV();
  }
};

const parseCSV = () => {
  if (!file.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      validationErrors.value = ['CSV file must contain at least a header row and one data row'];
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    csvData.value = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        if (values[index]) {
          row[header] = values[index];
        }
      });

      // Extract member information from the Members column
      const membersData = [];
      const membersText = row['Members'] || '';
      const memberEntries = membersText.split('[').filter(entry => entry.trim());
      
      memberEntries.forEach(entry => {
        const memberInfo = entry.split(' - ').reduce((acc, item) => {
          const [key, value] = item.split(': ').map(s => s.trim());
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        if (Object.keys(memberInfo).length > 0) {
          membersData.push(memberInfo);
        }
      });

      // Create the required format
      return {
        fullName: row['Full Name'] || '',
        birthday: membersData[0]?.['Date of Birth'] || '',
        phoneNumber: row['Phone'] || '',
        additionalData: JSON.stringify({
          leadId: row['Lead ID'],
          emirateId: row['EmirateID / Passport'],
          email: row['Email'],
          address: row['Address'],
          branch: row['Branch'],
          doctor: row['Doctor'],
          notes: row['Notes'],
          submittedOn: row['Submitted on'],
          members: membersData
        })
      };
    });

    // Validate the parsed data
    validateData();
  };
  reader.readAsText(file.value);
};

const validateData = () => {
  validationErrors.value = [];
  
  if (csvData.value.length === 0) {
    validationErrors.value.push('No data found in the CSV file');
    return;
  }

  csvData.value.forEach((row, index) => {
    if (!row.fullName) {
      validationErrors.value.push(`Row ${index + 1}: Full Name is required`);
    }
    if (!row.phoneNumber) {
      validationErrors.value.push(`Row ${index + 1}: Phone Number is required`);
    }
  });
};

const importMembers = async () => {
  if (!props.eventId) {
    showError('Event ID is required');
    return;
  }

  isImporting.value = true;
  try {
    for (const member of csvData.value) {
      const [name, surname] = member.fullName.split(' ').filter(Boolean);
      const memberData = {
        name: name || '',
        surname: surname || '',
        birthday: member.birthday,
        phonenumber: member.phoneNumber,
        additionalData: member.additionalData,
      };

      await customerStore.addMember(memberData, { eventId: props.eventId });
    }

    showSuccess('Members imported successfully');
    emit('imported');
    closeDialog();
  } catch (error) {
    console.error('Error importing members:', error);
    showError('Failed to import members');
  } finally {
    isImporting.value = false;
  }
};

const closeDialog = () => {
  file.value = null;
  csvData.value = [];
  validationErrors.value = [];
  currentStep.value = 1;
  emit('update:isOpen', false);
  emit('close');
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
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
        <span class="text-h6">Import Members</span>
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
              title="Upload CSV"
              subtitle="Select your file"
            />
            <VDivider />
            <VStepperItem
              :value="2"
              title="Preview Data"
              subtitle="Review and validate"
            />
            <VDivider />
            <VStepperItem
              :value="3"
              title="Import"
              subtitle="Complete import"
            />
          </VStepperHeader>

          <VStepperWindow>
            <VStepperWindowItem :value="1">
              <div class="text-center pa-4">
                <VFileInput
                  :model-value="file"
                  @update:model-value="(newFile) => {
                    file = Array.isArray(newFile) ? newFile[0] : newFile;
                    if (file) parseCSV();
                  }"
                  accept=".csv"
                  label="Select CSV File"
                  prepend-icon="tabler-file-import"
                />
                <div class="mt-4 text-body-2 text-medium-emphasis">
                  Please upload a CSV file with the following columns:
                  <br>
                  fullName, birthday, phoneNumber, [additional columns...]
                </div>
              </div>
            </VStepperWindowItem>

            <VStepperWindowItem :value="2">
              <div v-if="validationErrors.length > 0" class="mb-4">
                <VAlert
                  type="error"
                  variant="tonal"
                >
                  <template #title>
                    Validation Errors
                  </template>
                  <ul class="mb-0">
                    <li v-for="error in validationErrors" :key="error">
                      {{ error }}
                    </li>
                  </ul>
                </VAlert>
              </div>

              <VDataTable
                :headers="headers"
                :items="csvData"
                :items-per-page="5"
                class="elevation-1"
              >
                <template #item.additionalData="{ item }">
                  <VChip
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ Object.keys(JSON.parse(item.additionalData)).length }} fields
                  </VChip>
                </template>
              </VDataTable>
            </VStepperWindowItem>

            <VStepperWindowItem :value="3">
              <div class="text-center pa-4">
                <VIcon
                  icon="tabler-alert-circle"
                  color="warning"
                  size="48"
                  class="mb-4"
                />
                <h4 class="text-h6 mb-2">Ready to Import</h4>
                <p class="text-body-1 text-medium-emphasis mb-4">
                  You are about to import {{ csvData.length }} members.
                  <br>
                  This action cannot be undone.
                </p>
              </div>
            </VStepperWindowItem>
          </VStepperWindow>
        </VStepper>
      </VCardText>

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          v-if="currentStep > 1"
          variant="tonal"
          color="secondary"
          class="me-3"
          @click="prevStep"
        >
          Back
        </VBtn>
        <VBtn
          v-if="currentStep < 3"
          color="primary"
          :disabled="!file || csvData.length === 0 || validationErrors.length > 0"
          @click="nextStep"
        >
          Next
        </VBtn>
        <VBtn
          v-if="currentStep === 3"
          color="primary"
          :loading="isImporting"
          :disabled="isImporting"
          @click="importMembers"
        >
          Import Members
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.v-stepper {
  box-shadow: none !important;
}
</style> 