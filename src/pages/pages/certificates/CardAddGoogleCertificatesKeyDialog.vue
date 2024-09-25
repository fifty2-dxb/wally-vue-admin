<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';
import { VBtn, VCard, VCardText, VCardTitle, VCheckbox, VDialog, VDivider, VFileInput, VTextField } from 'vuetify/components';

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

const formData = ref({
  name: '',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  agreeToTerms: false,
  serviceAccountKey: null,
});

const handleSubmit = () => {
  if (!formData.value.agreeToTerms) {
    alert("Please agree to the Google Wallet terms before saving.");
    return;
  }
  console.log("Form submitted: ", formData.value);
  closeDialog();
};
</script>

<template>
  <VDialog v-model="dialogVisible" :width="$vuetify.display.smAndDown ? 'auto' : 900">
    <VCard class="pa-6">
      <VCardItem class="mb-2">


        <VCardTitle class="text-h5 font-weight-bold mb-4">
          {{ $t("New Google Wallet Issuer Account for Account") }}
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <div class="d-flex justify-between align-center mb-4">
          <h4 class="text-h6 font-weight-bold">{{ $t("Apply for Google Wallet issuer account") }} </h4>
          <VBtn class="ml-4" color="secondary" @click="() => { }">
            {{ $t("Here's how it works") }}
          </VBtn>
        </div>

      </VCardText>

      <VDivider class="my-2" />

      <VCardText>
        <VTextField v-model="formData.name" label="Name" required outlined class="mb-4" />
        <VTextField v-model="formData.website" label="Website" required outlined class="mb-4" />
        <VTextField v-model="formData.contactName" label="Contact Name" required outlined class="mb-4" />
        <VTextField v-model="formData.contactEmail" label="Contact Email" required outlined class="mb-4" />
        <VTextField v-model="formData.contactPhone" label="Contact Phone (Optional)" outlined class="mb-4" />

        <div class="d-flex align-center">
          <VCheckbox v-model="formData.agreeToTerms" class="mr-2" />
          <span>
            I agree to the
            <a href="https://developers.google.com/wallet/terms-of-service" target="_blank">Google Wallet Terms of
              Service</a>
            and acknowledge the
            <a href="https://payments.developers.google.com/terms/aup" target="_blank">Google Wallet Acceptable Use
              Policy</a>.
          </span>
        </div>
      </VCardText>

      <VDivider class="my-4" />

      <VCardText class="d-flex justify-end">
        <VBtn class="me-4" @click="handleSubmit">{{ $t("Submit") }}</VBtn>
        <VBtn color="secondary" variant="tonal" @click="closeDialog">{{ $t("Cancel") }}</VBtn>
      </VCardText>

      <VDivider class="my-4" />

      <div class="d-flex justify-between align-center mb-4">
        <h4 class="text-h6 font-weight-bold ml-4">{{ $t("Or: Upload Service Account Key") }}</h4>
        <VBtn class="ml-4" color="secondary" @click="() => { }">
          {{ $t("Here's how it works") }}
        </VBtn>
      </div>

      <VDivider class="my-2" />

      <VCardText>
        <VFileInput v-model="formData.serviceAccountKey" label="Google Wallet Service Account Key (.json)"
          accept=".json" required outlined class="mb-4" />
      </VCardText>

      <VDivider class="my-4" />

      <VCardText class="d-flex justify-end">
        <VBtn class="me-4" @click="handleSubmit">{{ $t("Submit") }}</VBtn>
        <VBtn color="secondary" variant="tonal" @click="closeDialog">{{ $t("Cancel") }}</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
