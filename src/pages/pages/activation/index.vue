<script setup lang="ts">
import { useActivationStore } from '@/stores/activation';
import { defineEmits, onMounted, ref } from 'vue';
import { VBtn, VCardText, VCardTitle, VCol, VForm, VRow, VSnackbar, VTextField } from 'vuetify/components';

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
const router = useRouter()
const serialNumber = ref(router.currentRoute.value.params.serialNumber); 

const activationStore = useActivationStore();

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

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
    let uri = window.location.href.split('/');
    let slug = uri.pop();
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

const submitForm = async () => {
  const requiredFields = enrollment.value.fields.some(field => !formFields.value[field.title]);

  if (requiredFields) {
    showSnackbar('All fields are required.', 'error');
    return;
  }

  const formattedFormFields = Object.keys(formFields.value).reduce((acc, key) => {
    if (key.toLowerCase() === 'phone number') {
      acc['phonenumber'] = String(formFields.value[key]);
    } else if (key.toLowerCase() === 'emailaddress') {
      acc['email'] = String(formFields.value[key]);
    } else {
      acc[key.toLowerCase()] = String(formFields.value[key]);
    }
    return acc;
  }, {});

  // Add the serialNumber to the form data
  formattedFormFields['serialNumber'] = serialNumber.value;

  try {
    await activationStore.addCustomerActivation(formattedFormFields);
    showSnackbar('Form submitted successfully!', 'success');
    emit('submit');
    enrollment.value.fields.forEach((field: any) => {
      formFields.value[field.title] = '';
    });
    router.push({ name: 'activation-success' });
  } catch (error) {
    showSnackbar(error.response?._data.message, 'error');
    console.error('Error submitting form:', error);
  }
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
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
