<script setup lang="ts">
import { ref, watchEffect } from 'vue';

interface MerchantDetails {
  merchantName: string;
  organisationGuid: string;
  cLimit: number;
}

interface Emit {
  (e: 'submit', value: MerchantDetails): void;
  (e: 'update:isDialogVisible', value: boolean): void;
}

interface Props {
  cardDetails?: MerchantDetails;
  isDialogVisible: boolean;
  organisationGuid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    merchantName: '',
    organisationGuid: '',
    cLimit: 0,
  }),
  organisationGuid: '',
});

const emit = defineEmits<Emit>();

const defaultMerchantDetails = {
  merchantName: '',
  organisationGuid: props.organisationGuid || '',
  cLimit: 0,
};

const merchantDetails = ref<MerchantDetails>({ ...defaultMerchantDetails });

// Watch for props changes dynamically
watchEffect(() => {
  merchantDetails.value = {
    merchantName: props.cardDetails?.merchantName || '',
    organisationGuid: props.cardDetails?.organisationGuid || props.organisationGuid || '',
    cLimit: props.cardDetails?.cLimit || 0,
  };
});

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarType = ref('success');

// Submit merchant details
const submitMerchant = async () => {
  try {
    const response = await $wallyApi('/merchants', {
      method: 'POST',
      body: merchantDetails.value,
    });

    emit('submit', merchantDetails.value);
    emit('update:isDialogVisible', false);

    showSnackbar.value = true;
    snackbarMessage.value = response?.status || 'Merchant added successfully!';
    snackbarType.value = 'success';
    dialogModelValueUpdate(false)
  } catch (error) {
    showSnackbar.value = true;
    snackbarMessage.value = error?.response?._data.message || 'An error occurred';
    snackbarType.value = 'error';
  }
};

// Close the dialog and reset the fields
const dialogModelValueUpdate = (val: boolean) => {
  if (!val) {
    merchantDetails.value = { ...defaultMerchantDetails };
  }
  emit('update:isDialogVisible', val);
};
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <!-- 👉 Title -->
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            Add new Merchant
          </h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">
          Add your new merchant
        </p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitMerchant">
          <VRow>
            <!-- 👉 Merchant Name -->
            <VCol cols="12">
              <AppTextField v-model="merchantDetails.merchantName" label="Merchant Name" placeholder="Merchant Name" />
            </VCol>

            <!-- 👉 Card actions -->
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit">
                Submit
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="dialogModelValueUpdate(false)">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Snackbar for success or error messages -->
  <VSnackbar v-model="showSnackbar" :color="snackbarType === 'success' ? 'success' : 'error'" location="top" right>
    {{ snackbarMessage }}
  </VSnackbar>
</template>
