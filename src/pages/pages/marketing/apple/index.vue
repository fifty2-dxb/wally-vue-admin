<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfigStore } from '@/@core/stores/config';
import { useCampaignStore } from '@/stores/campaign';
import { useMarketingStore } from '@/stores/marketing';
import ApplePhonePreview from './ApplePhonePreview.vue'

const configStore = useConfigStore();
const campaignStore = useCampaignStore();
const marketingStore = useMarketingStore();
const router = useRouter()

const contactMethod = ref('Phone number');
const message = ref<string>('');
const selectedCampaign = ref('');
const notificationData = ref(null);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

onMounted(async () => {
  try {
    const platform = 'apple';
    const merchantGuid = configStore.activeMerchant?.merchantGuid;
    await marketingStore.fetchMarketingData(platform, merchantGuid);
  } catch (error) {
    console.error("Error fetching marketing data:", error);
  }
});

const sendNotification = async () => {
  const payload = {
    campaignGuid: campaignStore.campaigns.find(c => c.campaignName === selectedCampaign.value)?.campaignGuid || '',
    merchantGuid: configStore.activeMerchant?.merchantGuid,
    platform: 'apple',
    message: message.value,
  };

  try {
    const addedData = await marketingStore.addMarketing(payload);
    notificationData.value = addedData.data;
    showSnackbar(addedData.message, 'success')

    setTimeout(() => {
      router.push('/pages/apple-messages');
    }, 2000);
    
  } catch (error) {
    showSnackbar(error, 'error')
  }
};
</script>

<template>
  <VRow>
    <VCol cols="12" lg="8">
      <VCard title="Select Campaign" subtitle="Select the campaign to send notification to" class="mb-6">
        <VSelect class="mb-10 pl-2 px-4" density="compact" v-model="selectedCampaign"
          :items="campaignStore.campaigns.map(c => c.campaignName)" placeholder="Select Campaign" label="Campaign" />
      </VCard>

      <VCard title="Audience" subtitle="Select the campaign for marketing." class="mb-6">
        <VCardText>
          <VRadioGroup v-model="contactMethod" class="mb-4">
            <VRadio label="Send to all the users of the campaign" value="all campaign user" />
            <VRadio label="Send to particular user(s)" value="specific user" />
          </VRadioGroup>
        </VCardText>
      </VCard>

      <VCard title="Message" subtitle="Write message for the campaign" class="mb-6 elevation-0">
        <VCardText>
          <VForm @submit.prevent="sendNotification">
            <VRow>
              <VCol cols="12">
                <AppTextarea v-model="message" label="Message" type="text"
                  placeholder="Write message for notification here" />
              </VCol>
              <VCol cols="12" class="d-flex gap-4">
                <VBtn type="submit">
                  {{$t("Submit")}}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <v-divider vertical></v-divider>
    <VCol cols="12" lg="4" class="lg:order-last">
      <ApplePhonePreview :notificationData="{ message: message }" />
    </VCol>
  </VRow>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
