<script setup lang="ts">
import { ref, watch, toRaw, watchEffect } from 'vue';

interface Details {
  organisation: {};
  organisationGuid: string;
  number: string | number;
  name: string;
  expiry: string;
  cvv: string;
  isPrimary: boolean;
  type: string;
  cLimit: number;
  mLimit: number;
}

interface Emit {
  (e: 'submit', value: Details): void;
  (e: 'update:isDialogVisible', value: boolean): void;
}

interface Props {
  cardDetails?: Details;
  isDialogVisible: boolean;
  organisation?: { organisationName?: string };
  organisationGuid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  cardDetails: () => ({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    isPrimary: false,
    type: '',
    cLimit: 0,
    mLimit: 0,
    organisation: {},
  }),
  organisationGuid: '',
});

const emit = defineEmits<Emit>();

const cardDetails = ref<Details>(structuredClone(toRaw(props.cardDetails)));

watch(() => props.isDialogVisible, (newValue) => {
  if (!newValue) {
    // Clear input fields when dialog is closed
    cardDetails.value = structuredClone(toRaw(props.cardDetails));
  }
});

watch(() => props, () => {
  cardDetails.value = structuredClone(toRaw(props.cardDetails));
});

watchEffect(() => {
  cardDetails.value.name = props.organisation?.organisationName || '';
});

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarType = ref('success');

const formSubmit = async () => {
  try {
    let res;
    if (props.organisationGuid) {
      // Edit existing organisation
      res = await $wallyApi(`/organisations/${props.organisationGuid}`, {
        method: 'PATCH',
        body: {
          organisationName: cardDetails.value.name,
          cLimit: cardDetails.value.cLimit,
          mLimit: cardDetails.value.mLimit,
        },
      });
      snackbarMessage.value = res?.status || 'Organisation updated successfully!';
    } else {
      // Create new organisation
      res = await $wallyApi('/organisations', {
        method: 'POST',
        body: {
          organisationName: cardDetails.value.name,
          cLimit: cardDetails.value.cLimit,
          mLimit: cardDetails.value.mLimit,
        },
      });
      snackbarMessage.value = res?.status || 'Organisation added successfully!';
    }

    emit('submit', cardDetails.value);
    emit('update:isDialogVisible', false);

    showSnackbar.value = true;
    snackbarType.value = 'success';
  } catch (error) {
    showSnackbar.value = true;
    snackbarMessage.value = error?.response?._data.message || 'An error occurred';
    snackbarType.value = 'error';
  }
};

const dialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val);
};
</script>

<template>
  <VDialog :width="$vuetify.display.smAndDown ? 'auto' : 600" :model-value="props.isDialogVisible"
    @update:model-value="dialogModelValueUpdate">
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-2 pa-sm-10">
      <!-- 👉 Title -->
      <VCardItem class="text-center">
        <VCardTitle>
          <h4 class="text-h4 mb-2">
            {{ props.organisationGuid ? 'Edit Organisation' : 'Add New Organisation' }}
          </h4>
        </VCardTitle>
        <p class="text-body-1 mb-0">
          {{ props.organisationGuid ? 'Edit your organisation details' : 'Add a new organisation' }}
        </p>
      </VCardItem>

      <VCardText class="pt-6">
        <VForm @submit.prevent="() => { }">
          <VRow>
            <!-- Organisation Name -->
            <VCol cols="12">
              <AppTextField v-model="cardDetails.name" label="Organisation Name" placeholder="My Company" />
            </VCol>

            <!-- Card actions -->
            <VCol cols="12" class="text-center">
              <VBtn class="me-4" type="submit" @click="formSubmit">
                Submit
              </VBtn>
              <VBtn color="secondary" variant="tonal" @click="dialogModelValueUpdate(false)">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Snackbar for success or error messages -->
  <VSnackbar v-model="showSnackbar" :color="snackbarType === 'success' ? 'success' : 'error'" location="top" right>
    {{ snackbarMessage }}
  </VSnackbar>
</template>
