<script setup lang="ts">
import { defineEmits, onMounted, ref } from 'vue';
import { VBtn, VCardText, VCardTitle, VCol, VForm, VRow, VTextField } from 'vuetify/components';

const emit = defineEmits(['submit', 'close']);
const enrollment = ref({
  design: {},
  fields: [],
});

const formFields = ref<any>({});
const logoSrc = ref('');
const footerLogoSrc = ref('');
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const checkThemeAndSetLogo = () => {
  const theme = document.cookie
    .split('; ')
    .find(row => row.startsWith('Wally-theme='))
    ?.split('=')[1];

  if (theme === 'dark') {
    logoSrc.value = '/images/wally-new-light.png';
    footerLogoSrc.value = '/images/wally-new-light.png';
  } else {
    logoSrc.value = '/images/wally-new-dark.png';
    footerLogoSrc.value = '/images/wally-new-dark.png';
  }
};

const fetchEnrollment = async () => {
  try {

    let uri = window.location.href.split('/')
    let slug = uri.pop()
    const response = await $wallyApi('/events/enrollment/' + slug, { method: 'GET' });
    enrollment.value = response;
    enrollment.value.fields.forEach((field: any) => {
      formFields.value[field.title] = '';
    });
  } catch (error) {
    console.error('Error fetching enrollment data:', error);
    showSnackbar('Failed to fetch enrollment data.', 'error');
  }
};

onMounted(() => {
  checkThemeAndSetLogo();
  fetchEnrollment();
});


const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const submitForm = () => {
  const requiredFields = enrollment.value.fields.some(field => !formFields.value[field.title]);
  if (requiredFields) {
    showSnackbar('All fields are required.', 'error');
    return;
  }

  showSnackbar('Form submitted successfully!', 'success');
  emit('submit');
};
</script>

<template>
  <VContainer class="fill-height d-flex align-center justify-center">
    <VResponsive class="align-center fill-height mx-auto" max-width="400">
      <VImg class="mb-4" height="150" :src="logoSrc" />
      <VCardText :class="enrollment.design.backgroundColor" rounded="lg" elevation="12" class="px-4 py-6">
        <VCardTitle class="text-center text-h5 font-weight-bold mb-4">
          {{ enrollment.design?.title || 'Activate Pass' }}
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="submitForm">
            <div v-for="(field, index) in enrollment.fields" :key="index">
              <VTextField v-model="formFields[field.title]" :label="field.title" :type="field.type || 'text'"
                :variant="enrollment.design?.inputVariant" :density="enrollment.design?.density"
                :class="enrollment.design?.textColor" class="mb-3" required />
            </div>
            <VBtn block class="my-2" :color="enrollment.design?.buttonColor" :variant="enrollment.design?.buttonVariant"
              large type="submit">
              Submit
            </VBtn>
          </VForm>
        </VCardText>
      </VCardText>
      <VRow class="mt-6">
        <VCol cols="12" class="text-center">
          <p class="text-caption font-weight-black">Powered by</p>
          <img :src="footerLogoSrc" height="40" />
        </VCol>
      </VRow>
    </VResponsive>
  </VContainer>
</template>
