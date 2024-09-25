<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardText, VCardTitle, VDialog, VDivider, VIcon } from 'vuetify/components';

const props = defineProps({
  open: Boolean,
  cert: Object,
});
const emit = defineEmits(['close']);

const dialogVisible = ref(props.open);
watch(() => props.open, (newVal) => {
  dialogVisible.value = newVal;
});

const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 900">
    <DialogCloseBtn @click="closeDialog" />
    <VCard class="pa-6">
      <VCardTitle class="text-h5 font-weight-bold">
        Apple Wallet Certificates
      </VCardTitle>
      <VDivider class="my-4" />

      <VCardText class="text-body-1">
        To create passes for Apple Wallet, you need a certificate from Apple. Apple Wallet certificates are
        non-transferable permissions by Apple and cannot be provided by Wally (even for a fee).
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-1-filled" />
        <h4 class="mb-0">Download the Certificate Signing Request (CSR)</h4>
      </div>
      <VCardText>
        In Settings / Certificates, click
        <span class="btn btn-sm btn-primary mx-1">New Apple Wallet Certificate</span>
        and
        <span class="btn btn-sm btn-primary mx-1">Next</span>.
        Using
        <span class="btn btn-sm btn-primary mx-1">Download CSR</span>,
        you can download the certificate signing request.
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-2-filled" />
        <h4 class="mb-0">Upload CSR to Apple, Download Certificate</h4>
      </div>
      <VCardText>
        Sign up for the <a href="https://developer.apple.com/account/">Apple Developer Program</a> (paid membership
        required, $99/year). You don't need a Mac or special software. <br />
        Follow the steps in <a
          href="https://developer.apple.com/help/account/configure-app-capabilities/create-wallet-identifiers-and-certificates#register-a-pass-type-identifier">Apple's
          Guide</a>:
        <ul>
          <li>"Register a Pass Type Identifier"</li>
          <li>"Create a Pass Type ID Certificate"</li>
        </ul>
        Pass Type IDs should contain your reversed domain name, e.g.,
        <span class="btn btn-sm btn-primary mx-1">example.com</span> becomes
        <span class="btn btn-sm btn-primary mx-1">pass.com.example.membershipCard</span>.
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-3-filled" />
        <h4 class="mb-0">Upload Certificate Here</h4>
      </div>
      <VCardText>
        Click
        <span class="btn btn-sm btn-primary mx-1">Upload Certificate</span>,
        select the certificate you downloaded, and press
        <span class="btn btn-sm btn-primary mx-1">Save</span>.
        You can now use the certificate for your passes.
      </VCardText>

      <VDivider class="my-2" />

      <VCardText class="d-flex justify-end">
        <VBtn color="primary" @click="closeDialog">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
