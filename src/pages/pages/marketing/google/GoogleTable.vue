<script setup lang="ts">
import { ref, watch } from 'vue';
import { useConfigStore } from '@/@core/stores/config';
import { useMarketingStore } from '@/stores/marketing';

const configStore = useConfigStore();
const marketingStore = useMarketingStore();

const loading = ref(true);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const debounce = (func: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const fetchMarketingData = debounce(async (platform: string, merchantGuid: string) => {
  loading.value = true;
  try {
    await marketingStore.fetchMarketingData(platform, merchantGuid);
  } catch (error) {
    console.error('Error fetching marketing data:', error);
  } finally {
    loading.value = false;
  }
}, 300);

watch(
  () => configStore.activeMerchant?.merchantGuid,
  (merchantGuid) => {
    if (merchantGuid) {
      fetchMarketingData('google', merchantGuid);
    }
  },
  { immediate: true }
);

const sendMessage = async (marketingGuid: string) => {
  try {
    const response = await marketingStore.sendMarketingMessage({}, marketingGuid);
    showSnackbar(response.message, 'success');

    const merchantGuid = configStore.activeMerchant?.merchantGuid;
    if (merchantGuid) {
      fetchMarketingData('google', merchantGuid);
    }
  } catch (error) {
    console.error('Error Sending Message:', error);
    showSnackbar('Error Sending Message', 'error');
  }
};

const headers = [
  { title: 'Message', key: 'message' },
  { title: 'Platform', key: 'platform' },
  { title: 'Actions', key: 'actions' },
];
</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t("Push Notifications for Google Platform") }}
      </h4>
      <div class="text-body-1">
        {{ $t("Below are all messages of your campaign") }}
      </div>
    </div>

    <div class="d-flex gap-4 align-center flex-wrap">
      <VBtn @click="$router.push('/pages/marketing/google')">{{ $t("Create New Message") }}</VBtn>
    </div>
  </div>

  <VCard class="mb-6">
    <VCardText class="px-3">
      <VRow>
        <VCol>
          <template v-if="loading">
            <div class="text-center py-4">
              <VProgressCircular indeterminate color="primary" />
              <div>{{ $t("Loading...") }}</div>
            </div>
          </template>
          <template v-else>
            <VDataTable :headers="headers" :items="marketingStore.marketingData" density="compact" :items-per-page="5">
              <template v-slot:item.platform="{ item }">
                <div v-if="item.platform === 'google'" class="d-flex align-center">
                  <img class="icon-styling" src="/images/svg/google-icon-logo.svg" alt="Google Icon" />
                </div>
                <div v-else>
                  {{ item.platform }}
                </div>
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <IconBtn :disabled="item.isSent" :class="{ 'cursor-not-allowed': item.isSent }"
                    @click="() => !item.isSent && sendMessage(item.marketingGuid)">
                    <VIcon icon="tabler-send-2" />
                  </IconBtn>
                </div>
              </template>
            </VDataTable>
          </template>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>

<style lang="scss" scoped>
.icon-styling {
  width: 24px;
  height: 24px;
  margin-left: 20px;
}

.cursor-not-allowed {
  cursor: not-allowed !important;
}
</style>
