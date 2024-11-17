<script setup lang="ts">
import { ref } from 'vue';
import { useConfigStore } from '@/@core/stores/config';
import { useCampaignStore } from '@/stores/campaign';
import { useMarketingStore } from '@/stores/marketing';
import GooglePhonePreview from './GooglePhonePreview.vue'
import  EmojiPicker  from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css'

const configStore = useConfigStore();
const campaignStore = useCampaignStore();
const marketingStore = useMarketingStore()
const router = useRouter()

const contactMethod = ref('Phone number');
const message = ref<string>('');
const selectedCampaign = ref('');
const notificationData = ref(null);
const showEmojiPicker = ref(false)
const customers = ref([]);
const selectedCustomer = ref([]);
const filterpasses = ref([]);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

watch(
  () => configStore.activeMerchant?.merchantGuid,
  async (newMerchantGuid) => {
    if (newMerchantGuid) {
      try {
        await campaignStore.fetchCampaignByMerchantGuid(newMerchantGuid);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    }
  },
  { immediate: true }
);

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const addEmoji = (emoji: any) => {
  if (emoji.i) {
    message.value += emoji.i;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const messageInput = document.querySelector('.textarea-container') as HTMLElement;
  if (messageInput && !messageInput.contains(event.target as Node)) {
    showEmojiPicker.value = false;
  }
};

const filteredCustomers = computed(() => {
  return Array.isArray(customers.value)
    ? customers.value.filter(customer =>
        Array.isArray(customer.passTypeId) &&
        customer.passTypeId.some(
          pass => pass.passTypeId.trim() === ""
        )
      )
    : [];
});

const fetchCustomersDetails = async (campaignGuid) => {
  try {
    await campaignStore.fetchCustomerByCampaignGuid(campaignGuid);
    customers.value = campaignStore.customers.map(customer => ({
      value: customer.id,
      label: customer.name,
      passTypeId: customer.passes,
    }));
    filterpasses.value = filteredCustomers.value;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

watch(selectedCampaign, (newCampaign) => {
  if (newCampaign) {
    const campaign = campaignStore.campaigns?.find(c => c.campaignName === newCampaign);
    if (campaign) {
      fetchCustomersDetails(campaign.campaignGuid);
    } else {
      customers.value = [];
      filterpasses.value = [];
    }
  }
});


onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

onMounted(async () => {
  try {
    const platform = 'google';
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
    platform: 'google',
    message: message.value,
    customers: selectedCustomer.value,
  };

  try {
    const addedData = await marketingStore.addMarketing(payload);
    notificationData.value = addedData.data;
    showSnackbar(addedData.message, 'success')

    setTimeout(() => {
      router.push('/pages/google-messages');
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
            <VRadio label="Send to particular user(s)" value="specific user" :disabled="!selectedCampaign" />
          </VRadioGroup>
        </VCardText>
        <VCardText>
          <div v-if="contactMethod === 'specific user'" class="mt-4">
            <v-select v-model="selectedCustomer" :items="filteredCustomers" item-title="label" item-value="value"
              label="Select" multiple persistent-hint></v-select>
          </div>
        </VCardText>
      </VCard>

      <VCard title="Message" subtitle="Write message for the campaign" class="mb-6 elevation-0">
        <VCardText>
          <VForm @submit.prevent="sendNotification">
            <VRow>
              <VCol cols="12">
                <div class="textarea-container">
                  <VTextarea v-model="message" label="Message" placeholder="Write message for notification here"
                    ref="messageInput" />
                  <div class="emoji-icon" @click="toggleEmojiPicker">
                    😀
                  </div>
                  <div v-if="showEmojiPicker" class="emoji-picker">
                    <EmojiPicker @select="addEmoji" />
                  </div>
                </div>
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
      <GooglePhonePreview :notificationData="{ message: message }" />
    </VCol>
  </VRow>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>

<style scoped>
.textarea-container {
  position: relative;
}

.emoji-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 20px;
}

.emoji-picker {
  position: absolute;
  bottom: -88px;
  right: 50px;
  z-index: 1000;
}

.emoji-icon:hover {
  opacity: 0.8;
}
</style>
