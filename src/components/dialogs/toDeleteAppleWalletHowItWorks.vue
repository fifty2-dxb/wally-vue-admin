<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';

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
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 600">
    <DialogCloseBtn @click="closeDialog" />
    <VCard>
      <VCardTitle>Apple VAS NFC Keys</VCardTitle>
      <VDivider class="my-1" />
      <VCardText>
        Apple Wallet NFC passes are compatible only with "Apple VAS". You can verify if your NFC reader devices support
        Apple VAS by <a class="fw-bold" target="_blank" href="https://mfi.apple.com/account/reader-search">checking
          here</a>.
      </VCardText>

      <VCardText>
        You will also need an Apple Wallet certificate that supports NFC. These certificates can only be obtained after
        receiving <a class="fw-bold" target="_blank" href="https://developer.apple.com/contact/passkit/">prior approval
          from Apple.</a>
        The
        <VIcon class="tabler-wifi" />

        NFC symbol in <a href="/en/account/019204cb-d407-76d3-bdc9-8045430f97e8/certificates">Settings /
          Certificates</a> indicates whether your certificate supports NFC.
      </VCardText>

      <VCardText>
        NFC functionality requires a key pair: the private key is stored in the NFC reader, while the public key is
        stored in the Apple Wallet pass.
      </VCardText>

      <VCardText>
        By selecting <span class="btn btn-sm btn-primary px-2">New Apple VAS NFC Key</span>, you can either generate a
        new key pair and store the private key in the NFC reader or upload a public key provided by your NFC reader's
        manufacturer.
      </VCardText>

      <VCardText>
        Enable NFC in "Pass Settings / NFC" and choose the appropriate NFC key for your pass.
      </VCardText>
      <VDivider class="my-1" />
      <VCardText class="d-flex justify-end">
        <VBtn @click="closeDialog">Ok</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
