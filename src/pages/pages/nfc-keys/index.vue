<script setup lang="ts">
import { ref } from 'vue';
import AppleNFCHowItWorks from './AppleNFCHowItWorks.vue';
import AppleNFCTable from './AppleNFCTable.vue';
import CardAppleAddNFCDialog from './CardAppleAddNFCDialog.vue';
import GoogleNFCHowItWorksDialog from './GoogleNFCHowItWorksDialog.vue';
import GoogleNFCTable from './GoogleNFCTable.vue';

const defaultCertificates = [
  {
    name: 'Wally API Key',
    passType: 'Wally Type',
    validFromTo: '2021-01-01 to 2022-01-01',
    certificate: '',
  },
  {
    name: 'Example API Key',
    passType: 'Example Type',
    validFromTo: '2022-02-01 to 2023-02-01',
    certificate: '',
  }
];

const certificates = ref(JSON.parse(localStorage.getItem('appleCertData')) || defaultCertificates);

const appleDialogOpen = ref(false);
const googleDialogOpen = ref(false);
const showAppleHowItWorks = ref(false);
const showGoogleHowItWorks = ref(false);
const currentCert = ref(null);

const openAppleDialog = () => {
  appleDialogOpen.value = true;
};

const openGoogleDialog = () => {
  googleDialogOpen.value = true;
};

const showApplePassType = (cert) => {
  currentCert.value = cert;
  showAppleHowItWorks.value = true;
};

const showGooglePassType = (cert) => {
  currentCert.value = cert;
  showGoogleHowItWorks.value = true;
};

const downloadCSR = (name) => {
  alert(`Downloading CSR for ${name}`);
};

const uploadCertificate = (event, index) => {
  const file = event?.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
      certificates.value[index].certificate = contents;
      localStorage.setItem('appleCertData', JSON.stringify(certificates.value));
    };
    reader.readAsText(file);
  }
};

const closeAppleHowItWorks = () => {
  showAppleHowItWorks.value = false;
};

const closeGoogleHowItWorks = () => {
  showGoogleHowItWorks.value = false;
};
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex justify-between align-center">
      <h4 class="text-h4 font-weight-medium">Apple VAS NFC Keys</h4>
      <VBtn color="secondary" class="ml-4" @click="showApplePassType({ name: 'Apple Wallet Certificate' })">
        <VIcon icon="tabler-external-link" />
        Here's how it works
      </VBtn>
    </div>
    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="openAppleDialog">New Apple VAS NFC Key</VBtn>
    </div>
  </div>
  <VRow>
    <VCol cols="12">
      <AppleNFCTable class="mb-8" :certificates="certificates" @downloadCSR="downloadCSR"
        @uploadCertificate="uploadCertificate" @showPassType="showApplePassType" />
    </VCol>
  </VRow>
  <CardAppleAddNFCDialog :open="appleDialogOpen" @submit="" @close="appleDialogOpen = false" />
  <AppleNFCHowItWorks v-if="showAppleHowItWorks" :cert="currentCert" :open="showAppleHowItWorks"
    @close="closeAppleHowItWorks" />

  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex justify-between align-center">
      <h4 class="text-h4 font-weight-medium">Google Smart Tap NFC Keys</h4>
      <VBtn color="secondary" class="ml-4" @click="showGooglePassType({ name: 'Google Wallet Certificate' })">
        <VIcon icon="tabler-external-link" />
        Here's how it works
      </VBtn>
    </div>
    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="openGoogleDialog">New Google Smart Tap NFC Key</VBtn>
    </div>
  </div>
  <VRow>
    <VCol cols="12">
      <GoogleNFCTable :certificates="certificates" @downloadCSR="downloadCSR" @uploadCertificate="uploadCertificate"
        @showPassType="showGooglePassType" />
    </VCol>
  </VRow>
  <CardAddNFCKeys :open="googleDialogOpen" @submit="" @close="googleDialogOpen = false" />

  <GoogleNFCHowItWorksDialog v-if="showGoogleHowItWorks" :cert="currentCert" :open="showGoogleHowItWorks"
    @close="closeGoogleHowItWorks" />
</template>
