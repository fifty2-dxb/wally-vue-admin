<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
  cert: Object,
  open: Boolean
});

const emit = defineEmits(['close']);

const dialogVisible = ref(props.open);
console.log(props);

watch(() => props.open, (newVal) => {
  dialogVisible.value = newVal;
});

const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 750">
    <DialogCloseBtn @click="closeDialog" />
    <VCard>
      <VCardTitle>Google Smart Tap NFC Keys</VCardTitle>
      <VDivider class="my-1" />
      <VCardText>
        Google Wallet NFC passes only work with "Google Smart Tap".<a class="fw-bold" target="_blank"
          href="https://mfi.apple.com/account/reader-search">You can check here</a>
        whether your NFC reader devices support Google Smart Tap.
      </VCardText>
      <VCardText>
        NFC requires a key pair: the private key is stored in the NFC reader, the public key in the Google Wallet pass.
      </VCardText>
      <VCardText>
        With <span class="btn btn-sm btn-primary px-2">new Google Smart Tap NFC Key</span>you can either generate a new
        key pair (and then store the private key in the NFC reader), or upload a public key provided by the manufacturer
        of your NFC reader.
      </VCardText>
      <VCardText>
        Activate NFC in "Pass Settings / NFC" and select the NFC key for your pass there.</VCardText>
      <VDivider class="my-1" />
      <VCardText class="d-flex justify-end">
        <VBtn @click="closeDialog">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
