<script setup lang="ts">
import { ref, onMounted } from 'vue';
import html2canvas from 'html2canvas'; // Import html2canvas
import WallyStepHeader from '@/components/global/WallyStepHeader.vue';
import { useConfigStore } from '@/@core/stores/config';
import { useRouter, useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaign';
import CampaignSettings from '@/components/campaign/CampaignSettings.vue';

declare const $wallyApi: any; // Declare $wallyApi if not already declared

const router = useRouter();
const route = useRoute();
const campaignGuid = route.params.id;
const campaignStore = useCampaignStore();

const currentStep = ref(0);
const loading = ref(true);

const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const errors = ref({
  icon: false,
  logo: false,
  reward: false,
  stripImagePreviewApple: false,
  stripImagePreviewGoogle: false
});

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const steps = [
  { title: 'Card Design', icon: 'tabler-artboard' },
  { title: 'Fields', icon: 'tabler-list-details' },
  { title: 'Additional Info', icon: 'tabler-info-square' },
  { title: 'Enrollment Form', icon: 'tabler-user-plus' },
  { title: 'Settings', icon: 'tabler-settings' },
  { title: 'Done', icon: 'tabler-square-rounded-check' },
];

const loyaltyData = ref({
  template: {},
  styleSettings: {},
  validFromDt: {},
  validTillDt: {}
});

const configStore = useConfigStore();
const saving = ref(false);

const fetchCampaignById = async (campaignGuid: string) => {
  try {
    await campaignStore.fetchCampaignByCampaignGuid(campaignGuid);
    const campaign = campaignStore.campaigns.find(c => c.campaignGuid === campaignGuid);

    if (campaign) {
      loyaltyData.value = {
        ...campaign,
        template: campaign.styleSettings || {},
      };
      loading.value = false;
    }
  } catch (error: any) {
    showSnackbar(error.response?._data?.message || 'Error fetching campaign', 'error');
    loading.value = false;
  }
};

onMounted(() => {
  fetchCampaignById(campaignGuid);
});

// Function to convert Data URL to Blob
function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]); // atob decodes base64
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

const saveCampaign = async () => {
  if (!validateForm()) {
    return;
  }
  const merchantId = configStore.activeMerchant?.merchantGuid;
  const appleSettings = {
    webServiceURL: "https://dev-api.wally.ae/",
    teamIdentifier: "772239U7XT",
    sharingProhibited: false,
    passTypeIdentifier: "pass.com.wally.loyalty",
    authenticationToken: "Lu@ByGo9G6QMepMKQxA4",
    associatedStoreIdentifiers: [],
  };

  const postBody = {
    merchantGuid: merchantId,
    styleSettings: { type: "stamp", ...loyaltyData.value.template, appleSettings },
    validFromDt: loyaltyData.value.validFromDt,
    validTillDt: loyaltyData.value.validTillDt,
  };

  try {
    saving.value = true;

    // Get the DOM element with id 'applePreview'
    const element = document.getElementById('applePreview');

    if (!element) {
      throw new Error('Preview element not found');
    }

    // Capture screenshot
    const canvas = await html2canvas(element,{useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const blob = dataURLtoBlob(dataUrl);

    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');

    const response = await $wallyApi('/photo', {
      method: 'POST',
      body: formData,
    });

    const imageUrl = response.url;

    // Assign the imageUrl to styleSettings in postBody
    postBody.styleSettings.campaignPreview = imageUrl;

    // Proceed with saving the campaign
    await campaignStore.updateCampaign(campaignGuid, postBody);
    saving.value = false;
    router.push('/pages/campaigns');
  } catch (error: any) {
    saving.value = false;
    showSnackbar('Failed to update campaign', 'error');
  }
};

const validateForm = () => {
    errors.value.icon = !loyaltyData.value.template.properties.icon;
    errors.value.logo = !loyaltyData.value.template.properties.logo;

    if (loyaltyData.value.template.type === 'membership') {
      errors.value.stripImagePreviewApple = !loyaltyData.value.template.properties.stripImagePreviewApple;
      errors.value.stripImagePreviewGoogle = !loyaltyData.value.template.properties.stripImagePreviewGoogle;
      errors.value.reward = false;
    } else {
      errors.value.reward = !loyaltyData.value.template.properties.reward;
      errors.value.stripImagePreviewApple = false;
      errors.value.stripImagePreviewGoogle = false;
    }

    if (
      errors.value.icon ||
      errors.value.logo ||
      errors.value.reward ||
      errors.value.stripImagePreviewApple ||
      errors.value.stripImagePreviewGoogle
    ) {
      showSnackbar('Please fill in all the required fields in the "Card Design" tab', 'error');
      return false;
    }

    return true;
  };

  const requiredFieldsFilled = computed(() => {
    const { properties, type } = loyaltyData.value.template;
    return (
      properties.logo && 
      properties.icon && 
      (type === 'membership'
        ? properties.stripImagePreviewApple && properties.stripImagePreviewGoogle
        : properties.reward
      )
    );
  });

  watch(() => loyaltyData.value.template.properties, (newProperties) => {
    if (requiredFieldsFilled.value) {
    } else {
      console.log("Some required fields are still missing.");
    }
  }, { deep: true });

  const goToNextStep = () => {
    if (requiredFieldsFilled.value) {
      currentStep.value++;
    } else {
      showSnackbar("Please fill in all required fields before proceeding.", 'error');
    }
  };

</script>

<template>
  <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Update Campaign') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Update a loyalty card campaign') }}
      </div>
    </div>
  </div>

  <v-row v-if="loading">
    <v-col cols="12" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <v-row v-else>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <WallyStepHeader v-model:activeTab="currentStep" :steps="steps" :disabledField="!requiredFieldsFilled" />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-row>
          <v-col cols="12" :lg="currentStep == 5 ? '12' : '8'" class="elevation-0">
            <div v-if="currentStep == 0">
              <CardDesign v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 1">
              <CardFields v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 2">
              <CardAdditional v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 3">
              <EnrollmentForm v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 4">
              <CampaignSettings v-model="loyaltyData" />
            </div>            
            <div v-if="currentStep == 5">
              <v-row>
                <v-col class="text-center" cols="12">
                  <h3 class="text-h4 pt-4 pb-2">
                    {{ $t("Preview") }}
                  </h3>
                  <p class="pb-4">
                    {{ $t("Please check and confirm the preview of your loyalty card") }}
                  </p>
                  <v-btn class="mb-4 mt-2" color="primary" @click="saveCampaign()" :loading="saving">
                    {{ $t("Submit") }}
                  </v-btn>
                </v-col>
                <v-col cols="12" lg="12" class="d-flex justify-center align-center">
                  
                    <PhonePreview :data="loyaltyData" :seeAll="true" />
                </v-col>
              </v-row>
            </div>
            <v-divider class="mt-3"></v-divider>
            <v-card-actions class="pt-2">
              <v-btn color="primary" @click="currentStep = currentStep - 1" :disabled="currentStep == 1">
                {{ $t('Back') }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" :disabled="!requiredFieldsFilled || currentStep === 5" @click="goToNextStep">{{ $t('Next') }}</v-btn>
            </v-card-actions>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="12" lg="4" class="lg:order-last" v-if="currentStep != 5">
            <PhonePreview :data="loyaltyData" v-if="currentStep != 3" />
            <FormPreview :data="loyaltyData" class="mt-3 pr-2" v-else />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
  <VSnackbar v-model="snackbarVisible" :color="snackbarColor" :timeout="5000" location="top right">
    {{ snackbarMessage }}
  </VSnackbar>
</template>
