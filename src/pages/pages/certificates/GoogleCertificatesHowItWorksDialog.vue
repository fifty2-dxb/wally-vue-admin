<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardText, VCardTitle, VDialog, VDivider, VIcon } from 'vuetify/components';

const props = defineProps({
  open: Boolean,
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
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 800">
    <DialogCloseBtn @click="closeDialog" />
    <VCard class="pa-4">
      <VCardTitle class="text-h6 font-weight-bold">
        Google Wallet Issuer Accounts
      </VCardTitle>
      <VDivider class="my-2" />
      <VCardText class="text-body-1">
        To create passes for Google Wallet, you need a free issuer account from Google. ("Google Wallet API Issuer
        Account")
      </VCardText>

      <VDivider class="my-3" />
      <VCardText>
        <strong>Register a Google Wallet issuer account with Wally</strong><br />
        In
        <span class="btn btn-sm btn-primary mx-1">Settings / Certificates</span>
        click
        <span class="btn btn-sm btn-primary mx-1">new Google Wallet Issuer Account</span>,
        enter the required information and press
        <span class="btn btn-sm btn-primary mx-1">save</span>.<br />
        The issuer account will now be verified and approved, after which you can use it for your passes (typically up
        to 24 hours).
      </VCardText>

      <VDivider class="my-4" />
      <VCardText>
        <strong>Or: Register an issuer account with Google</strong>
      </VCardText>
      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-1-filled" />
        <h4 class="mb-0">Follow steps 1-4 in Google’s guide</h4>
      </div>
      <VCardText>
        In step 3, download the “Service Account Key” (file extension .json).
      </VCardText>

      <VDivider class="my-4" />
      <div class="d-flex align-center mb-3">
        <VIcon class="mr-2" icon="tabler-circle-number-2-filled" />
        <h4 class="mb-0">Upload the Service Account Key</h4>
      </div>
      <VCardText>
        In
        <span class="btn btn-sm btn-primary mx-1">Settings / Certificates</span>
        click
        <span class="btn btn-sm btn-primary mx-1">new Google Wallet Issuer Account</span>,
        select the service account key you just downloaded (file extension .json) and press
        <span class="btn btn-sm btn-primary mx-1">save</span>.
      </VCardText>

      <VDivider class="my-2" />
      <VCardText class="d-flex justify-end">
        <VBtn color="primary" @click="closeDialog">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
