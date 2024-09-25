<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import UploadCertificateDialog from './UploadCertificateDialog.vue';

const props = defineProps({
  certificates: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['uploadCertificate', 'downloadCSR', 'showPassType', 'deleteCertificate', 'editCertificate']);
const isUploadDialogOpen = ref(false);
const selectedCert = ref(null);
const isDeleteConfirmationVisible = ref(false);
const certToDelete = ref(null);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const openUploadDialog = (cert) => {
  selectedCert.value = cert;
  isUploadDialogOpen.value = true;
};

const closeUploadDialog = () => {
  isUploadDialogOpen.value = false;
};

const confirmDeleteCertificate = (cert) => {
  certToDelete.value = cert;
  isDeleteConfirmationVisible.value = true;
};

const deleteCertificate = async () => {
  if (certToDelete.value) {
    emit('deleteCertificate', certToDelete.value.id);
    certToDelete.value = null;
    isDeleteConfirmationVisible.value = false;
    showSnackbar('Certificate deleted successfully!', 'success');
  } else {
    showSnackbar('Error: No certificate selected for deletion.', 'error');
  }
};

const cancelDelete = () => {
  isDeleteConfirmationVisible.value = false;
  showSnackbar('Certificate deletion canceled.', 'info');
};

const onCertificateUploaded = (updatedCert) => {
  const cert = props.certificates.find(c => c?.id === updatedCert.id);
  if (cert) {
    cert.passTypeId = updatedCert.passTypeId;
    cert.validFrom = updatedCert.validFrom;
    cert.validTo = updatedCert.validTo;
    showSnackbar('Certificate uploaded successfully!', 'success');
  }
};
</script>

<template>
  <VTable class="text-no-wrap">
    <thead>
      <tr>
        <th>{{ $t("Name") }}</th>
        <th>{{ $t("Pass Type") }}</th>
        <th>{{ $t("Valid From/To") }}</th>
        <th>{{ $t("Used For") }}</th>
        <th>{{ $t("Action") }}</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(cert, index) in certificates" :key="index">
        <td>{{ cert?.name }}</td>
        <td>
          <template v-if="cert?.passTypeId">
            <div>
              {{ cert.passTypeId }}
            </div>
            <div>
              <!-- <div class="py-2">{{ cert?.passTypeId.split(':')[0] }}:</div>
              <div class="py-2">{{ cert?.passTypeId.split(':')[1] }}</div> -->
            </div>
          </template>
          <template v-else>
            <VBtn variant="outlined" @click="$emit('showPassType', cert)">
              <VIcon class="mr-1" icon="tabler-external-link" />
              {{ $t("Here's how it works") }}
            </VBtn>
          </template>
        </td>
        <td>
          <div v-if="cert?.validFromDt && cert?.validTillDt">
            <div class="py-2">{{ cert.validFrom ? cert.validFrom : cert?.validFromDt }}</div>
            <div class="py-2">{{ cert.validTo ? cert.validTo : cert?.validTillDt }}</div>
          </div>
          <VBtn variant="outlined" v-else @click="$emit('downloadCSR', cert.name)">
            {{ $t("Download CSR") }}
          </VBtn>
        </td>
        <td>
          <div v-if="cert?.url">
            {{ cert?.url ? 'Campaign Name' : '' }}
          </div>
          <VBtn variant="outlined" v-else @click="openUploadDialog(cert)">
            {{ $t("Upload Certificate") }}
          </VBtn>
        </td>
        <td>
          <IconBtn @click="$emit('editCertificate', cert)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn @click="confirmDeleteCertificate(cert)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </td>
      </tr>
    </tbody>
  </VTable>

  <UploadCertificateDialog :open="isUploadDialogOpen" :cert="selectedCert" @close="closeUploadDialog"
    @certificateUploaded="onCertificateUploaded" />

  <!-- Delete Confirmation Dialog -->
  <VDialog v-model="isDeleteConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">{{ $t("Are you sure?") }}</VCardTitle>
      <VCardText>
        {{ $t("Do you really want to delete this certificate? This action cannot be undone.") }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="cancelDelete">{{ $t("Cancel") }}</VBtn>
        <VBtn color="error" @click="deleteCertificate">{{ $t("Delete") }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" timeout="3000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
