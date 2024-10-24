<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfigStore } from '@/@core/stores/config';
import { useReaderstore } from '@/stores/reader';

const readerStore = useReaderstore();
const configStore = useConfigStore();

const isNewReaderVisible = ref(false);
const isEditReaderVisible = ref(false);
const selectedReader = ref(null);
const readers = ref([]);

const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const isDeleteReaderConfirmationVisible = ref(false);
const selectedReaderGuid = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const loadReaders = async () => {
  try {
    const merchantGuid = configStore.activeMerchant?.merchantGuid;
    await readerStore.fetchReaders(merchantGuid);
    readers.value = readerStore.readers;
  } catch (error) {
    console.error("Error loading readers:", error);
  }
};

watch(
  () => configStore.activeMerchant?.merchantGuid,
  async (newMerchantGuid) => {
    if (newMerchantGuid) {
      await loadReaders();
    }
  },
  { immediate: true }
);

const handleEditReader = (reader) => {
  isEditReaderVisible.value = true;
  selectedReader.value = { ...reader };
};

const handleAddReader = () => {
  isNewReaderVisible.value = true;
  selectedReader.value = null;
};

const handleDeleteReader = (readerGuid) => {
  selectedReaderGuid.value = readerGuid;
  isDeleteReaderConfirmationVisible.value = true;
};

const confirmDeleteReader = async () => {
  try {
    await readerStore.deleteReader(selectedReaderGuid.value);
    showSnackbar('Reader deleted Successfully', 'success');
    loadReaders();
  } catch (error) {
    console.error("Error deleting reader:", error);
    showSnackbar('Failed to delete reader!', 'error');
  } finally {
    isDeleteReaderConfirmationVisible.value = false;
  }
};

const handleModalClose = () => {
  isNewReaderVisible.value = false;
  isEditReaderVisible.value = false;
};
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">{{ $t("NFC Readers") }}</h4>
      <div class="text-body-1">{{ $t("View and manage your individual readers") }}</div>
    </div>
    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="handleAddReader">
        {{ $t("Add New Reader") }}
      </VBtn>
    </div>
  </div>

  <VTable>
    <thead>
      <tr>
        <th>{{ $t("Reader Name") }}</th>
        <th>{{ $t("Reader Description") }}</th>
        <th>{{ $t("Serial Number") }}</th>
        <th>{{ $t("Actions") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in readers" :key="item?.readerGuid">
        <td>{{ item?.readerName }}</td>
        <td>{{ item?.readerDescription }}</td>
        <td>{{ item?.serialNumber }}</td>
        <td>
          <VIcon icon="tabler-pencil" @click="handleEditReader(item)" />
          <VIcon icon="tabler-trash" class="ml-4" @click="handleDeleteReader(item.readerGuid)" />
        </td>
      </tr>
    </tbody>
  </VTable>

  <CardAddEditReader v-if="isNewReaderVisible" :model-value="isNewReaderVisible" @close="handleModalClose"
    @submit="loadReaders" :showSnackbar="showSnackbar" />

  <CardAddEditReader v-if="isEditReaderVisible" :model-value="isEditReaderVisible" :reader="selectedReader"
    @close="handleModalClose" @submit="loadReaders" :showSnackbar="showSnackbar" />

  <VDialog v-model="isDeleteReaderConfirmationVisible" width="400">
    <VCard>
      <VCardTitle class="headline">{{ $t("Are you sure?") }}</VCardTitle>
      <VCardText>
        {{ $t("Do you really want to delete this reader? This action cannot be undone.") }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="secondary" @click="isDeleteReaderConfirmationVisible = false">
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn color="error" @click="confirmDeleteReader">{{ $t("Delete") }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" timeout="4000" location="right top">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
