<script setup lang="ts">
import { useOrganizationStore } from '@/stores/organization';
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardItem, VCardText, VCardTitle, VCol, VDialog, VForm, VRow, VTextField } from 'vuetify/components';

const props = defineProps({
  organisationGuid: String,
  organisation: Object,
  modelValue: Boolean,
});

const emit = defineEmits<{
  (e: 'submit', value: any): void;
  (e: 'update:modelValue', value: boolean): void;
  (e: 'showSnackbarMessage', message: string, color: string): void;
  (e: 'reset-org-details'): void;
}>();

// Organization details form model
const orgDetails = ref({
  organisationName: '',
  organisationGuid: ''
});

// Watch for organisation prop changes to populate orgDetails in edit mode
watch(
  () => props.organisation,
  (val) => {
    if (val && props.organisationGuid) {
      orgDetails.value = {
        organisationName: val.organisationName || '',
        organisationGuid: props.organisationGuid,
      };
    }
  },
  { immediate: true }
);

// Method to reset orgDetails for "New Organisation" form
const resetOrgDetails = () => {
  orgDetails.value = {
    organisationName: '',
    organisationGuid: ''
  };
};

// Emit reset-org-details event to clear the form when creating a new organization
watch(
  () => props.modelValue,
  (val) => {
    if (!props.organisationGuid && val) {
      emit('reset-org-details');
      resetOrgDetails();
    }
  }
);

// Save or update organisation
const handleSaveOrganisation = async () => {
  try {
    const { organisationGuid, ...organisationData } = orgDetails.value;
    const store = useOrganizationStore();

    if (organisationGuid) {
      // Update existing organisation
      await store.updateOrganization(organisationGuid, {
        ...organisationData,
        verified_at: new Date().toISOString(),
        cLimit: 0,
        mLimit: 0,
      });
      emit('showSnackbarMessage', 'Organization updated successfully!', 'success');
      await store.fetchOrganizations();
      emit('update:modelValue', false);
    } else {
      // Add new organisation
      await store.addOrganization({
        ...organisationData,
        cLimit: 0,
        mLimit: 0,
      });
      emit('showSnackbarMessage', 'Organization added successfully!', 'success');
      await store.fetchOrganizations();
      emit('update:modelValue', false);
    }
  } catch (error) {
    emit('showSnackbarMessage', error.response._data.message, 'error');
  }
};

</script>

<template>
  <VDialog :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600px">
    <DialogCloseBtn @click="emit('update:modelValue', false)" />
    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            {{ props.organisationGuid ? 'Edit Organisation' : 'Add New Organisation' }}
          </h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">
          {{ props.organisationGuid ? 'Edit your organisation details' : 'Add a new organisation' }}
        </p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="handleSaveOrganisation">
          <VRow>
            <VCol cols="12">
              <VTextField v-model="orgDetails.organisationName" label="Organisation Name"
                placeholder="Organization name" required />
            </VCol>
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit">
                Submit
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="emit('update:modelValue', false)">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
