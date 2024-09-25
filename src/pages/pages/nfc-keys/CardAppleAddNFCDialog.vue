<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import { VBtn, VCard, VCardItem, VCardText, VCardTitle, VCol, VDialog, VDivider, VFileInput, VForm, VIcon, VRow, VSwitch } from 'vuetify/components';
const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(['submit', 'close', 'showPassType']);

const name = ref('');
const passTypeId = ref('');
const newToggleKey = ref(false);
const publicKeyText = ref('');
const publicKeyFile = ref<File | null>(null);

const submitForm = () => {
  if (name.value) {
    emit('submit', {
      name: name.value,
      passTypeId: passTypeId.value,
      newToggleKey: newToggleKey.value,
      publicKeyText: publicKeyText.value,
      publicKeyFile,
    });
    resetForm();
  }
  emit('close');
};

const resetForm = () => {
  name.value = '';
  passTypeId.value = '';
  newToggleKey.value = false;
  publicKeyText.value = '';
  publicKeyFile.value = null;
};
</script>

<template>
  <VDialog v-model="props.open" :width="$vuetify.display.smAndDown ? 'auto' : 800">
    <DialogCloseBtn @click="emit('close', false)" />
    <VCard class="pa-6">
      <VCardItem class="text-center mb-6">
        <VCardTitle class="text-h4 font-weight-bold">
          New Apple VAS NFC Key for Account
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VForm @submit.prevent="submitForm">
          <VRow>
            <VCol cols="12" class="mb-4">
              <VBtn variant="outlined" class="mr-2" @click="emit('showPassType', { name: 'Apple Wallet Certificate' })">
                <VIcon icon="tabler-external-link" class="mr-2" />
                Here's how it works
              </VBtn>
            </VCol>

            <VDivider class="my-4" />

            <VCol cols="12" md="6" class="mb-4">
              <AppTextField v-model="name" label="Name" placeholder="Please input name" />
            </VCol>

            <VCol cols="12" md="6" class="mb-4">
              <AppAutocomplete v-model="passTypeId" label="Pass Type ID" placeholder="Please select Pass Type ID" />
            </VCol>

            <VDivider class="my-4" />

            <VCol cols="12" class="mb-4">
              <VSwitch v-model="newToggleKey" label="(1) Create a new key" inset />
              <p class="text-subtitle-2 mt-2">
                Generate a new key pair. The private key must then be saved in the NFC reader device.
              </p>
            </VCol>

            <VDivider class="my-4" />

            <VCol cols="12" class="mb-4">
              <AppTextarea v-model="publicKeyText" label="or: (2) upload public key" placeholder="upload public key" />
              <p class="text-caption mt-2">
                Public key of the NFC reader device as text in the format <br />
                -----BEGIN PUBLIC KEY----- <br />
                ...abc... <br />
                -----END PUBLIC KEY-----
              </p>
            </VCol>

            <VDivider class="my-4" />

            <VCol cols="12" class="mb-4">
              <h5 class="text-h6 font-weight-medium">or: (3) upload public key file</h5>
              <VFileInput v-model="publicKeyFile" label="Upload Public Key File (.pem)" accept=".pem" />
              <p class="text-caption mt-2">
                Public key of the NFC reader device as a .pem file in the format <br />
                -----BEGIN PUBLIC KEY----- <br />
                ...abc... <br />
                -----END PUBLIC KEY-----
              </p>
            </VCol>

            <VDivider class="my-4" />

            <VCol cols="12" class="text-center">
              <VBtn class="mr-4" type="submit" color="primary">
                Next
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="emit('close', false)">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
