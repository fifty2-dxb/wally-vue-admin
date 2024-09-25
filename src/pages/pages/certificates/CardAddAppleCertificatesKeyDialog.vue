<script setup lang="ts">
import { useCertificateStore } from '@/stores/certificate';
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardItem, VCardText, VCardTitle, VCol, VDialog, VForm, VRow, VTextField } from 'vuetify/components';

const name = ref('');
const url = ref('Url of the location');
const basePassTypeId = ref('pass.com.wally.example');
const passTypeCounter = ref(0);
const passTypeId = ref('');
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const emit = defineEmits(['submit', 'close', 'update:open']);
const props = defineProps({
  open: Boolean,
  editCertificate: Object,
});

const open = ref(props.open);

watch(() => props.open, (newValue) => {
  open.value = newValue;
});

watch(open, (newValue) => {
  emit('update:open', newValue);
});

const certificateStore = useCertificateStore();

watch(() => props.editCertificate, (newCertificate) => {
  if (newCertificate) {
    name.value = newCertificate.name;
    url.value = newCertificate.url;
    passTypeId.value = newCertificate.passTypeId;
  } else {
    resetForm();
  }
});

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const resetForm = () => {
  name.value = '';
  url.value = 'Url of the location';
  passTypeId.value = '';
  passTypeCounter.value = 0;
};

const submitForm = async () => {
  if (name.value) {
    const certificateData = {
      name: name.value,
      passTypeId: '',
      url: '',
    };

    try {
      if (props.editCertificate) {
        await certificateStore.updateCertificate(props.editCertificate.id, certificateData);
        showSnackbar('Certificate updated successfully!', 'success');
      } else {
        await certificateStore.addCertificate(certificateData);
        showSnackbar('Certificate added successfully!', 'success');
      }

      resetForm();
      emit('close');
    } catch (error) {
      showSnackbar('Failed to submit certificate. Please try again.', 'error');
    }
  } else {
    showSnackbar('Name is required to submit the certificate.', 'error');
  }

  await certificateStore.fetchCertificates();
};
</script>

<template>
  <VDialog v-model="open" :width="$vuetify.display.smAndDown ? 'auto' : 600">
    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">{{ props.editCertificate ? 'Edit Apple Wallet Certificate' :
    'Add New Apple Wallet Certificate' }}</h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">{{ props.editCertificate ? 'Update your Apple Wallet certificate details' :
    'Add your Apple Wallet certificate details' }}</p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitForm">
          <VRow>
            <VCol cols="12">
              <VTextField v-model="name" label="Name" placeholder="Enter certificate name" required />
            </VCol>
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit">{{ props.editCertificate ? 'Update' : 'Submit' }}</VBtn>
              <VBtn color="secondary" variant="tonal" @click="emit('close')">Cancel</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" timeout="3000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
