<script setup lang="ts">
import { useCertificateStore } from '@/stores/certificate';
import { ref } from 'vue';
import AppleCertificatesHowItWorksDialog from './AppleCertificatesHowItWorksDialog.vue';
import AppleCertificatesTable from './AppleCertificatesTable.vue';
import CardAddAppleCertificatesKeyDialog from './CardAddAppleCertificatesKeyDialog.vue';
import CardAddGoogleCertificatesKeyDialog from './CardAddGoogleCertificatesKeyDialog.vue';
import GoogleCertificateTable from './GoogleCertificateTable.vue';
import GoogleCertificatesHowItWorksDialog from './GoogleCertificatesHowItWorksDialog.vue';

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

const openAppleDialog = ref(false);
const showAppleHowItWorks = ref(false);
const currentAppleCert = ref(null);

const openGoogleDialog = ref(false);
const showGoogleHowItWorks = ref(false);
const currentGoogleCert = ref(null);
const certificateStore = useCertificateStore();

const openAppleDialogForNew = () => {
  currentAppleCert.value = null;
  openAppleDialog.value = true;
};

const openAppleDialogForEdit = (cert) => {
  currentAppleCert.value = cert;
  openAppleDialog.value = true;
};

const openGoogleDialogFunc = () => {
  openGoogleDialog.value = !openGoogleDialog.value;
};

const showApplePassType = (cert) => {
  currentAppleCert.value = cert;
  showAppleHowItWorks.value = true;
};

const showGooglePassType = (cert) => {
  currentGoogleCert.value = cert;
  showGoogleHowItWorks.value = true;
};

const handleGoogleFormSubmit = (formData) => {
  openGoogleDialog.value = false;
};

const downloadCSR = (name) => {
  alert(`Downloading CSR for ${name}`);
};

const uploadCertificate = (event, index) => {
  const file = event.target.files[0];
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

const openAppleDialogFunc = () => {
  openAppleDialog.value = !openAppleDialog.value;
};

onMounted(async () => {
  await certificateStore.fetchCertificates();
});

const handleDownloadCSR = async (certName) => {
  const payload = {
    name: 'wally',
    commonName: certName,
    organisationName: 'WallyFit',
  };

  try {
    const csrContent = await certificateStore.downloadCSRCertificate(payload);
    const blob = new Blob([csrContent], { type: 'application/x-pkcs10' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${certName}.certSigningRequest`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    throw error
  }
};

const handleDeleteCertificate = async (id) => {
  await certificateStore.deleteCertificate(id);
};
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
      <div class="d-flex justify-between align-center">
        <h4 class="text-h4 font-weight-medium">{{ $t("Apple Wallet Certificates") }}</h4>
        <VBtn color="secondary" class="ml-4" @click="showApplePassType({ name: 'Apple Wallet Certificate' })">
          <VIcon icon="tabler-external-link" />
          {{ $t("Here's how it works") }}
        </VBtn>
      </div>
      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn @click="openAppleDialogForNew">{{ $t("New Apple Wallet Certificate") }}</VBtn>
      </div>
    </div>
    <VRow>
      <VCol cols="12">
        <AppleCertificatesTable :certificates="certificateStore.certificates" @downloadCSR="handleDownloadCSR"
          @uploadCertificate="uploadCertificate" @showPassType="showApplePassType"
          @deleteCertificate="handleDeleteCertificate" @editCertificate="openAppleDialogForEdit" />
      </VCol>
    </VRow>

    <CardAddAppleCertificatesKeyDialog v-model:open="openAppleDialog" :editCertificate="currentAppleCert"
      @close="openAppleDialogFunc" />
    <AppleCertificatesHowItWorksDialog v-if="showAppleHowItWorks" :cert="currentAppleCert" :open="showAppleHowItWorks"
      @close="closeAppleHowItWorks" />

    <!-- Google Section -->
    <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6 mt-4">
      <div class="d-flex justify-between align-center">
        <h4 class="text-h4 font-weight-medium">{{ $t("Google Wallet Issuer Accounts") }}</h4>
        <VBtn color="secondary" class="ml-4" @click="showGooglePassType({ name: 'Google Wallet Certificate' })">
          <VIcon icon="tabler-external-link" />
          {{ $t("Here's how it works") }}
        </VBtn>
      </div>
      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn @click="openGoogleDialogFunc">{{ $t("New Google Wallet Issuer Account") }}</VBtn>
      </div>
    </div>
    <VRow>
      <VCol cols="12">
        <GoogleCertificateTable :certificates="certificates" @downloadCSR="downloadCSR"
          @uploadCertificate="uploadCertificate" @showPassType="showGooglePassType" />
      </VCol>
    </VRow>

    <CardAddGoogleCertificatesKeyDialog :open="openGoogleDialog" @submit="handleGoogleFormSubmit"
      @close="openGoogleDialogFunc" />

    <GoogleCertificatesHowItWorksDialog v-if="showGoogleHowItWorks" :cert="currentGoogleCert"
      :open="showGoogleHowItWorks" @close="closeGoogleHowItWorks" />
  </div>
</template>
