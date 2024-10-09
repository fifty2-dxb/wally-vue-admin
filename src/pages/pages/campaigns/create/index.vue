<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import html2canvas from 'html2canvas';
import WallyStepHeader from '@/components/global/WallyStepHeader.vue';
import TemplateService from '@/services/TemplateService';
import { useConfigStore } from '@/@core/stores/config';
import { router } from '@/plugins/1.router';
import { useCampaignStore } from '@/stores/campaign';

declare const $wallyApi: any;

const campaignStore = useCampaignStore();
const currentStep = ref(0);
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const campaignType = ref('All');

// Removed phonePreview ref since we'll use the DOM element by ID
// const phonePreview = ref(null);

const showSnackbar = (message: string, color: string) => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
};

const steps = [
  {
    title: 'Select Template',
    icon: 'tabler-columns-1',
  },
  {
    title: 'Card Design',
    icon: 'tabler-artboard',
  },
  {
    title: 'Fields',
    icon: 'tabler-list-details',
  },
  {
    title: 'Additional Info',
    icon: 'tabler-info-square',
  },
  {
    title: 'Enrollment Form',
    icon: 'tabler-user-plus',
  },
  {
    title: 'Done',
    icon: 'tabler-square-rounded-check',
  },
];

const templates = ref(TemplateService.getTemplates());
const originalTemplates = ref(JSON.parse(JSON.stringify(templates.value)));

const filteredTemplates = ref(
  computed(() => {
    if (campaignType.value === 'All') {
      return templates.value;
    }
    return templates.value.filter((template) => template.type === campaignType.value);
  })
);

const loyaltyData = ref({
  template: templates.value[0],
});

const configStore = useConfigStore();
const saving = ref(false);

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]); // atob decodes base64
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const saveCampaign = async () => {
  const merchantId = configStore.activeMerchant?.merchantGuid;
  const appleSettings = {
    webServiceURL: 'https://dev-api.wally.ae/',
    teamIdentifier: '772239U7XT',
    sharingProhibited: false,
    passTypeIdentifier: 'pass.com.freshwallet.loyalhero',
    authenticationToken: 'Lu@ByGo9G6QMepMKQxA4',
    associatedStoreIdentifiers: [],
  };
  const postBody = {
    merchantGuid: merchantId,
    styleSettings: {
      type: 'stamp',
      ...loyaltyData.value.template,
      appleSettings,
    },
    validFromDt: {},
    validTillDt: {},
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
    await campaignStore.addCampaign(postBody);
    saving.value = false;

    router.push('/pages/campaigns');
    templates.value = JSON.parse(JSON.stringify(originalTemplates.value));
    loyaltyData.value = {
      template: templates.value[0],
    };
    currentStep.value = 0;
  } catch (err: any) {
    showSnackbar(err.message || 'An error occurred', 'error');
    saving.value = false;
  }
};

onBeforeMount(() => {
  templates.value = JSON.parse(JSON.stringify(originalTemplates.value));
  loyaltyData.value = {
    template: templates.value[0],
  };
  currentStep.value = 0;
});



</script>

<template>
  <div
    class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6"
  >
    <div class="d-flex flex-column justify-center">
      <h4 class="text-h4 font-weight-medium">
        {{ $t('Create Campaign') }}
      </h4>
      <div class="text-body-1">
        {{ $t('Create a new loyalty card campaign') }}
      </div>
    </div>
  </div>

  <VRow>
    <VCol cols="12">
      <v-card>
        <v-card-text>
          <WallyStepHeader v-model:activeTab="currentStep" :steps="steps" />
        </v-card-text>
      </v-card>
    </VCol>

    <VCol cols="12">
      <v-card>
        <v-row>
          <v-col
            cols="12"
            :lg="currentStep == 5 ? '12' : '8'"
            class="elevation-0"
          >
            <div v-if="currentStep == 0">
              <!-- Your content for step 0 -->
              <v-card
                class="elevation-0"
                title="Select Template"
                subtitle="Please select template of your campaign"
              >
                <v-container>
                  <v-row>
                    <v-col>
                      <v-card
                        rounded="lg"
                        :style="
                          campaignType == 'All'
                            ? 'border-color:rgb(var(--v-theme-primary)) !important'
                            : ''
                        "
                        :class="
                          campaignType == 'All'
                            ? 'border'
                            : 'border border-dashed elevation-0'
                        "
                        @click="campaignType = 'All'"
                      >
                        <v-card-text class="text-center py-2">
                          <div class="text-h6 font-weight-medium">
                            ALL
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col>
                      <v-card
                        rounded="lg"
                        :style="
                          campaignType == 'membership'
                            ? 'border-color:rgb(var(--v-theme-primary)) !important'
                            : ''
                        "
                        :class="
                          campaignType == 'membership'
                            ? 'border'
                            : 'border border-dashed elevation-0'
                        "
                        @click="campaignType = 'membership'"
                      >
                        <v-card-text class="text-center py-2">
                          <div class="text-h6 font-weight-medium">
                            MEMBERSHIP CARD
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col>
                      <v-card
                        rounded="lg"
                        :style="
                          campaignType == 'stamp'
                            ? 'border-color:rgb(var(--v-theme-primary)) !important'
                            : ''
                        "
                        :class="
                          campaignType == 'stamp'
                            ? 'border'
                            : 'border border-dashed elevation-0'
                        "
                        @click="campaignType = 'stamp'"
                      >
                        <v-card-text class="text-center py-2">
                          <div class="text-h6 font-weight-medium">
                            STAMP CARD
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-divider class="my-3"></v-divider>
                  <v-row>
                    <v-col cols="6" lg="3" v-for="template in filteredTemplates">
                      <v-card
                        @click="loyaltyData.template = template"
                        rounded="lg"
                        :style="
                          loyaltyData.template == template
                            ? 'border-color:rgb(var(--v-theme-primary)) !important'
                            : ''
                        "
                        :class="
                          loyaltyData.template == template
                            ? 'border'
                            : 'border border-dashed elevation-0'
                        "
                      >
                        <v-img :src="template.image" alt="" width="100%"></v-img>
                        <v-card-text class="text-center">
                          <div class="text-h6 font-weight-medium">
                            {{ template.name }}
                          </div>
                          <div class="text-subtitle-2 font-weight-thin">
                            {{ template.description }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </div>
            <div v-if="currentStep == 1">
              <CardDesign v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 2">
              <CardFields v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 3">
              <CardAdditional v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 4">
              <EnrollmentForm v-model="loyaltyData" />
            </div>
            <div v-if="currentStep == 5">
              <v-row>
                <v-col class="text-center" cols="12">
                  <h3 class="text-h4 pt-4 pb-2">
                    {{ $t('Preview') }}
                  </h3>
                  <p class="pb-4">
                    {{
                      $t(
                        'Please check and confirm the preview of your loyalty card '
                      )
                    }}
                  </p>
                  <v-btn
                    class="mb-4 mt-2"
                    color="primary"
                    @click="saveCampaign()"
                    :loading="saving"
                  >
                    {{ $t('Submit') }}
                  </v-btn>
                </v-col>
                <v-col
                  cols="12"
                  lg="12"
                  class="d-flex justify-center align-center"
                >
                  
                    <PhonePreview
                      :data="loyaltyData"
                      :seeAll="true"
                    />
                </v-col>
              </v-row>
            </div>
            <v-divider class="mt-3"></v-divider>
            <v-card-actions class="pt-2">
              <v-btn
                color="primary"
                @click="currentStep = currentStep - 1"
                :disabled="currentStep == 0"
              >
                {{ $t('Back') }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="currentStep = currentStep + 1"
                :disabled="currentStep == 5"
              >
                {{ $t('Next') }}
              </v-btn>
            </v-card-actions>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col
            cols="12"
            lg="4"
            class="lg:order-last"
            v-if="currentStep != 5"
          >
            <PhonePreview :data="loyaltyData" v-if="currentStep != 4" />
            <FormPreview :data="loyaltyData" class="mt-3 pr-2" v-else />
          </v-col>
        </v-row>
      </v-card>
    </VCol>
  </VRow>
  <VSnackbar
    v-model="snackbarVisible"
    :color="snackbarColor"
    :timeout="5000"
    location="top right"
  >
    {{ snackbarMessage }}
  </VSnackbar>
</template>
