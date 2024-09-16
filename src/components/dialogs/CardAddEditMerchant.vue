<script setup lang="ts">
import { useMerchantStore } from '@/stores/merchant';
import { useOrganizationStore } from '@/stores/organization';
import { ref, toRaw, watch } from 'vue';

const merchantStore = useMerchantStore();
const organizationStore = useOrganizationStore();

interface Details {
  organisationGuid: string;
  merchantName: string;
  limit: number;
}

interface Emit {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'showSnackbarMessage', message: string, color: string): void;
}

const props = defineProps({
  organisationGuid: String,
  cardDetails: Object,  // For editing existing merchant
  modelValue: Boolean,  // For showing/hiding the dialog
});

const emit = defineEmits<Emit>();

// This will hold the editable merchant data
const editableMerchant = ref<Details>({
  organisationGuid: props.organisationGuid || '',
  merchantName: '',
  limit: 0,
});

// Watch for changes in `cardDetails` and `organisationGuid`
watch(
  () => [props.organisationGuid, props.cardDetails],
  ([newOrgGuid, newCardDetails]) => {
    if (newCardDetails) {
      // Copy original merchant details to `editableMerchant`
      editableMerchant.value = {
        organisationGuid: newOrgGuid || '',
        merchantName: newCardDetails.merchantName,
        limit: newCardDetails.limit,
      };
    } else {
      // Reset to empty for new merchant
      editableMerchant.value = {
        organisationGuid: newOrgGuid || '',
        merchantName: '',
        limit: 0,
      };
    }
  },
  { immediate: true }
);

// When the dialog is closed (without submission), reset `editableMerchant`
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal && props.cardDetails) {
      // Reset editable merchant to the original value on close if it's editing
      editableMerchant.value = {
        organisationGuid: props.organisationGuid || '',
        merchantName: props.cardDetails.merchantName,
        limit: props.cardDetails.limit,
      };
    } else if (!newVal && !props.cardDetails) {
      // Reset to empty if it was a new merchant addition
      editableMerchant.value = {
        organisationGuid: props.organisationGuid || '',
        merchantName: '',
        limit: 0,
      };
    }
  }
);

const handleSaveMerchant = async () => {
  try {
    const merchantData = toRaw(editableMerchant.value);

    if (!merchantData.organisationGuid) {
      emit('showSnackbarMessage', 'Organisation GUID is missing!', 'error');
      return;
    }

    if (props.cardDetails) {
      // Update existing merchant
      await merchantStore.updateMerchant(props.cardDetails.merchantGuid, merchantData);
      emit('showSnackbarMessage', 'Merchant updated successfully!', 'success');
    } else {
      // Add new merchant
      await merchantStore.addMerchant(merchantData);
      emit('showSnackbarMessage', 'Merchant added successfully!', 'success');
    }

    // Fetch latest organizations after the operation
    await organizationStore.fetchOrganizations();

    // Close the dialog
    emit('update:modelValue', false);

  } catch (error) {
    console.error('Error saving merchant:', error);
    emit('showSnackbarMessage', 'Failed to save the merchant!', 'error');
  }
};
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)">
    <DialogCloseBtn @click="emit('update:modelValue', false)" />

    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            <span>{{ props.cardDetails ? 'Edit' : 'New' }} Merchant</span>
          </h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">
          {{ props.cardDetails ? 'Edit your merchant details' : 'Add a new merchant' }}
        </p>
      </VCardItem>
      <VCardText class="pt-6">
        <VForm @submit.prevent="handleSaveMerchant">
          <VRow>
            <VCol cols="12">
              <VTextField v-model="editableMerchant.merchantName" label="Merchant Name" required />
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
