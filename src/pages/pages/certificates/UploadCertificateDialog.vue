<script lang="ts" setup>
import { useCertificateStore } from '@/stores/certificate';
import * as forge from 'node-forge';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
  open: Boolean,
  cert: Object,
});

const emit = defineEmits(['close', 'certificateUploaded']);
const dialogVisible = ref(props.open);
const fileInput = ref<File | null>(null);
const certificateInfo = ref(null);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const certificateStore = useCertificateStore();

watch(() => props.open, (newVal) => {
  dialogVisible.value = newVal;
});

const closeDialog = () => {
  fileInput.value = null;
  certificateInfo.value = null;
  emit('close');
};

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const uploadFile = async () => {
  if (fileInput.value) {
    const file = fileInput.value;

    if (file && file.name.endsWith('.cer')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        parseCertificate(arrayBuffer);
      };

      reader.readAsArrayBuffer(file);
    } else {
      showSnackbar('Please upload a valid .cer file', 'error');

    }
  } else {
    showSnackbar('Please select a file to upload.', 'error');
  }
};

const parseCertificate = (arrayBuffer: ArrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  const binaryString = String.fromCharCode.apply(null, bytes);
  const asn1 = forge.asn1.fromDer(binaryString);
  const cert = forge.pki.certificateFromAsn1(asn1);

  const subjectCN = cert.subject.getField('CN').value;
  const validFrom = cert.validity.notBefore.toUTCString();
  const validTo = cert.validity.notAfter.toUTCString();

  certificateInfo.value = {
    passTypeId: subjectCN,
    validFrom,
    validTo,
  };
  uploadCertificateToBackend(fileInput.value);
};

const uploadCertificateToBackend = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await certificateStore.uploadCertificate(formData);

    const { isNFCEnabled, passTypeId, url, validFrom, validTo } = response.data;


    if (props.cert?.id) {
      await certificateStore.updateCertificate(props.cert.id, response.data);
    } else {
      showSnackbar('Error: Certificate ID is undefined', 'error');
    }

    emit('certificateUploaded', {
      id: props.cert.id,
      passTypeId,
      validFrom,
      validTo,
    });

    closeDialog();
  } catch (error) {
    showSnackbar('Error uploading certificate. Please try again.', 'error');
  }
  await certificateStore.fetchCertificates();

};

</script>

<template>
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 600">
    <DialogCloseBtn @click="closeDialog" />

    <VCard>
      <VCardTitle>{{ $t("Upload Certificate") }}</VCardTitle>
      <VDivider class="my-2" />

      <VCardText>
        {{ $t("Please upload the certificate for") }} {{ cert.name }}.
      </VCardText>

      <VCardText class="pt-6">
        <VForm @submit.prevent="uploadFile">
          <VRow>
            <VCol cols="12">
              <VFileInput label="Upload Certificate" v-model="fileInput" accept=".cer" />
            </VCol>
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit">
                {{ $t("Submit") }}
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="closeDialog">
                {{ $t("Cancel") }}
              </VBtn>
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
