<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import { VBtn, VCard, VCardItem, VCardText, VCardTitle, VCol, VDialog, VForm, VRow, VTextField } from 'vuetify/components';

const name = ref('');
const emit = defineEmits(['submit', 'close']);
const props = defineProps({
  open: Boolean,
});

const submitForm = () => {
  if (name.value) {
    emit('submit', { name: name.value, passType: '', validFromTo: '', certificate: '' });
    name.value = '';
  }
  emit('close');
};
</script>

<template>
  <VDialog v-model="props.open" :width="$vuetify.display.smAndDown ? 'auto' : 600">
    <VCard class="pa-2 pa-sm-10">
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">Add New Apple Wallet Certificate</h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">Add your Apple Wallet certificate details</p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="submitForm">
          <VRow>
            <VCol cols="12">
              <VTextField v-model="name" label="Name" placeholder="Enter certificate name" required />
            </VCol>
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit">Submit</VBtn>
              <VBtn color="secondary" variant="tonal" @click="emit('close')">Cancel</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
