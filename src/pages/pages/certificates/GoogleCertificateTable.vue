<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import UploadCertificateDialog from './UploadCertificateDialog.vue';

const props = defineProps({
  certificates: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['uploadCertificate', 'downloadCSR', 'showPassType']);

const isUploadDialogOpen = ref(false);
const selectedCert = ref(null);

const openUploadDialog = (cert) => {
  selectedCert.value = cert;
  isUploadDialogOpen.value = true;
};

const closeUploadDialog = () => {
  isUploadDialogOpen.value = false;
};

</script>

<template>
  <VTable class="text-no-wrap">
    <thead>
      <tr>
        <th>{{ $t("Name") }}</th>
        <th>{{ $t("Redemption Issuer / Key Id") }}</th>
        <th>{{ $t("Issuer ID") }}</th>
        <th>{{ $t("Used For") }}</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(cert, index) in certificates" :key="index">
        <td>{{ cert.name }}</td>

        <td>
          <template v-if="cert.passType">
            {{ cert.passType }}
          </template>
          <template v-else>
            <VBtn variant="outlined" @click="$emit('showPassType', cert)">
              <VIcon class="mr-1" icon="tabler-external-link" />
              {{ $t("Here's how it works") }}
            </VBtn>
          </template>
        </td>

        <td>
          <div v-if="cert.validFromTo">
            {{ cert.validFromTo }}
          </div>
          <div v-else>
            <h4>{{ $t("Waiting for Approval") }}</h4>
          </div>
        </td>

        <td>
          <!-- <div v-if="cert.usedFor">
            {{ cert.usedFor }}
          </div>
          <VBtn variant="outlined" v-else @click="openUploadDialog(cert)">
            Upload Certificate
          </VBtn> -->
        </td>
      </tr>
    </tbody>
  </VTable>
  <UploadCertificateDialog :open="isUploadDialogOpen" :cert="selectedCert" @close="closeUploadDialog" />
</template>
